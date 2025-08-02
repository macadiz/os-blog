import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AuthService, User } from "../../../core/services/auth.service";
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
  postsCount = 0;
  usersCount = 0;
  categoriesCount = 0;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.loadDashboardStats();
  }

  private loadDashboardStats() {
    // TODO: Implement actual API calls to get dashboard statistics
    // For now, using placeholder values
    this.postsCount = 12; // Example value
    this.usersCount = 5; // Example value
    this.categoriesCount = 8; // Example value
  }

  logout() {
    this.authService.logout();
  }
}
