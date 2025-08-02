import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { CanActivateFn } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { map, take } from "rxjs/operators";

export const roleGuard = (
  requiredRoles: ("ADMIN" | "AUTHOR")[]
): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.currentUser$.pipe(
      take(1),
      map((user) => {
        if (!user) {
          router.navigate(["/login"]);
          return false;
        }

        if (requiredRoles.includes(user.role)) {
          return true;
        }

        // User doesn't have required role, redirect to blog
        router.navigate(["/blog"]);
        return false;
      })
    );
  };
};
