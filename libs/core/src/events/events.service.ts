import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ReserveSpotDto } from './dto/reserve-spot.dto';
import { Prisma, SpotStatus, TicketStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsReservationError } from './exception-filter/events-reservaton.error';

@Injectable()
export class EventsService {
  constructor(private prismaService: PrismaService) {}

  create(createEventDto: CreateEventDto) {
    if (
      !createEventDto.name ||
      createEventDto.name.length === 0 ||
      createEventDto.name.length > 255
    ) {
      throw new Error('Name must be between 1 and 255 characters');
    }
    if (
      !createEventDto.description ||
      createEventDto.description.length === 0 ||
      createEventDto.description.length > 255
    ) {
      throw new Error('Description must be between 1 and 255 characters');
    }
    if (!createEventDto.date || !new Date(createEventDto.date).getTime()) {
      throw new Error('Invalid ISO8601 date');
    }
    if (!createEventDto.price || createEventDto.price < 0) {
      throw new Error('Price must be a non-negative number');
    }
    return this.prismaService.event.create({
      data: {
        ...createEventDto,
        date: new Date(createEventDto.date),
      },
    });
  }

  findAll() {
    return this.prismaService.event.findMany();
  }

  findOne(id: string) {
    return this.prismaService.event.findUnique({
      where: { id },
    });
  }

  update(id: string, updateEventDto: UpdateEventDto) {
    return this.prismaService.event.update({
      data: {
        ...updateEventDto,
        date: new Date(updateEventDto.date),
      },
      where: { id },
    });
  }

  remove(id: string) {
    return this.prismaService.event.delete({
      where: { id },
    });
  }

  async reserveSpot(dto: ReserveSpotDto & { eventId: string }) {
    if (!dto.spots || dto.spots.length === 0) {
      throw new EventsReservationError('Spots must be a non-empty array');
    }
    if (!dto.ticket_kind || dto.ticket_kind.length === 0) {
      throw new EventsReservationError(
        'Ticket kind must be a non-empty string',
      );
    }
    if (dto.ticket_kind !== 'full' && dto.ticket_kind !== 'half') {
      throw new EventsReservationError("Ticket kind must be 'full' or 'half'");
    }
    const spots = await this.prismaService.spot.findMany({
      where: {
        eventId: dto.eventId,
        name: {
          in: dto.spots,
        },
      },
    });
    if (spots.length !== dto.spots.length) {
      const foundSpotsName = spots.map((spot) => spot.name);
      const notFoundSpotsName = dto.spots.filter(
        (spotName) => !foundSpotsName.includes(spotName),
      );
      throw new EventsReservationError(
        `Spots ${notFoundSpotsName.join(', ')} not found`,
      );
    }

    try {
      const tickets = await this.prismaService.$transaction(
        async (prisma) => {
          await prisma.reservationHistory.createMany({
            data: spots.map((spot) => ({
              spotId: spot.id,
              ticketKind: dto.ticket_kind,
              email: dto.email,
              status: TicketStatus.reserved,
            })),
          });

          await prisma.spot.updateMany({
            where: {
              id: {
                in: spots.map((spot) => spot.id),
              },
            },
            data: {
              status: SpotStatus.reserved,
            },
          });

          const tickets = await Promise.all(
            spots.map((spot) =>
              prisma.ticket.create({
                data: {
                  spotId: spot.id,
                  ticketKind: dto.ticket_kind,
                  email: dto.email,
                },
                include: {
                  Spot: true,
                },
              }),
            ),
          );

          return tickets;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
      );
      return tickets;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        switch (e.code) {
          case 'P2002': // unique constraint violation
          case 'P2034': // transaction conflict
            throw new EventsReservationError('Some spots are already reserved');
        }
      }
      throw e;
    }
  }
}
