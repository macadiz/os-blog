import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { map, take, catchError, switchMap } from "rxjs/operators";
import { of, from } from "rxjs";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth service initialization, then check authentication
  return from(authService.waitForInitialization()).pipe(
    switchMap(() => authService.currentUser$),
    take(1),
    map((user) => {
      // If not authenticated or no user, redirect to login
      if (!authService.isAuthenticated() || !user) {
        router.navigate(["/admin/login"]);
        return false;
      }

      return true; // User is authenticated and valid
    }),
    catchError(() => {
      router.navigate(["/admin/login"]);
      return of(false);
    })
  );
};
