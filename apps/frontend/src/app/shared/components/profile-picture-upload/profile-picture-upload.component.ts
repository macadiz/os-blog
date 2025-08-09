import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FileUploadService,
  FileCategory,
  FileUploadResponse,
  UploadProgressEvent,
} from "../../../core/services/file-upload.service";

@Component({
  selector: "app-profile-picture-upload",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./profile-picture-upload.component.html",
  styleUrls: ["./profile-picture-upload.component.css"],
})
export class ProfilePictureUploadComponent implements OnDestroy {
  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

  @Input() currentImageUrl?: string;
  @Input() userName = "";
  @Input() size: "small" | "medium" | "large" = "medium";
  @Input() disabled = false;
  @Input() showRemoveButton = true;
  @Input() showEditIcon = true;

  @Output() imageUploaded = new EventEmitter<FileUploadResponse>();
  @Output() imageRemoved = new EventEmitter<void>();
  @Output() uploadError = new EventEmitter<string>();

  isUploading = false;
  uploadProgress = 0;
  previewUrl?: string;
  validationError?: string;

  // Expose Math to template
  pi = Math.PI;

  constructor(private fileUploadService: FileUploadService) {}

  ngOnDestroy() {
    if (this.previewUrl) {
      this.fileUploadService.revokePreviewUrl(this.previewUrl);
    }
  }

  onAvatarClick() {
    if (this.disabled || this.isUploading) return;
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  private handleFileSelection(file: File) {
    this.validationError = undefined;

    // Validate file
    const validation = this.fileUploadService.validateFile(file);
    if (!validation.valid) {
      this.validationError = validation.error;
      this.uploadError.emit(validation.error || "Invalid file");
      return;
    }

    // Create preview immediately
    if (this.previewUrl) {
      this.fileUploadService.revokePreviewUrl(this.previewUrl);
    }
    this.previewUrl = this.fileUploadService.createPreviewUrl(file);

    // Start upload
    this.uploadFile(file);
  }

  private uploadFile(file: File) {
    this.isUploading = true;
    this.uploadProgress = 0;

    this.fileUploadService
      .uploadFileWithProgress(file, FileCategory.PROFILE_PICTURES)
      .subscribe({
        next: (event: UploadProgressEvent) => {
          if (event.type === "progress" && event.progress !== undefined) {
            this.uploadProgress = event.progress;
          } else if (event.type === "complete" && event.file) {
            this.isUploading = false;
            this.uploadProgress = 100;
            this.imageUploaded.emit(event.file);
            this.currentImageUrl = event.file.url;

            // Clean up preview since we now have the uploaded image
            if (this.previewUrl) {
              this.fileUploadService.revokePreviewUrl(this.previewUrl);
              this.previewUrl = undefined;
            }
          }
        },
        error: (error) => {
          this.isUploading = false;
          this.uploadProgress = 0;
          const errorMessage =
            error.error?.message || "Upload failed. Please try again.";
          this.uploadError.emit(errorMessage);
          this.validationError = errorMessage;

          // Clean up preview on error
          if (this.previewUrl) {
            this.fileUploadService.revokePreviewUrl(this.previewUrl);
            this.previewUrl = undefined;
          }
        },
      });
  }

  onRemoveImage() {
    // Always clear the preview first
    if (this.previewUrl) {
      this.fileUploadService.revokePreviewUrl(this.previewUrl);
      this.previewUrl = undefined;
    }

    // Don't delete from server immediately - just mark as removed
    // The parent component will handle the actual deletion when saving
    this.imageRemoved.emit();
  }

  getDisplayImageUrl(): string | undefined {
    return this.previewUrl || this.currentImageUrl;
  }

  getUserInitials(): string {
    if (!this.userName) return "?";

    const parts = this.userName.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  getUserInitialsFontSize(): string {
    const fontSizeClasses = {
      small: "text-sm",
      medium: "text-base sm:text-lg",
      large: "text-xl sm:text-2xl",
    };
    return fontSizeClasses[this.size];
  }

  getAvatarSizeClass(): string {
    const sizeClasses = {
      small: "w-12 h-12",
      medium: "w-20 h-20",
      large: "w-24 h-24",
    };
    return sizeClasses[this.size];
  }

  getProgressSizeClass(): string {
    const sizeClasses = {
      small: "w-12 h-12",
      medium: "w-20 h-20",
      large: "w-24 h-24",
    };
    return sizeClasses[this.size];
  }
  getEditIconSizeClass(): string {
    const sizeClasses = {
      small: "text-base",
      medium: "text-lg",
      large: "text-xl",
    };
    return sizeClasses[this.size];
  }

  getRemoveButtonSizeClass(): string {
    const sizeClasses = {
      small: "w-6 h-6 text-xs",
      medium: "w-7 h-7 text-sm",
      large: "w-8 h-8 text-base",
    };
    return sizeClasses[this.size];
  }
}
