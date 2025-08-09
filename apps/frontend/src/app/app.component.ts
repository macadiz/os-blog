import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet, Router, NavigationEnd } from "@angular/router";
import { HeaderComponent } from "./shared/components/header/header.component";
import { ApiService } from "./core/services/api.service";
import { AuthService } from "./core/services/auth.service";
import { TitleService } from "./core/services/title.service";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: "./app.component.html",
  styles: [],
})
export class AppComponent implements OnInit {
  showHeader = false;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private titleService: TitleService,
    private router: Router
  ) {}

  ngOnInit() {
    // Wait for auth initialization before checking blog setup
    this.initializeApp();

    // Listen to route changes to update header visibility and page titles
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateHeaderVisibility();
        this.updatePageTitle();
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
        console.warn("Blog setup check failed:", error);

        // Don't show header if setup check fails
        this.showHeader = false;

        const currentUrl = this.router.url;
        const isAdminRoute = currentUrl.startsWith("/admin");

        // Only handle auth errors specifically for admin routes
        if (
          isAdminRoute &&
          error.status === 401 &&
          this.authService.isAuthenticated()
        ) {
          this.authService.logout();
          this.router.navigate(["/login"]);
          return;
        }

        // For severe API errors (500, network issues), redirect to API error page
        if (error.status === 500 || error.status === 0 || !error.status) {
          this.router.navigate(["/api-error"]);
          return;
        }

        // For blog routes, let the components handle the error display
        // Only redirect to setup if it's clearly a setup issue (404)
        if (error.status === 404 && !currentUrl.startsWith("/blog")) {
          this.router.navigate(["/setup"]);
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

  private updatePageTitle() {
    const currentUrl = this.router.url;

    // Set appropriate title based on current route
    if (currentUrl === "/blog" || currentUrl === "/") {
      // Blog homepage - title service will handle this with blog settings
      this.titleService.setBlogTitle();
    } else if (currentUrl.startsWith("/admin")) {
      // Admin pages - let admin layout handle specific titles
      // or set a general admin title
      this.titleService.setCustomTitle("Admin");
    } else if (currentUrl.startsWith("/setup")) {
      this.titleService.setCustomTitle("Setup");
    } else if (currentUrl.startsWith("/login")) {
      this.titleService.setCustomTitle("Login");
    }
    // Individual blog posts will set their own titles in the blog-post component
  }
}
