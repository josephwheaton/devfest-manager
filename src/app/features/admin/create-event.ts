import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DevFestEvent } from '../../models/event.model';
import { debounce, disabled, Field, form, minLength, required } from '@angular/forms/signals';
import { EventsService } from '../../core/events.service';
import { Router } from '@angular/router';

interface CreateEventForm extends Omit<DevFestEvent, 'id'> {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-create-event',
  imports: [Field],
  template: `
    <div class="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Create New Event</h2>

      <form (submit)="onSubmit($event)" class="space-y-6">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Event Title</label>

          <!-- BINDING: Use [field] pointing to the form tree property -->
          <input
            [field]="form.title"
            type="text"
            class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. Angular Workshop"
          />

          <!-- ERROR HANDLING: Check touched() AND invalid() signals -->
          @if (form.title().touched() && form.title().invalid()) {
            <p class="text-red-500 text-sm mt-1">{{ form.title().errors()[0].message }}</p>
          }
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            [field]="form.description"
            rows="3"
            class="w-full px-4 py-2 border rounded-md outline-none"
          ></textarea>

          @if (form.description().touched() && form.description().invalid()) {
            <p class="text-red-500 text-sm mt-1">{{ form.description().errors()[0].message }}</p>
          }
        </div>

        <!-- Date & Location -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label>Date</label>
            <input
              [field]="form.date"
              type="datetime-local"
              class="w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label>Location</label>
            <input [field]="form.location" type="text" class="w-full px-4 py-2 border rounded-md" />
          </div>
        </div>

        <!-- (Speakers Array Next) -->
        <div class="border-t border-gray-100 pt-4">
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium text-gray-700">Speakers</label>
            <button
              type="button"
              (click)="addSpeaker()"
              class="text-sm text-blue-600 hover:underline"
            >
              + Add Speaker
            </button>
          </div>

          <div class="space-y-2">
            <!-- Iterate over the SOURCE data to get the index -->
            @for (speaker of eventData().speakers; track $index) {
              <div class="flex gap-2">
                <!-- Bind to form.speakers[index] -->
                <input
                  [field]="form.speakers[$index]"
                  type="text"
                  placeholder="Speaker Name"
                  class="flex-1 px-4 py-2 border rounded-md"
                />

                <button type="button" (click)="removeSpeaker($index)" class="text-red-500 px-2">
                  ✕
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-4 pt-4">
          <button type="button" class="px-4 py-2 text-gray-600">Cancel</button>

          <!-- Form-Level Validity: form().invalid() -->
          <button
            type="submit"
            [disabled]="form().invalid()"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  `,
})
export class CreateEvent {
  readonly eventsService = inject(EventsService);
  readonly router = inject(Router);
  // TODO Mod 4: form = form(...)
  readonly eventData = signal<CreateEventForm>({
    title: '',
    description: '',
    date: new Date().toISOString().slice(0, 16),
    location: '',
    speakers: [],
    image: '/images/event4.png',
  });

  readonly title = this.eventData().title;

  readonly form = form(this.eventData, (root) => {
    required(root.title, { message: 'Title is required' });
    debounce(root.description, 1000); // contrived example
    disabled(root.description, ({ valueOf }) => !valueOf(root.title)); // multi/cross dependency
    required(root.description, { message: 'Description is required' });
    minLength(root.description, 10, { message: 'Description must be at least 10 characters' });
    required(root.date, { message: 'Date is required' });
    required(root.location, { message: 'Location is required' });
    // required(root.speakers, { message: 'Speakers are required' });
  });

  addSpeaker() {
    this.eventData.update((current) => ({
      ...current,
      speakers: [...current.speakers, ''],
    }));
  }

  removeSpeaker(index: number) {
    this.eventData.update((current) => ({
      ...current,
      speakers: [
        ...current.speakers.filter((_, iterationIndex) => iterationIndex === index),
        // ...current.speakers.slice(0, index),
        // ...current.speakers.slice(index + 1, current.speakers.length),
      ],
    }));
  }

  onSubmit(event: SubmitEvent) {
    event?.preventDefault(); // prevent default submission behavior

    if (this.form().invalid()) {
      return;
    }

    const payload = this.eventData();

    this.eventsService.createEvent(payload).subscribe({
      next: () => {
        alert('Event created successfully');
        this.router.navigate(['/']);
      },
      error: (e) => {
        console.error(e);
      },
    });
  }
}
