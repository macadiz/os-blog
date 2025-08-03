import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { ApiService } from "../services/api.service";
import { map, catchError } from "rxjs/operators";
import { of } from "rxjs";

export const blogSetupGuard: CanActivateFn = (route, state) => {
  const apiService = inject(ApiService);
  const router = inject(Router);

  return apiService.checkSetupRequired().pipe(
    map((response) => {
      if (response.required) {
        // Setup is required, redirect to setup
        router.navigate(["/setup"]);
        return false;
      }
      return true; // Blog is set up, allow access
    }),
    catchError(() => {
      // If API call fails, allow access but let the component handle the error
      return of(true);
    })
  );
};
