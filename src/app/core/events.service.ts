import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { DevFestEvent } from '../models/event.model';
import { API_URL } from './tokens';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private readonly http = inject(HttpClient);

  private url = inject(API_URL);
  private apiUrl = `${this.url}/events`;

  getEventsResource(query: Signal<string>) {
    // const q = query(); // needs to be in callback below to get subsequent updates
    return httpResource<DevFestEvent[]>(() => {
      const q = query();
      return q ? `${this.apiUrl}?q=${q}` : this.apiUrl;
    });
  }

  getEventResource(id: Signal<string>) {
    return httpResource<DevFestEvent | undefined>(() => {
      const eventId = id();
      if (!eventId) return undefined;
      return `${this.apiUrl}/${eventId}`;
    });
  }

  deleteEvent(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: Omit<DevFestEvent, 'id'>) {
    return this.http.post<DevFestEvent>(this.apiUrl, event);
  }
}
