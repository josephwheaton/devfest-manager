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
      <!-- TODO Mod 1: Add SearchBar here -->
      <app-search-bar [(query)]="searchQuery" />

      <p class="text-gray-500 mt-2">Searching for: {{ searchQuery() }}</p>
    </div>

    <!-- 1. Error State -->
    @if (events.error()) {
      <div class="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
        Failed to load events. Is the server running?
      </div>
    }

    <!-- 2. Loading State -->
    @if (events.isLoading()) {
      <div class="text-center py-12 text-gray-500 animate-pulse">Loading events...</div>
    }

    <!-- 3. Data State -->
    <!-- We guard the value access with hasValue() -->
    @if (events.hasValue()) {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (event of events.value(); track event.id) {
          <app-event-card
            [title]="event.title"
            [date]="event.date"
            [image]="event.image"
            [id]="event.id"
            [trackingId]="'event_card_' + event.id"
            (delete)="deleteEvent(event.id)"
          />
        } @empty {
          <p class="col-span-3 text-center text-gray-500">No events found.</p>
        }
      </div>
    }
  `,
})
export class EventList {
  private eventsService = inject(EventsService);

  searchQuery = signal('');

  // 1. Initialize the Resource
  // We pass our signal directly to the service.
  // This creates a live connection: searchQuery -> URL -> HTTP Request -> events.value
  readonly events = this.eventsService.getEventsResource(this.searchQuery);

  deleteEvent(id: string) {
    this.eventsService.deleteEvent(id).subscribe(() => {
      this.events.reload();
    });
  }
}
