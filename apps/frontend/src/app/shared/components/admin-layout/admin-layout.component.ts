import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router, ActivatedRoute } from "@angular/router";
import { AuthService, User } from "../../../core/services/auth.service";
import { Observable } from "rxjs";
import {
  NavMenuItemComponent,
  MenuItem,
} from "../nav-menu-item/nav-menu-item.component";

@Component({
  selector: "app-admin-layout",
  standalone: true,
  imports: [CommonModule, RouterModule, NavMenuItemComponent],
  templateUrl: "./admin-layout.component.html",
  styleUrls: ["./admin-layout.component.css"],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;

  // Author menu items (available to both authors and admins)
  authorMenuItems: MenuItem[] = [
    {
      routerLink: ["/admin/dashboard"],
      icon: "dashboard",
      label: "Dashboard",
      exact: true, // Use exact matching for /admin/dashboard route
    },
    {
      routerLink: ["/admin/posts"],
      icon: "article",
      label: "All Posts",
      exact: true, // Use exact matching
    },
    {
      routerLink: ["/admin/posts/new"],
      icon: "add",
      label: "New Post",
      exact: true, // Use exact matching
    },
    {
      routerLink: ["/admin/profile"],
      icon: "person",
      label: "My Profile",
      exact: true, // Use exact matching
    },
  ];

  // Admin-only menu items
  adminMenuItems: MenuItem[] = [
    {
      routerLink: ["/admin/users"],
      icon: "group",
      label: "Users",
    },
    {
      routerLink: ["/admin/categories"],
      icon: "category",
      label: "Categories",
    },
    {
      routerLink: ["/admin/tags"],
      icon: "sell",
      label: "Tags",
    },
    {
      routerLink: ["/admin/settings"],
      icon: "settings",
      label: "Settings",
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    // Add admin layout class to body for proper scrolling
    document.body.classList.add("admin-layout-active");
  }

  ngOnDestroy() {
    // Remove admin layout class when component is destroyed
    document.body.classList.remove("admin-layout-active");
  }

  getPageTitle(): string {
    const url = this.router.url;

    if (url.includes("/dashboard")) return "Dashboard";
    if (url.includes("/posts/new")) return "New Post";
    if (url.includes("/posts/edit")) return "Edit Post";
    if (url.includes("/posts")) return "All Posts";
    if (url.includes("/profile")) return "My Profile";
    if (url.includes("/users")) return "Users";
    if (url.includes("/categories/new")) return "New Category";
    if (url.includes("/categories") && url.includes("/edit"))
      return "Edit Category";
    if (url.includes("/categories")) return "Categories";
    if (url.includes("/tags/new")) return "New Tag";
    if (url.includes("/tags") && url.includes("/edit")) return "Edit Tag";
    if (url.includes("/tags")) return "Tags";
    if (url.includes("/settings")) return "Blog Settings";

    return "Admin Panel";
  }

  logout() {
    this.authService.logout();
  }
}
