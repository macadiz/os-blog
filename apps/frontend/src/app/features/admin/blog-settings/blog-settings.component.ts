import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { ViewportScroller } from "@angular/common";
import {
  ApiService,
  BlogSettings,
  BlogSettingsDto,
} from "../../../core/services/api.service";
import { TitleService } from "../../../core/services/title.service";
import { FileUploadService } from "../../../core/services/file-upload.service";
import { ThemeService, ThemeConfig } from "../../../core/services/theme.service";
import {
  FileUploadComponent,
  FileUploadConfig,
} from "../../../shared/components/file-upload/file-upload.component";
import {
  FileCategory,
  FileUploadResponse,
} from "../../../shared/components/file-upload/file-upload.component";
import { resolveFileUrl } from "../../../core/services/resolve-file-url.util";

@Component({
  selector: "app-blog-settings",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileUploadComponent],
  templateUrl: "./blog-settings.component.html",
  styleUrls: ["./blog-settings.component.css"],
})
export class BlogSettingsComponent implements OnInit {
  getLogoSrc(logoUrl: string | undefined | null): string | undefined {
    return resolveFileUrl(logoUrl);
  }

  getFaviconSrc(faviconUrl: string | undefined | null): string | undefined {
    return resolveFileUrl(faviconUrl);
  }
  settingsForm: FormGroup;
  loading = false;
  saving = false;
  message = "";
  error = "";
  currentSettings?: BlogSettings;
  availableThemes: ThemeConfig[] = [];
  private logoExplicitlyRemoved = false;
  private faviconExplicitlyRemoved = false;
  private originalLogoUrl?: string;
  private originalFaviconUrl?: string;

  logoUploadConfig: FileUploadConfig = {
    category: FileCategory.SETTINGS,
    accept: "image/*",
    maxSize: 2 * 1024 * 1024, // 2MB for logos
    placeholder: "Upload blog logo",
    showPreview: true,
    previewSize: "medium",
  };

