import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FileUploadComponent,
  FileUploadConfig,
} from "../file-upload/file-upload.component";
import {
  FileCategory,
  FileUploadResponse,
} from "../file-upload/file-upload.component";

@Component({
  selector: "app-blog-image-upload",
  standalone: true,
  imports: [CommonModule, FileUploadComponent],
  template: `
    <div class="blog-image-upload">
      <h3 class="upload-title">{{ title }}</h3>
      <app-file-upload
        [config]="uploadConfig"
        [currentFileUrl]="imageUrl"
        [disabled]="disabled"
        (fileUploaded)="onImageUploaded($event)"
        (fileRemoved)="onImageRemoved()"
        (uploadError)="onUploadError($event)"
      >
      </app-file-upload>
      <p *ngIf="helpText" class="help-text">{{ helpText }}</p>
    </div>
  `,
  styles: [
    `
      .blog-image-upload {
        margin-bottom: 1.5rem;
      }

      .upload-title {
        font-size: 1rem;
        font-weight: 500;
        color: #374151;
        margin-bottom: 0.5rem;
      }

      .help-text {
        color: #6b7280;
        font-size: 0.75rem;
        margin-top: 0.5rem;
        font-style: italic;
      }
    `,
  ],
})
export class BlogImageUploadComponent {
  @Input() title = "Featured Image";
  @Input() imageUrl?: string;
  @Input() disabled = false;
  @Input() helpText = "Upload an image to represent this content";

  @Output() imageUploaded = new EventEmitter<FileUploadResponse>();
  @Output() imageRemoved = new EventEmitter<void>();
  @Output() uploadError = new EventEmitter<string>();

  uploadConfig: FileUploadConfig = {
    category: FileCategory.BLOG_IMAGES,
    accept: "image/*",
    maxSize: 5 * 1024 * 1024, // 5MB
    placeholder: "Click to select an image or drag and drop",
    showPreview: true,
    previewSize: "large",
  };

  onImageUploaded(fileResponse: FileUploadResponse) {
    this.imageUploaded.emit(fileResponse);
  }

  onImageRemoved() {
    this.imageRemoved.emit();
  }

  onUploadError(error: string) {
    this.uploadError.emit(error);
  }
}
