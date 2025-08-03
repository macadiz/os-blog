import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ApiService, Category } from "../../../../core/services/api.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-categories-list",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./categories-list.component.html",
  styleUrls: ["./categories-list.component.css"],
})
export class CategoriesListComponent implements OnInit {
  categories$!: Observable<Category[]>;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categories$ = this.apiService.getCategories();
  }

  deleteCategory(category: Category) {
    if (
      confirm(
        `Are you sure you want to delete the category "${category.name}"?`
      )
    ) {
      this.apiService.deleteCategory(category.id).subscribe({
        next: () => {
          this.loadCategories(); // Refresh the list
        },
        error: (error: any) => {
          console.error("Error deleting category:", error);
          alert("Failed to delete category. Please try again.");
        },
      });
    }
  }
}
