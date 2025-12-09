import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (isAdmin) {
    return true;
  }

  alert('No access here !!!');
  return router.createUrlTree(['/']);
};
