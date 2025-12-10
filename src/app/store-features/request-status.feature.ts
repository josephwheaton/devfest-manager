// src/app/core/store-features/request-status.feature.ts
import { signalStoreFeature, withComputed, withState } from '@ngrx/signals';

export type RequestStatus = 'idle' | 'pending' | 'fulfilled' | { error: string };
export type RequestStatusState = { requestStatus: RequestStatus };

export function withRequestStatus() {
  return signalStoreFeature(
    withState<RequestStatusState>({ requestStatus: 'idle' }),
    withComputed(({ requestStatus }) => ({
      isPending: () => requestStatus() === 'pending',
      isFulfilled: () => requestStatus() === 'fulfilled',
      error: () => {
        // typescript not aware of the type here, can't tell it's a signal
        const status = requestStatus();
        return typeof status === 'object' ? status.error : null;
      },
    })),
  );
}

// Helpers for state updates
export function setPending(): RequestStatusState {
  return { requestStatus: 'pending' };
}
export function setFulfilled(): RequestStatusState {
  return { requestStatus: 'fulfilled' };
}
export function setError(error: string): RequestStatusState {
  return { requestStatus: { error } };
}
