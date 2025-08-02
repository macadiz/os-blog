import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { map, take } from "rxjs/operators";

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map((user) => {
      if (user && user.isActive) {
        // User is already logged in, redirect to dashboard
        router.navigate(["/admin/dashboard"]);
        return false;
      } else {
        // User is not logged in, allow access to the page
        return true;
      }
    })
  );
};
