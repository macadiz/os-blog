import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  ApiService,
  BlogSettings,
  BlogSettingsDto,
} from "../../../core/services/api.service";

@Component({
  selector: "app-blog-settings",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./blog-settings.component.html",
  styleUrls: ["./blog-settings.component.css"],
})
export class BlogSettingsComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;
  saving = false;
  message = "";
  error = "";

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.settingsForm = this.fb.group({
      blogTitle: ["", [Validators.required, Validators.maxLength(100)]],
      blogDescription: ["", [Validators.maxLength(500)]],
      logoUrl: [""],
      faviconUrl: [""],
      theme: ["default"],
    });
  }

  ngOnInit() {
    this.loadSettings();
  }

  private loadSettings() {
    this.loading = true;
    this.error = "";

    this.apiService.getBlogSettings().subscribe({
      next: (settings: BlogSettings) => {
        this.settingsForm.patchValue({
          blogTitle: settings.blogTitle,
          blogDescription: settings.blogDescription || "",
          logoUrl: settings.logoUrl || "",
          faviconUrl: (settings as any).faviconUrl || "",
          theme: (settings as any).theme || "default",
        });
        this.loading = false;
      },
      error: () => {
        this.error = "Failed to load blog settings";
        this.loading = false;
      },
    });
  }

  onSubmit() {
    if (this.settingsForm.valid) {
      this.saving = true;
      this.message = "";
      this.error = "";

      const formValue = this.settingsForm.value;
      const settingsDto: BlogSettingsDto = {
        blogTitle: formValue.blogTitle,
        blogDescription: formValue.blogDescription || undefined,
        logoUrl: formValue.logoUrl || undefined,
        faviconUrl: formValue.faviconUrl || undefined,
        theme: formValue.theme || undefined,
      };

      this.apiService.updateBlogSettings(settingsDto).subscribe({
        next: (response) => {
          this.message = response.message;
          this.saving = false;
          // Optionally refresh the form with updated data
          setTimeout(() => {
            this.message = "";
          }, 3000);
        },
        error: () => {
          this.error = "Failed to update blog settings";
          this.saving = false;
        },
      });
    }
  }

  // Helper method to check if a field has errors
  hasError(fieldName: string): boolean {
    const field = this.settingsForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Helper method to get error message for a field
  getErrorMessage(fieldName: string): string {
    const field = this.settingsForm.get(fieldName);
    if (field?.errors) {
      if (field.errors["required"]) {
        return `${fieldName} is required`;
      }
      if (field.errors["maxlength"]) {
        return `${fieldName} must not exceed ${field.errors["maxlength"].requiredLength} characters`;
      }
      if (field.errors["url"]) {
        return `${fieldName} must be a valid URL`;
      }
    }
    return "";
  }
}
