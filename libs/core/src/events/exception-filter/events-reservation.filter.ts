import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { EventsReservationError } from './events-reservaton.error';

@Catch(EventsReservationError)
export class EventsReservationExceptionFilter implements ExceptionFilter {
  catch(exception: EventsReservationError, host: ArgumentsHost) {
    const httpStatus = HttpStatus.BAD_REQUEST;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    response.status(httpStatus).json({
      message: exception.message,
    });
  }
}
