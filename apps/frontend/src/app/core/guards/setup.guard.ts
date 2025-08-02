import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { map, catchError } from "rxjs/operators";
import { of } from "rxjs";

export const setupGuard: CanActivateFn = (route, state) => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return http.get<{ setupRequired: boolean }>("/api/setup/status").pipe(
    map((response) => {
      if (response.setupRequired) {
        return true; // Allow access to setup page
      } else {
        router.navigate(["/blog"]);
        return false;
      }
    }),
    catchError(() => {
      // If API call fails, assume setup is needed
      return of(true);
    })
  );
};
