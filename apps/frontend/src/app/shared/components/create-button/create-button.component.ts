import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-create-button",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./create-button.component.html",
  styleUrls: ["./create-button.component.css"],
})
export class CreateButtonComponent {
  @Input({ required: true }) routerLink!: string[];
  @Input({ required: true }) text!: string;
}
