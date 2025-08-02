import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { map, take } from "rxjs/operators";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map((user) => {
      // Check if user is authenticated either by having a user object or a valid token
      if ((user && user.isActive) || authService.isAuthenticated()) {
        return true;
      } else {
        router.navigate(["/login"]);
        return false;
      }
    })
  );
};
