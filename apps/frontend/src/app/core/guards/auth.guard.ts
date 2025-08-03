import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { ApiService } from "../services/api.service";
import { map, take, catchError } from "rxjs/operators";
import { of, switchMap } from "rxjs";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const apiService = inject(ApiService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    switchMap((user) => {
      // If not authenticated at all, redirect to login
      if (!authService.isAuthenticated()) {
        router.navigate(["/login"]);
        return of(false);
      }

      // If authenticated, validate with blog setup status (which includes user validation)
      return apiService.checkBlogSetup().pipe(
        map((status) => {
          // If current user is not valid, log them out and redirect
          if (!status.currentUserValid) {
            console.warn("Current user validation failed, logging out...");
            authService.logout();
            router.navigate(["/login"]);
            return false;
          }

          return true; // User is valid
        }),
        catchError((error) => {
          console.error("Error validating user authentication:", error);
          // On error, log out user and redirect to login for safety
          authService.logout();
          router.navigate(["/login"]);
          return of(false);
        })
      );
    })
  );
};
