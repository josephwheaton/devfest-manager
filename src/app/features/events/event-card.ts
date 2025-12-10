import { DatePipe, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-event-card',
  imports: [DatePipe, RouterLink, NgOptimizedImage],
  template: `
    <div
      class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div class="relative h-48 w-full bg-gray-200">
        <img
          [ngSrc]="image()"
          width="500"
          height="200"
          priority
          class="object-cover"
          alt="Event thumbnail"
        />
      </div>

      <div class="p-6">
        <div class="flex justify-between items-center mt-4">
          <!-- TODO Mod 1: Add Date using DatePipe -->
          <p class="text-sm text-blue-600 font-semibold mb-2">
            {{ (date() | date: 'mediumDate') || 'TBA' }}
          </p>

          @let days = daysUntil();
          @if (days != null) {
            <div
              class="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm"
            >
              @if (days > 0) {
                In {{ days }} Days
              } @else if (days < 0) {
                Past Event
              } @else {
                Happening Now!
              }
            </div>
          }
        </div>

        <h3 class="text-xl font-bold text-gray-800 my-2">{{ title() }}</h3>

        <div class="flex justify-between items-center mt-4">
          <button
            (click)="toggleFavorite()"
            [class.text-red-500]="isFavorite()"
            class="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            {{ isFavorite() ? '♥' : '♡' }} Like
          </button>

          <button
            (click)="removeEvent()"
            class="text-gray-400 text-sm hover:text-gray-600 cursor-pointer"
          >
            Remove
          </button>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-100 text-right">
          <a
            class="text-blue-600 font-medium hover:underline cursor-pointer"
            [routerLink]="['/event', id()]"
          >
            View Details →
          </a>
        </div>
      </div>
    </div>
  `,
})
export class EventCard {
  // TODO Mod 1: Implement input(), output(), and model()
  title = input.required<string>();
  image = input.required<string>();
  date = input<string>();
  id = input.required<string>();
  initialLike = input(false);
  delete = output<void>();

  isFavorite = linkedSignal(() => this.initialLike());

  daysUntil = computed(() => {
    const eventDate = this.date();
    if (!eventDate) return null;
    const today = new Date();
    const target = new Date(eventDate);
    // time in milliseconds
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  });

  toggleFavorite() {
    this.isFavorite.update((val) => !val);
  }

  removeEvent() {
    this.delete.emit();
  }
}
