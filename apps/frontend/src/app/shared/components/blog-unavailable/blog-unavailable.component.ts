import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";

@Component({
  selector: "app-blog-unavailable",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./blog-unavailable.component.html",
  styles: [],
})
export class BlogUnavailableComponent {
  constructor(private router: Router) {}

  refreshPage() {
    // Navigate to refresh the current route instead of full page reload
    this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
      this.router.navigate([this.router.url]);
    });
  }
}
