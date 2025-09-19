import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, tap, map } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { STORAGE_KEYS } from "../../shared/constants";
import { resolveBaseUrl } from "../utils/url-resolver.util";

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: "ADMIN" | "AUTHOR";
  isActive: boolean;
  isTemporaryPassword?: boolean;
  mustChangePassword?: boolean;
  lastLoginAt?: Date;
  passwordResetAt?: Date;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private baseUrl = resolveBaseUrl();
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check for existing token on service initialization
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = new Promise((resolve) => {
      const token = this.getToken();
      if (token) {
        // Validate token and get current user from backend
        this.getCurrentUser().subscribe({
          next: (user) => {
            this.currentUserSubject.next(user);
            this.isInitialized = true;
            resolve();
          },
          error: () => {
            // Token is invalid, remove it
            this.clearAuthData();
            this.isInitialized = true;
            resolve();
          },
        });
      } else {
        this.isInitialized = true;
        resolve();
      }
    });

    return this.initializationPromise;
  }

  private checkExistingAuth() {
    // This method is now replaced by initializeAuth
    this.initializeAuth();
  }

  private clearAuthData(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    this.currentUserSubject.next(null);
  }

  // Method to wait for initialization to complete
  async waitForInitialization(): Promise<void> {
    if (this.isInitialized) {
      return Promise.resolve();
    }
    return this.initializeAuth();
  }

  login(credentials: {
    username: string;
    password: string;
  }): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          this.setToken(response.access_token);
          this.currentUserSubject.next(response.user);

          // Check if user must change password
          if (response.user.mustChangePassword) {
            // Redirect to password change page
            this.router.navigate(["/change-password"]);
          }
        }),
        catchError((error) => {
          throw error;
        })
      );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(["/blog"]);
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  private setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  isAuthenticated(): boolean {
    const hasToken = !!this.getToken();
    const hasUser = !!this.currentUserSubject.value;
    const result = hasToken && (hasUser || !this.isInitialized);
    return result;
  }

  getCurrentUser(): Observable<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    return this.http
      .get<{
        statusCode: number;
        message: string;
        data: User;
      }>(`${this.baseUrl}/users/profile`)
      .pipe(
        map((response) => response.data), // Extract the user data from the API response format
        catchError((error) => {
          throw error;
        })
      );
  }

  hasRole(role: "ADMIN" | "AUTHOR"): Observable<boolean> {
    return new Observable((observer) => {
      this.currentUser$.subscribe((user) => {
        observer.next(user?.role === role);
      });
    });
  }

  hasAnyRole(roles: ("ADMIN" | "AUTHOR")[]): Observable<boolean> {
    return new Observable((observer) => {
      this.currentUser$.subscribe((user) => {
        observer.next(user ? roles.includes(user.role) : false);
      });
    });
  }

  mustChangePassword(): Observable<boolean> {
    return new Observable((observer) => {
      this.currentUser$.subscribe((user) => {
        observer.next(user?.mustChangePassword === true);
      });
    });
  }

  getCurrentUserSync(): User | null {
    return this.currentUserSubject.value;
  }
}
