import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { TICKETS_URL } from './tokens';

interface TicketEntry {
  id: string;
  eventId: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly ticketsUrl = inject(TICKETS_URL);

  private readonly ticketIds = signal<string[]>([]);

  readonly count = () => this.ticketIds().length;

  constructor() {
    this.loadTickets();
  }

  private loadTickets(): void {
    this.http.get<TicketEntry[]>(this.ticketsUrl).subscribe({
      next: (data) => {
        const ids = data.map((t) => t.eventId);
        this.ticketIds.set(ids);
      },
    });
  }

  addTicket(eventId: string) {
    const previousIds = this.ticketIds();

    this.ticketIds.update((ids) => [...ids, eventId]);

    // here is a little pattern to follow if you do optimistic updates
    this.http.post(this.ticketsUrl, { eventId }).subscribe({
      next: () => console.log('All good, optimistic update was successful'),
      error: (e) => {
        console.error(`Sync failed for ${eventId}`);
        this.ticketIds.set(previousIds);
      },
    });
  }
}
