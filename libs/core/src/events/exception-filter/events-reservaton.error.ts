export class EventsReservationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EventsReservationError';
  }
}
