import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const user = await auth.waitForAuth();
    if (!user) {
      router.navigate(['/login']);
      return false;
    }
    if (allowedRoles.includes(user.role)) {
      return true;
    }
    // Redirect to their own dashboard
    auth.navigateByRole(user.role);
    return false;
  };
};
