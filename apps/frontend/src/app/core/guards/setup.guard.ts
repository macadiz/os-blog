import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { ApiService } from "../services/api.service";
import { map, catchError } from "rxjs/operators";
import { of } from "rxjs";

export const setupGuard: CanActivateFn = (route, state) => {
  const apiService = inject(ApiService);
  const router = inject(Router);

  return apiService.checkBlogSetup().pipe(
    map((response) => {
      if (!response.isSetup) {
        return true; // Allow access to setup page when setup is required
      } else {
        router.navigate(["/blog"]);
        return false; // Redirect to blog if setup is already complete
      }
    }),
    catchError((error) => {
      console.error("Setup guard: API error detected", error);

      // If the API is completely unavailable, redirect to error page
      // This handles cases where someone goes directly to /setup but the API is down
      router.navigate(["/api-error"]);
      return of(false);
    })
  );
};
