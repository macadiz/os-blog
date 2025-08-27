import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { Observable } from "rxjs";
import { ApiService } from "../../../core/services/api.service";
import {
  TitleService,
  BlogSettings,
} from "../../../core/services/title.service";
import {
  AuthService,
  User as AuthUser,
} from "../../../core/services/auth.service";
import {
  DropdownMenuItemComponent,
  DropdownMenuItem,
} from "../dropdown-menu-item/dropdown-menu-item.component";
import { resolveFileUrl } from "../../../core/services/resolve-file-url.util";
import { environment } from "../../../../environments/environment";
import { MobileMenuDrawerComponent } from "./mobile-menu-drawer/mobile-menu-drawer.component";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DropdownMenuItemComponent,
    MobileMenuDrawerComponent,
  ],
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
  getLogoSrc(logoUrl: string | undefined | null): string | undefined {
    return resolveFileUrl(logoUrl);
  }
  blogSettings$: Observable<BlogSettings | null>;
  currentUser$: Observable<AuthUser | null>;
  showUserMenu = false;
  showMobileMenu = false;
  dropdownMenuItems: DropdownMenuItem[] = [];

  constructor(
    private apiService: ApiService,
    private titleService: TitleService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.blogSettings$ = this.titleService.getBlogSettings$();
  }

  ngOnInit() {
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
        label: "My Profile",
        icon: "person",
        routerLink: ["/admin/profile"],
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

  getRssFeedUrl(): string {
    if (environment.production) {
      return `${window.location.origin}${environment.apiUrl}/feed.xml`;
    } else {
      return `${environment.apiUrl}/feed.xml`;
    }
  }
}
