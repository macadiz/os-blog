import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { ApiService } from "../../../core/services/api.service";

@Component({
  selector: "app-setup",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./setup.component.html",
  styles: [],
})
export class SetupComponent {
  onFileChange(event: Event, type: "logo" | "favicon") {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (type === "logo") {
        this.logoFile = input.files[0];
      } else if (type === "favicon") {
        this.faviconFile = input.files[0];
      }
    } else {
      if (type === "logo") {
        this.logoFile = null;
      } else if (type === "favicon") {
        this.faviconFile = null;
      }
    }
  }
  setupForm: FormGroup;
  isLoading = false;
  errorMessage = "";
  private logoExplicitlyRemoved = false;
  private faviconExplicitlyRemoved = false;

  logoFile: File | null = null;
  faviconFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.setupForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      username: ["", Validators.required],
      password: ["", [Validators.required, Validators.minLength(8)]],
      firstName: [""],
      lastName: [""],
      blogTitle: ["My Blog", Validators.required],
      blogDescription: [""],
      logoUrl: [""],
      faviconUrl: [""],
    });
  }

  onSubmit() {
    if (this.setupForm.valid) {
      this.isLoading = true;
      this.errorMessage = "";

      const formValue = this.setupForm.value;
      const formData = new FormData();
      formData.append("email", formValue.email);
      formData.append("username", formValue.username);
      formData.append("password", formValue.password);
      formData.append("firstName", formValue.firstName || "");
      formData.append("lastName", formValue.lastName || "");
      formData.append("blogTitle", formValue.blogTitle);
      formData.append("blogDescription", formValue.blogDescription || "");
      if (this.logoFile) {
        formData.append("logo", this.logoFile);
      }
      if (this.faviconFile) {
        formData.append("favicon", this.faviconFile);
      }

      this.apiService.createAdminMultipart(formData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.router.navigate(["/login"]);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage =
            error.error?.message || "Setup failed. Please try again.";
        },
      });
    }
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.logoFile = input.files[0];
    } else {
      this.logoFile = null;
    }
  }

  onFaviconSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.faviconFile = input.files[0];
    } else {
      this.faviconFile = null;
    }
  }

  get currentLogoUrl(): string | undefined {
    if (this.logoExplicitlyRemoved) {
      return undefined;
    }
    return this.setupForm.value.logoUrl;
  }

  get currentFaviconUrl(): string | undefined {
    if (this.faviconExplicitlyRemoved) {
      return undefined;
    }
    return this.setupForm.value.faviconUrl;
  }
}
