import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AuthService, User } from "../../../core/services/auth.service";
import { ApiService, BlogInsights } from "../../../core/services/api.service";
import { Observable } from "rxjs";
import {
  StatCardComponent,
  StatCard,
} from "../../../shared/components/stat-card/stat-card.component";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent],
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.css"],
})
export class AdminDashboardComponent implements OnInit {
  currentUser$: Observable<User | null>;
  insights: BlogInsights | null = null;
  isLoading = true;
  errorMessage = "";
  statCards: StatCard[] = [];

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
        this.setupStatCards(insights);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error("Error loading dashboard insights:", error);
        this.errorMessage = "Failed to load dashboard statistics.";
        this.isLoading = false;
      },
    });
  }

  private setupStatCards(insights: BlogInsights) {
    // Get current user to determine title for posts
    this.currentUser$.subscribe((user) => {
      const postsTitle = user?.role === "ADMIN" ? "Total Posts" : "Your Posts";

      this.statCards = [
        {
          title: postsTitle,
          value: insights.totalPosts,
          subtitle: `${insights.publishedPosts} published, ${insights.draftPosts} drafts`,
          icon: "article",
          linkUrl: ["/admin/posts"],
          linkText: "View all posts",
        },
        {
          title: "Total Users",
          value: insights.totalUsers,
          icon: "group",
          linkUrl: ["/admin/users"],
          linkText: "Manage users",
          showOnlyForAdmin: true,
        },
        {
          title: "Categories",
          value: insights.totalCategories,
          icon: "category",
          linkUrl: ["/admin/categories"],
          linkText: "Manage categories",
          showOnlyForAdmin: true,
        },
        {
          title: "Tags",
          value: insights.totalTags,
          icon: "label",
          linkUrl: ["/admin/tags"],
          linkText: "Manage tags",
          showOnlyForAdmin: true,
        },
        {
          title: "Recent Activity",
          value: insights.recentPosts,
          subtitle: "Posts created in the last 7 days",
          icon: "trending_up",
        },
      ];
    });
  }

  logout() {
    this.authService.logout();
  }
}
