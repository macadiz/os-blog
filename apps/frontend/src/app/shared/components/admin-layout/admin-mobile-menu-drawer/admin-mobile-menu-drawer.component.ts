import { Component, Input } from "@angular/core";
import { User as AuthUser } from "../../../../core/services/auth.service";
import {
  MenuItem,
  NavMenuItemComponent,
} from "../../nav-menu-item/nav-menu-item.component";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-admin-mobile-menu-drawer",
  templateUrl: "./admin-mobile-menu-drawer.component.html",
  imports: [CommonModule, RouterModule, NavMenuItemComponent],
})
export class AdminMobileMenuDrawerComponent {
  @Input()
  user: AuthUser | null = null;
  @Input()
  authorMenuItems!: MenuItem[];
  @Input()
  adminMenuItems!: MenuItem[];
}
