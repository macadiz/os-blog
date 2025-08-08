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
      if (!response.isSetup) {
        // Blog is not set up, redirect to setup
        router.navigate(["/setup"]);
        return false;
      }

      // If user is authenticated but not valid, log them out
      if (authService.isAuthenticated() && !response.currentUserValid) {
        console.warn("Current user is no longer valid, logging out...");
        authService.logout();
        // Don't redirect to setup, let the route handle where to go
      }

      return true; // Blog is set up, allow access
    }),
    catchError((error) => {
      console.error("Error checking blog setup status:", error);

      // Differentiate between setup-related errors and general API errors
      // If it's a 404, it might indicate the blog is not properly set up
      if (error.status === 404) {
        // 404 might indicate setup is needed
        router.navigate(["/setup"]);
        return of(false);
      }

      // For 500 errors or network issues, it's likely an API problem
      // Redirect to API error page instead of setup
      if (error.status === 500 || error.status === 0 || !error.status) {
        router.navigate(["/api-error"]);
        return of(false);
      }

      // For other errors (network issues, temporary server problems, etc.),
      // allow the route to load and let individual components handle the error
      // This allows the blog unavailable component to show instead of setup
      console.warn(
        "API error detected, allowing route to handle error display"
      );

      // If there's an authentication error and user is logged in, log them out
      if (error.status === 401 && authService.isAuthenticated()) {
        console.warn("Authentication error detected, logging out...");
        authService.logout();
      }

      return of(true); // Allow route to load and handle error display
    })
  );
};
