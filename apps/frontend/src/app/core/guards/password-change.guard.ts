import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

/**
 * Guard that redirects users to change password if they have mustChangePassword flag set
 * This prevents access to other parts of the application until password is changed
 */
export const passwordChangeGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUserSync();
  const mustChangePassword = user?.mustChangePassword === true;

  // If user must change password and trying to access anything other than change-password
  if (mustChangePassword && state.url !== "/change-password") {
    router.navigate(["/change-password"]);
    return false;
  }

  // If user doesn't need to change password and trying to access change-password page
  if (!mustChangePassword && state.url === "/change-password") {
    // Redirect based on user role
    if (user?.role === "ADMIN") {
      router.navigate(["/admin"]);
    } else {
      router.navigate(["/blog"]);
    }
    return false;
  }

  return true;
};
