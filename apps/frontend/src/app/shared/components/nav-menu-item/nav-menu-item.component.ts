import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

export interface MenuItem {
  routerLink: string[];
  icon: string;
  label: string;
  exact?: boolean; // Optional property to control exact matching
}

@Component({
  selector: "app-nav-menu-item",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./nav-menu-item.component.html",
  styleUrls: ["./nav-menu-item.component.css"],
})
export class NavMenuItemComponent {
  @Input({ required: true }) item!: MenuItem;
}