  faviconUploadConfig: FileUploadConfig = {
    category: FileCategory.SETTINGS,
    accept: "image/*",
    maxSize: 1 * 1024 * 1024, // 1MB for favicons
    placeholder: "Upload favicon",
    showPreview: true,
    previewSize: "small",
  };

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private titleService: TitleService,
    private fileUploadService: FileUploadService,
    private themeService: ThemeService,
    private viewportScroller: ViewportScroller,
    private router: Router
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
    this.availableThemes = this.themeService.getAllThemes();
    this.loadSettings();
  }

  private loadSettings() {
    this.loading = true;
    this.error = "";

    this.apiService.getBlogSettings().subscribe({
      next: (settings: BlogSettings) => {
        this.currentSettings = settings;
        this.logoExplicitlyRemoved = false;
        this.faviconExplicitlyRemoved = false;
        this.originalLogoUrl = settings.logoUrl;
        this.originalFaviconUrl = (settings as any).faviconUrl;
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

  private scrollToTop(): void {
    // Try to find the main scrollable container
    const sectionElement = document.querySelector("section.overflow-y-auto");
    const mainElement = document.querySelector("main");
    const appRoot = document.querySelector("app-root");
    const bodyElement = document.body;

    // Try scrolling the section element first (admin layout content area)
    if (
      sectionElement &&
      sectionElement.scrollHeight > sectionElement.clientHeight
    ) {
      sectionElement.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Fallback to app-root if it's scrollable
    if (appRoot && appRoot.scrollHeight > appRoot.clientHeight) {
      appRoot.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Final fallback to viewport scroller
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  private deleteOldFile(oldUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const filename = this.fileUploadService.extractFilenameFromUrl(oldUrl);
      const category = this.fileUploadService.extractCategoryFromUrl(oldUrl);

      if (filename && category) {
        this.fileUploadService.deleteFile(filename, category).subscribe({
          next: () => {
            resolve();
          },
          error: (error) => {
            // If file doesn't exist (404), that's actually fine - it's already gone
            if (error.status === 404) {
              resolve();
            } else {
              // Don't reject - we don't want to fail the settings update if file deletion fails
              resolve();
            }
          },
        });
      } else {
        resolve();
      }
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
        logoUrl: this.logoExplicitlyRemoved
          ? null
          : formValue.logoUrl || undefined,
        faviconUrl: this.faviconExplicitlyRemoved
          ? null
          : formValue.faviconUrl || undefined,
        theme: formValue.theme || undefined,
      };

      this.apiService.updateBlogSettings(settingsDto).subscribe({
        next: async (response) => {
          // If settings update was successful, handle old file deletion
          const filesToDelete: Promise<void>[] = [];

          // Check if we need to delete old logo
          if (
            this.originalLogoUrl &&
            (this.logoExplicitlyRemoved ||
              (settingsDto.logoUrl &&
                settingsDto.logoUrl !== this.originalLogoUrl))
          ) {
            filesToDelete.push(this.deleteOldFile(this.originalLogoUrl));
          }

          // Check if we need to delete old favicon
          if (
            this.originalFaviconUrl &&
            (this.faviconExplicitlyRemoved ||
              (settingsDto.faviconUrl &&
                settingsDto.faviconUrl !== this.originalFaviconUrl))
          ) {
            filesToDelete.push(this.deleteOldFile(this.originalFaviconUrl));
          }

          // Delete old files if needed
          if (filesToDelete.length > 0) {
            await Promise.all(filesToDelete);
          }

          // Update local state
          this.currentSettings = response.settings;
          this.logoExplicitlyRemoved = false;
          this.faviconExplicitlyRemoved = false;
          this.originalLogoUrl = response.settings.logoUrl;
          this.originalFaviconUrl = (response.settings as any).faviconUrl;
          this.message = response.message;
          this.saving = false;
          // Refresh the title service to update titles across the app
          this.titleService.refreshBlogSettings();

          // Update theme if it changed
          if (settingsDto.theme && settingsDto.theme !== this.themeService.getCurrentTheme()) {
            this.themeService.setTheme(settingsDto.theme as any, false);
          }

          // Scroll to top to show success message (target the main element)
          setTimeout(() => {
            this.scrollToTop();
          }, 100);

          // Clear message and refresh page after 2 seconds to see changes
          setTimeout(() => {
            this.message = "";
            // Navigate to refresh the current route to see all changes applied
            this.router
              .navigateByUrl("/", { skipLocationChange: true })
              .then(() => {
                this.router.navigate(["/admin/blog-settings"]);
              });
          }, 2000);
        },
        error: () => {
          this.error = "Failed to update blog settings";
          this.saving = false;
        },
      });
    }
  }

  onLogoUploaded(fileResponse: FileUploadResponse) {
    this.logoExplicitlyRemoved = false;
    this.settingsForm.patchValue({
      logoUrl: fileResponse.url,
    });
    this.message = "Logo uploaded successfully";
    setTimeout(() => (this.message = ""), 3000);
  }

  onLogoRemoved() {
    this.logoExplicitlyRemoved = true;
    this.settingsForm.patchValue({
      logoUrl: "",
    });
    this.message = "Logo removed";
    setTimeout(() => (this.message = ""), 3000);
  }

  onFaviconUploaded(fileResponse: FileUploadResponse) {
    this.faviconExplicitlyRemoved = false;
    this.settingsForm.patchValue({
      faviconUrl: fileResponse.url,
    });
    this.message = "Favicon uploaded successfully";
    setTimeout(() => (this.message = ""), 3000);
  }

  onFaviconRemoved() {
    this.faviconExplicitlyRemoved = true;
    this.settingsForm.patchValue({
      faviconUrl: "",
    });
    this.message = "Favicon removed";
    setTimeout(() => (this.message = ""), 3000);
  }

  onUploadError(error: string) {
    this.error = error;
    setTimeout(() => (this.error = ""), 5000);
  }

  get currentLogoUrl(): string | undefined {
    if (this.logoExplicitlyRemoved) {
      return undefined;
    }
    const formLogoUrl = this.settingsForm.get("logoUrl")?.value;
    const settingsLogoUrl = this.currentSettings?.logoUrl;
    return this.getLogoSrc(formLogoUrl || settingsLogoUrl);
  }

  get currentFaviconUrl(): string | undefined {
    if (this.faviconExplicitlyRemoved) {
      return undefined;
    }
    const formFaviconUrl = this.settingsForm.get("faviconUrl")?.value;
    const settingsFaviconUrl = (this.currentSettings as any)?.faviconUrl;
    return this.getFaviconSrc(formFaviconUrl || settingsFaviconUrl);
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

  // Handle theme preview
  onThemeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedTheme = target.value;

    if (this.themeService.isValidTheme(selectedTheme)) {
      this.themeService.setTheme(selectedTheme as any, false);
    }
  }

  // Get current theme for UI feedback
  getCurrentTheme(): string {
    return this.themeService.getCurrentTheme();
  }
}
