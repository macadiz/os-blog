import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, tap } from "rxjs/operators";
import { environment } from "../../../environments/environment";

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
      // Since we're using a mock backend, immediately set a mock user when token exists
      // In a real app, you would make an API call here to validate the token
      const mockUser: User = {
        id: "1",
        email: "admin@example.com",
        username: "admin",
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN" as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.currentUserSubject.next(mockUser);
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
    localStorage.removeItem("access_token");
    this.currentUserSubject.next(null);
    this.router.navigate(["/blog"]);
  }

  getToken(): string | null {
    return localStorage.getItem("access_token");
  }

  private setToken(token: string): void {
    localStorage.setItem("access_token", token);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): Observable<User> {
    // This would typically be an API endpoint to get current user info
    // For now, we'll return a mock response based on token existence
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    // Mock response - in real app, this would be an API call
    return of({
      id: "1",
      email: "admin@example.com",
      username: "admin",
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN" as const,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
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
