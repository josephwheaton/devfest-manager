import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

// todo: implement ngoptimizedimage
@Component({
  selector: 'app-venue-map',
  imports: [NgOptimizedImage],
  template: `
    <div class="h-140 bg-gray-200 rounded mb-4 overflow-hidden relative">
      <img [src]="'/images/venue-map.png'" class="w-full h-full object-cover" />
    </div>
  `,
})
export class VenueMap {}
