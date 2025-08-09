import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";

@Component({
  selector: "app-api-error",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./api-error.component.html",
  styles: [],
})
export class ApiErrorComponent {
  constructor(private router: Router) {}

  refreshPage() {
    // Navigate to refresh the current route instead of full page reload
    this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
      this.router.navigate([this.router.url]);
    });
  }

  goBack() {
    // Try to go back, or fallback to root
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(["/"]);
    }
  }
}
