import { Component, inject, signal } from '@angular/core';
import { EventCard } from './event-card';
import { SearchBar } from './search-bar';
import { EventsService } from '../../core/events.service';

@Component({
  selector: 'app-event-list',
  imports: [EventCard, SearchBar],
  template: `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Upcoming Events</h1>
      <app-search-bar [(query)]="searchQuery" />
    </div>

    <!-- TODO Mod 2: Wrap in @if (events.isLoading()) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- TODO Mod 2: Use @for to iterate over resource -->

      <!-- Static Placeholders for initial verify -->
      @if (events.error()) {
        <div class="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          Failed to load events. Is the server running?
        </div>
      }

      @if (events.isLoading()) {
        <div class="text-center py-12 text-gray-500 animate-pulse">Loading events...</div>
      }

      @if (events.hasValue()) {
        @for (event of events.value(); track event.id) {
          <app-event-card
            [title]="event.title"
            [image]="event.image"
            [id]="event.id"
            [date]="event.date"
            (delete)="deleteEvent(event.id)"
          />
        } @empty {
          <p class="col-span-3 text-center text-gray-500">No events found.</p>
        }
      }
    </div>
  `,
})
export class EventList {
  readonly eventsService = inject(EventsService);

  readonly console = console; // popular technique for also bringing enums to the template
  searchQuery = signal('');
  // TODO Mod 2: Inject Service and use resource()
  readonly events = this.eventsService.getEventsResource(this.searchQuery);

  deleteEvent(id: string) {
    if (!confirm('Are you sure?')) return;

    this.eventsService.deleteEvent(id).subscribe({
      next: () => {
        this.events.reload();
      },
      error: (err) => {
        console.error('Delete failed', err);
        alert('Could not delete event');
      },
    });
  }
}
