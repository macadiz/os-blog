import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterModule } from "@angular/router";
import { User as AuthUser } from "../../../../core/services/auth.service";
import { BlogSettings } from "../../../../core/services/api.service";
import { resolveFileUrl } from "../../../../core/services/resolve-file-url.util";

@Component({
  standalone: true,
  selector: "app-header-mobile-menu-drawer",
  templateUrl: "./header-mobile-menu-drawer.component.html",
  imports: [CommonModule, RouterModule],
})
export class HeaderMobileMenuDrawerComponent {
  @Input()
  blogSettings?: BlogSettings | null = undefined;
  @Input()
  user?: AuthUser | null = undefined;
  @Output()
  logoutAction: EventEmitter<void> = new EventEmitter<void>();

  isOpen = false;

  toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  logout() {
    this.logoutAction.emit();
  }

  getLogoSrc(logoUrl: string | undefined | null): string | undefined {
    return resolveFileUrl(logoUrl);
  }
}
