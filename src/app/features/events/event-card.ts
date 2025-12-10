import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiCard } from '../../shared/ui-card';

@Component({
  selector: 'app-event-card',
  imports: [DatePipe, RouterLink, NgOptimizedImage, UiCard],
  template: `
    <app-ui-card>
      <!-- TODO: Add Image -->
      <div card-header class="relative h-48 w-full bg-gray-200">
        <img
          [ngSrc]="image()"
          width="500"
          height="200"
          priority
          class="object-cover w-full h-full max-h-full max-w-full"
          alt="Event thumbnail"
        />
      </div>

      <div class="p-6">
        <div class="flex justify-between items-center mt-4">
          <!-- TODO Mod 1: Add Date using DatePipe -->
          <p class="text-sm text-blue-600 font-semibold mb-2">
            {{ (date() | date: 'mediumDate') || 'TBA' }}
          </p>

          <!-- The Badge -->
          @let days = daysUntil();
          @if (days !== null) {
            <div
              class="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm"
            >
              @if (days > 0) {
                In {{ days }} Days
              } @else {
                Happening Now!
              }
            </div>
          }
        </div>

        <!-- TODO Mod 1: Add Title Input -->
        <h3 class="text-xl font-bold text-gray-800 my-2">
          {{ title() }}
        </h3>

        <div class="flex justify-between items-center mt-4">
          <button
            (click)="toggleFavorite()"
            [class.text-red-500]="isFavorite()"
            class="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            {{ isFavorite() ? '♥' : '♡' }} Like
          </button>

          <!-- TODO Mod 1: Add Output -->
          <button
            (click)="removeEvent()"
            class="text-gray-400 text-sm hover:text-gray-600 cursor-pointer"
          >
            Remove
          </button>
        </div>
      </div>

      <div card-footer class="mt-4 pt-4 border-t border-gray-100 text-right">
        <a
          [routerLink]="['/event', id()]"
          class="text-blue-600 font-medium hover:underline cursor-pointer"
        >
          View Details →
        </a>
      </div>
    </app-ui-card>
  `,
})
export class EventCard {
  readonly id = input.required<string>();

  title = input.required<string>();
  image = input.required<string>();
  date = input<string>(); // Optional, returns Signal<string | undefined>
  delete = output<void>();

  initialLike = input(false);

  daysUntil = computed(() => {
    const eventDate = this.date();
    if (!eventDate) return null;

    const today = new Date();
    const target = new Date(eventDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  });

  // 2. State that defaults to the input value, but can change
  isFavorite = linkedSignal(() => this.initialLike());

  toggleFavorite() {
    // 3. Update the signal based on previous value
    this.isFavorite.update((val) => !val);
  }

  removeEvent() {
    this.delete.emit();
  }
}
