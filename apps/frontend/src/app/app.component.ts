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
    // Check blog setup status and update header visibility
    this.checkBlogSetup();

    // Listen to route changes to update header visibility
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateHeaderVisibility();
      });
  }

  private checkBlogSetup() {
    this.apiService.checkBlogSetup().subscribe({
      next: (status) => {
        // Show header only if blog is set up AND current user is valid
        this.showHeader = status.isSetup && status.currentUserValid;

        // If user is authenticated but not valid, log them out
        if (this.authService.isAuthenticated() && !status.currentUserValid) {
          console.warn("Current user is no longer valid, logging out...");
          this.authService.logout();
          this.router.navigate(["/setup"]);
        }
      },
      error: (error) => {
        console.error("Error checking blog setup:", error);
        this.showHeader = false;

        // If there's an authentication error, log out the user
        if (this.authService.isAuthenticated()) {
          console.warn("Authentication error detected, logging out...");
          this.authService.logout();
        }
      },
    });
  }

  private updateHeaderVisibility() {
    const currentUrl = this.router.url;

    // Hide header on setup page regardless of setup status
    if (currentUrl.startsWith("/setup")) {
      this.showHeader = false;
      return;
    }

    // For other pages, check blog setup status
    this.checkBlogSetup();
  }
}
