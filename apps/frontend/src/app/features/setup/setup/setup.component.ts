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
import {
  FileUploadComponent,
  FileUploadConfig,
} from "../../../shared/components/file-upload/file-upload.component";
import {
  FileCategory,
  FileUploadResponse,
} from "../../../shared/components/file-upload/file-upload.component";

@Component({
  selector: "app-setup",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileUploadComponent],
  templateUrl: "./setup.component.html",
  styles: [],
})
export class SetupComponent {
  setupForm: FormGroup;
  isLoading = false;
  errorMessage = "";
  private logoExplicitlyRemoved = false;
  private faviconExplicitlyRemoved = false;

  logoUploadConfig: FileUploadConfig = {
    category: FileCategory.SETTINGS,
    accept: "image/*",
    maxSize: 2 * 1024 * 1024, // 2MB for logos
    placeholder: "Upload blog logo (optional)",
    showPreview: true,
    previewSize: "medium",
  };

  faviconUploadConfig: FileUploadConfig = {
    category: FileCategory.SETTINGS,
    accept: "image/*",
    maxSize: 1 * 1024 * 1024, // 1MB for favicons
    placeholder: "Upload favicon (optional)",
    showPreview: true,
    previewSize: "small",
  };

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
      const setupData = {
        email: formValue.email,
        username: formValue.username,
        password: formValue.password,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        blogTitle: formValue.blogTitle,
        blogDescription: formValue.blogDescription,
        logoUrl: this.logoExplicitlyRemoved ? null : formValue.logoUrl,
        faviconUrl: this.faviconExplicitlyRemoved ? null : formValue.faviconUrl,
      };

      this.apiService.createAdmin(setupData).subscribe({
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

  onLogoUploaded(fileResponse: FileUploadResponse) {
    this.logoExplicitlyRemoved = false;
    this.setupForm.patchValue({
      logoUrl: fileResponse.url,
    });
  }

  onLogoRemoved() {
    this.logoExplicitlyRemoved = true;
    this.setupForm.patchValue({
      logoUrl: "",
    });
  }

  onFaviconUploaded(fileResponse: FileUploadResponse) {
    this.faviconExplicitlyRemoved = false;
    this.setupForm.patchValue({
      faviconUrl: fileResponse.url,
    });
  }

  onFaviconRemoved() {
    this.faviconExplicitlyRemoved = true;
    this.setupForm.patchValue({
      faviconUrl: "",
    });
  }

  onUploadError(error: string) {
    this.errorMessage = error;
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
