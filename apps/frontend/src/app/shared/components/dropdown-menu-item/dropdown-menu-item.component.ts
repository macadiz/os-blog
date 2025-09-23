import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

export interface DropdownMenuItem {
  label: string;
  icon: string;
  routerLink?: string[];
  action?: () => void;
  variant?: "default" | "danger";
  type?: "link" | "button";
}

@Component({
  selector: "app-dropdown-menu-item",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Link Item -->
    <a
      *ngIf="item.type !== 'button' && item.routerLink"
      [routerLink]="item.routerLink"
      (click)="handleClick()"
      [class]="getLinkClasses()"
    >
      <span class="material-symbols-outlined mr-2 text-lg">{{
        item.icon
      }}</span>
      {{ item.label }}
    </a>

    <!-- Button Item -->
    <button
      *ngIf="item.type === 'button' || !item.routerLink"
      (click)="handleClick()"
      [class]="getButtonClasses()"
    >
      <span class="material-symbols-outlined mr-2 text-lg">{{
        item.icon
      }}</span>
      {{ item.label }}
    </button>
  `,
  styleUrls: ["./dropdown-menu-item.component.css"],
})
export class DropdownMenuItemComponent {
  @Input() item!: DropdownMenuItem;
  @Output() itemClick = new EventEmitter<void>();

  handleClick() {
    this.itemClick.emit();
    if (this.item.action) {
      this.item.action();
    }
  }

  getLinkClasses(): string {
    const baseClasses = "flex items-center px-4 py-2 text-sm transition-colors";

    if (this.item.variant === "danger") {
      return `${baseClasses} text-red-600 hover:bg-red-50`;
    }

    return `${baseClasses} themed-text hover:bg-theme-border`;
  }

  getButtonClasses(): string {
    const baseClasses =
      "flex items-center w-full text-left px-4 py-2 text-sm transition-colors";

    if (this.item.variant === "danger") {
      return `${baseClasses} text-red-600 hover:bg-red-50`;
    }

    return `${baseClasses} themed-text hover:bg-theme-border`;
  }
}
