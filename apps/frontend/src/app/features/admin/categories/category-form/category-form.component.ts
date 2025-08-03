import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router, ActivatedRoute } from "@angular/router";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  ApiService,
  CreateCategoryDto,
  UpdateCategoryDto,
  Category,
} from "../../../../core/services/api.service";

@Component({
  selector: "app-category-form",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: "./category-form.component.html",
  styleUrls: ["./category-form.component.css"],
})
export class CategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  isEditing = false;
  isSubmitting = false;
  categoryId?: string;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.categoryForm = this.fb.group({
      name: ["", [Validators.required, Validators.maxLength(100)]],
      description: ["", [Validators.maxLength(500)]],
      color: ["", [Validators.pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)]],
    });
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.isEditing = true;
        this.categoryId = params["id"];
        this.loadCategory();
      }
    });
  }

  onColorPickerChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const colorValue = target.value;
    // Update the form control with the color picker value
    this.categoryForm.patchValue({ color: colorValue }, { emitEvent: false });
  }

  onColorTextChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const colorValue = target.value;

    // The text input is already bound to the form control via formControlName
    // We just need to validate and optionally format the input
    if (colorValue && !colorValue.startsWith("#") && colorValue.length === 6) {
      // Auto-add # prefix if user enters just the hex digits
      const formattedColor = "#" + colorValue;
      this.categoryForm.patchValue(
        { color: formattedColor },
        { emitEvent: false }
      );
    }
  }

  getColorValue(): string {
    const colorValue = this.categoryForm.get("color")?.value;
    // Ensure we always return a valid hex color for the color picker
    if (colorValue && colorValue.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
      return colorValue;
    }
    return "#3B82F6"; // Default color
  }

  loadCategory() {
    if (this.categoryId) {
      this.apiService.getCategory(this.categoryId).subscribe({
        next: (category: Category) => {
          this.categoryForm.patchValue({
            name: category.name,
            description: category.description || "",
            color: category.color || "",
          });
        },
        error: (error: any) => {
          console.error("Error loading category:", error);
          alert("Failed to load category. Please try again.");
          this.router.navigate(["/admin/categories"]);
        },
      });
    }
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      this.isSubmitting = true;

      const formValue = this.categoryForm.value;
      const categoryData = {
        name: formValue.name,
        description: formValue.description || undefined,
        color: formValue.color || undefined,
      };

      const request$ = this.isEditing
        ? this.apiService.updateCategory(
            this.categoryId!,
            categoryData as UpdateCategoryDto
          )
        : this.apiService.createCategory(categoryData as CreateCategoryDto);

      request$.subscribe({
        next: () => {
          this.router.navigate(["/admin/categories"]);
        },
        error: (error: any) => {
          console.error("Error saving category:", error);
          alert("Failed to save category. Please try again.");
          this.isSubmitting = false;
        },
      });
    }
  }
}
