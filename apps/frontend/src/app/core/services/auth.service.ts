import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, tap } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { STORAGE_KEYS } from "../../shared/constants";

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: "ADMIN" | "AUTHOR";
  isActive: boolean;
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
  private baseUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check for existing token on service initialization
    this.checkExistingAuth();
  }

  private checkExistingAuth() {
    const token = this.getToken();
    if (token) {
      // Validate token and get current user from backend
      this.getCurrentUser().subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
        },
        error: (error) => {
          console.error("Failed to validate token:", error);
          // Token is invalid, remove it and logout
          this.logout();
        },
      });
    }
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
        }),
        catchError((error) => {
          console.error("Login failed:", error);
          throw error;
        })
      );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    this.currentUserSubject.next(null);
    this.router.navigate(["/blog"]);
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  private setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): Observable<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    return this.http.get<User>(`${this.baseUrl}/auth/me`);
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
}
