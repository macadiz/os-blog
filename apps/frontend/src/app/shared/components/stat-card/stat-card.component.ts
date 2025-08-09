import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

export interface StatCard {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: string;
  linkUrl?: string[];
  linkText?: string;
  showOnlyForAdmin?: boolean;
}

@Component({
  selector: "app-stat-card",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./stat-card.component.html",
  styleUrls: ["./stat-card.component.css"],
})
export class StatCardComponent {
  @Input() stat!: StatCard;
}
