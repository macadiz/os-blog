import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet, Router, NavigationEnd } from "@angular/router";
import { HeaderComponent } from "./shared/components/header/header.component";
import { ApiService } from "./core/services/api.service";
import { AuthService } from "./core/services/auth.service";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header *ngIf="showHeader"></app-header>
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  title = "Open Blog";
  showHeader = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Wait for auth initialization before checking blog setup
    this.initializeApp();

    // Listen to route changes to update header visibility
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateHeaderVisibility();
      });
  }

  private async initializeApp() {
    // Wait for auth service to initialize first
    await this.authService.waitForInitialization();

    // Now check blog setup status
    this.checkBlogSetup();
  }

  private checkBlogSetup() {
    this.apiService.checkBlogSetup().subscribe({
      next: (status) => {
        // Show header only if blog is set up
        this.showHeader = status.isSetup;

        // Only check user validity if we're on admin routes and have a token
        const currentUrl = this.router.url;
        const isAdminRoute = currentUrl.startsWith("/admin");
        const hasToken = !!this.authService.getToken();

        if (isAdminRoute && hasToken && !status.currentUserValid) {
          this.authService.logout();
          this.router.navigate(["/setup"]);
        }
      },
      error: (error) => {
        this.showHeader = false;

        // Only log out if we're on admin routes and there's a clear auth error
        const currentUrl = this.router.url;
        const isAdminRoute = currentUrl.startsWith("/admin");

        if (
          isAdminRoute &&
          this.authService.isAuthenticated() &&
          error.status === 401
        ) {
          this.authService.logout();
        }
      },
    });
  }

  private async updateHeaderVisibility() {
    const currentUrl = this.router.url;

    // Hide header on setup page regardless of setup status
    if (currentUrl.startsWith("/setup")) {
      this.showHeader = false;
      return;
    }

    // Wait for auth initialization before checking setup
    await this.authService.waitForInitialization();

    // For other pages, check blog setup status
    this.checkBlogSetup();
  }
}
