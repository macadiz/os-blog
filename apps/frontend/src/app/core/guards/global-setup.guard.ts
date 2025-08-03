import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { ApiService } from "../services/api.service";
import { AuthService } from "../services/auth.service";
import { map, catchError } from "rxjs/operators";
import { of } from "rxjs";

export const globalSetupGuard: CanActivateFn = (route, state) => {
  const apiService = inject(ApiService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Allow access to setup route without checking
  if (state.url.startsWith("/setup")) {
    return true;
  }

  return apiService.checkBlogSetup().pipe(
    map((response) => {
      // Check if blog setup is complete AND current user is valid
      if (!response.isSetup || !response.currentUserValid) {
        // If user is authenticated but not valid, log them out
        if (authService.isAuthenticated() && !response.currentUserValid) {
          console.warn("Current user is no longer valid, logging out...");
          authService.logout();
        }

        // Redirect to setup
        router.navigate(["/setup"]);
        return false;
      }

      return true; // Blog is set up and user is valid
    }),
    catchError((error) => {
      console.error("Error checking blog setup status:", error);

      // If there's an authentication error and user is logged in, log them out
      if (authService.isAuthenticated()) {
        console.warn("Authentication error detected, logging out...");
        authService.logout();
      }

      // Redirect to setup to be safe
      router.navigate(["/setup"]);
      return of(false);
    })
  );
};
