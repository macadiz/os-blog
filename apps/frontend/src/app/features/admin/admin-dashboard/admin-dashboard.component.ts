import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AuthService, User } from "../../../core/services/auth.service";
import { ApiService, BlogInsights } from "../../../core/services/api.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.css"],
})
export class AdminDashboardComponent implements OnInit {
  currentUser$: Observable<User | null>;
  insights: BlogInsights | null = null;
  isLoading = true;
  errorMessage = "";

  constructor(
    private authService: AuthService,
    private apiService: ApiService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.loadDashboardStats();
  }

  private loadDashboardStats() {
    this.isLoading = true;
    this.apiService.getBlogInsights().subscribe({
      next: (insights: BlogInsights) => {
        this.insights = insights;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error("Error loading dashboard insights:", error);
        this.errorMessage = "Failed to load dashboard statistics.";
        this.isLoading = false;
      },
    });
  }

  logout() {
    this.authService.logout();
  }
}
