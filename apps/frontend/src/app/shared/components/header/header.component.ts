import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { Observable } from "rxjs";
import { ApiService } from "../../../core/services/api.service";
import {
  AuthService,
  User as AuthUser,
} from "../../../core/services/auth.service";
import {
  DropdownMenuItemComponent,
  DropdownMenuItem,
} from "../dropdown-menu-item/dropdown-menu-item.component";

interface BlogSettings {
  blogTitle: string;
  blogDescription?: string;
}

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, RouterModule, DropdownMenuItemComponent],
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
  blogSettings: BlogSettings | null = null;
  currentUser$: Observable<AuthUser | null>;
  showUserMenu = false;
  showMobileMenu = false;
  dropdownMenuItems: DropdownMenuItem[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.loadBlogSettings();
    this.setupDropdownMenuItems();

    // Close dropdowns when clicking outside
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".relative")) {
        this.showUserMenu = false;
      }
    });
  }

  private setupDropdownMenuItems() {
    this.dropdownMenuItems = [
      {
        label: "Dashboard",
        icon: "dashboard",
        routerLink: ["/admin"],
        type: "link",
      },
      {
        label: "My Posts",
        icon: "article",
        routerLink: ["/admin/posts"],
        type: "link",
      },
      {
        label: "New Post",
        icon: "add",
        routerLink: ["/admin/posts/new"],
        type: "link",
      },
      {
        label: "Logout",
        icon: "logout",
        variant: "danger",
        type: "button",
        action: () => this.logout(),
      },
    ];
  }

  private loadBlogSettings() {
    this.apiService.getBlogSettings().subscribe({
      next: (settings: BlogSettings) => {
        this.blogSettings = settings;
      },
      error: (error: any) => {
        console.error("Failed to load blog settings:", error);
      },
    });
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    this.showMobileMenu = false;
  }

  closeUserMenu() {
    this.showUserMenu = false;
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
    this.showUserMenu = false;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }

  logout() {
    this.authService.logout();
    this.closeUserMenu();
    this.closeMobileMenu();
  }
}
