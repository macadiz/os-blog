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
import { FormsModule } from "@angular/forms";
import {
  FileUploadService,
  UploadProgressEvent,
} from "../../../core/services/file-upload.service";
import { environment } from "../../../../environments/environment";
import { resolveBaseUrl } from "../../../core/utils/url-resolver.util";
// Define the types locally instead of importing
export enum FileCategory {
  SETTINGS = "settings",
  PROFILE_PICTURES = "profile_pictures",
  BLOG_IMAGES = "blog_images",
}

export interface FileUploadResponse {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  category: FileCategory;
  url: string;
}

export interface FileUploadConfig {
  category: FileCategory;
  accept?: string;
  maxSize?: number;
  placeholder?: string;
  showPreview?: boolean;
  previewSize?: "small" | "medium" | "large";
}

@Component({
  selector: "app-file-upload",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./file-upload.component.html",
  styleUrls: ["./file-upload.component.css"],
})
export class FileUploadComponent implements OnDestroy {
  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

  @Input() config: FileUploadConfig = {
    category: FileCategory.BLOG_IMAGES,
    accept: "image/*",
    maxSize: 5 * 1024 * 1024, // 5MB
    placeholder: "Click to select a file or drag and drop",
    showPreview: true,
    previewSize: "medium",
  };

  @Input() currentFileUrl?: string | null;
  @Input() disabled = false;

  @Output() fileUploaded = new EventEmitter<FileUploadResponse>();
  @Output() fileRemoved = new EventEmitter<void>();
  @Output() uploadError = new EventEmitter<string>();

  isDragOver = false;
  isUploading = false;
  uploadProgress = 0;
  previewUrl?: string;
  selectedFile?: File;
  validationError?: string;
  componentId: string;

  constructor(private fileUploadService: FileUploadService) {
    // Generate unique component ID to avoid collisions
    this.componentId = "file-upload-" + Math.random().toString(36).substr(2, 9);
  }

  ngOnDestroy() {
    if (this.previewUrl) {
      this.fileUploadService.revokePreviewUrl(this.previewUrl);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled) {
      this.isDragOver = true;
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (this.disabled) return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
    // Clear the input value to allow re-selecting the same file
    target.value = "";
  }

  onUploadAreaClick() {
    if (this.disabled || this.isUploading) return;

    // Trigger the hidden file input using ViewChild
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  private handleFileSelection(file: File) {
    this.validationError = undefined;

    // Validate file
    const validation = this.fileUploadService.validateFile(file);
    if (!validation.valid) {
      this.validationError = validation.error;
      return;
    }

    // Check custom max size if provided
    if (this.config.maxSize && file.size > this.config.maxSize) {
      this.validationError = `File size must be less than ${this.formatFileSize(this.config.maxSize)}`;
      return;
    }

    this.selectedFile = file;

    // Create preview if enabled
    if (this.config.showPreview && file.type.startsWith("image/")) {
      if (this.previewUrl) {
        this.fileUploadService.revokePreviewUrl(this.previewUrl);
      }
      this.previewUrl = this.fileUploadService.createPreviewUrl(file);
    }

    // Start upload automatically
    this.uploadFile();
  }

  uploadFile() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    this.fileUploadService
      .uploadFileWithProgress(this.selectedFile, this.config.category)
      .subscribe({
        next: (event: UploadProgressEvent) => {
          if (event.type === "progress" && event.progress !== undefined) {
            this.uploadProgress = event.progress;
          } else if (event.type === "complete" && event.file) {
            this.isUploading = false;
            this.uploadProgress = 100;
            this.fileUploaded.emit(event.file);
            this.currentFileUrl = this.getImageUrl(event.file.url);
          }
        },
        error: (error) => {
          this.isUploading = false;
          this.uploadProgress = 0;
          const errorMessage =
            error.error?.message || "Upload failed. Please try again.";
          this.uploadError.emit(errorMessage);
          this.validationError = errorMessage;
        },
      });
  }

  removeFile() {
    if (this.currentFileUrl) {
      const filename = this.fileUploadService.extractFilenameFromUrl(
        this.currentFileUrl
      );
      const category = this.fileUploadService.extractCategoryFromUrl(
        this.currentFileUrl
      );

      if (filename && category) {
        this.fileUploadService.deleteFile(filename, category).subscribe({
          next: () => {
            this.currentFileUrl = undefined;
            this.fileRemoved.emit();
          },
          error: (error) => {
            const errorMessage =
              error.error?.message || "Failed to remove file";
            this.uploadError.emit(errorMessage);
          },
        });
      }
    }

    // Clear local state
    this.selectedFile = undefined;
    if (this.previewUrl) {
      this.fileUploadService.revokePreviewUrl(this.previewUrl);
      this.previewUrl = undefined;
    }
    this.validationError = undefined;

    // Clear the file input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = "";
    }
  }

  getPreviewImageClass(): string {
    const sizeClass = {
      small: "w-16 h-16",
      medium: "w-32 h-32",
      large: "w-48 h-48",
    }[this.config.previewSize || "medium"];

    return `${sizeClass} object-cover rounded-lg border-2 border-gray-300`;
  }

  getDisplayUrl(): string | undefined | null {
    return this.getImageUrl(this.previewUrl ?? this.currentFileUrl);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  getComponentId(): string {
    return this.componentId;
  }

  getImageUrl(url: string | null | undefined): string | undefined {
    const fileUrl = url;

    if (fileUrl) {
      var r = new RegExp("^(?:[a-z+]+:)?//", "i");
      const isURL = r.test(fileUrl);

      const apiUrl = resolveBaseUrl();

      return isURL ? fileUrl : `${apiUrl}${fileUrl}`;
    }
  }
}
