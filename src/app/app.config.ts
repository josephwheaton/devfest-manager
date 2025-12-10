import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { API_URL } from './core/tokens';
import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    // Day 1: Zone.js enabled. Day 2: switch to provideZonelessChangeDetection()
    provideZonelessChangeDetection(),

    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),

    // provided (rather did he mean used?) by NgOptimizedImage
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig) => {
        // remove /images/ from src
        const src = config.src.replace('/images/', '');
        return `https://static-assets.dev/cdn-cgi/image/width=${config.width},format=auto/https://storage.googleapis.com/images-cdn-e0395.firebasestorage.app/${src}`;
      },
    },

    // with fetch, hisotrically using xhr, with this option using the fetch apis
    provideHttpClient(withFetch()),
    { provide: API_URL, useValue: 'http://localhost:3000' },
    provideClientHydration(withIncrementalHydration()),
  ],
};
