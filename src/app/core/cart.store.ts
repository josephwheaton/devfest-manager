// src/app/core/cart.store.ts
import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
  withHooks,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { TICKETS_URL } from './tokens';
import {
  setError,
  setFulfilled,
  setPending,
  withRequestStatus,
} from '../store-features/request-status.feature';
import { catchError, exhaustMap, finalize, pipe, switchMap, tap } from 'rxjs';
import { TicketEntry } from './cart.service';
import { tapResponse } from '@ngrx/operators';

type CartState = {
  ticketIds: string[];
};

export const CartStore = signalStore(
  { providedIn: 'root' },

  // 1. Initial State
  withState<CartState>({ ticketIds: [] }),

  // 2. Add Custom Feature (Gives us isPending, error, etc.)
  withRequestStatus(),

  // 3. Computed Selectors
  withComputed(({ ticketIds }) => ({
    count: () => ticketIds().length,
  })),

  // Next steps: withMethods...
  withMethods((store) => {
    const http = inject(HttpClient);
    const ticketsUrl = inject(TICKETS_URL);

    return {
      _load: rxMethod<void>(
        pipe(
          tap((v) => {
            patchState(store, setPending());
            console.log(v);
          }),
          // this is the place to control how we are calling apis
          switchMap((v) => {
            return http.get<TicketEntry[]>(ticketsUrl).pipe(
              tapResponse({
                next: (tickets) => {
                  patchState(store, { ticketIds: tickets.map((t) => t.eventId) }, setFulfilled());
                },
                error: (err: { message: string }) => {
                  patchState(store, setError(err.message));
                },
              }),
              finalize(() => {
                console.log('we did stuff');
              }),
            );
          }),
        ),
      ),
      addToCart: rxMethod<{ eventId: string }>(
        pipe(
          exhaustMap(({ eventId }) => {
            patchState(
              store,
              (state) => ({
                ticketIds: [...state.ticketIds, eventId],
              }),
              setPending(),
            );
            return http.post<void>(ticketsUrl, { eventId }).pipe(
              tapResponse({
                next: () => {
                  patchState(store, setFulfilled());
                },
                error: (err: { message: string }) => {
                  patchState(
                    store,
                    (state) => {
                      const index = state.ticketIds.lastIndexOf(eventId);
                      if (index === -1) return state;
                      // need new ref
                      const newIds = [...state.ticketIds];
                      newIds.splice(index, 1);
                      return { ticketIds: newIds };
                    },
                    setError(err.message),
                  );
                },
              }),
            );
          }),
        ),
      ),
    };
  }),
  withHooks({
    onInit(store) {
      store._load();
    },
  }),
);
