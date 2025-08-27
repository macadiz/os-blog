import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterModule } from "@angular/router";
import { User as AuthUser } from "../../../../core/services/auth.service";

@Component({
  standalone: true,
  selector: "app-mobile-menu-drawer",
  templateUrl: "./mobile-menu-drawer.component.html",
  imports: [CommonModule, RouterModule],
})
export class MobileMenuDrawerComponent {
  @Input()
  logoUrl?: string = undefined;
  @Input()
  blogTitle?: string = undefined;
  @Input()
  user?: AuthUser = undefined;
  @Output()
  logoutAction: EventEmitter<void> = new EventEmitter<void>();

  isOpen = false;

  toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  logout() {
    this.logoutAction.emit();
  }
}
