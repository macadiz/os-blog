import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { resolveBaseUrl } from "../utils/url-resolver.util";
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

export interface FileInfo {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  category: FileCategory;
  url: string;
  uploadedAt: Date;
}

export interface UploadProgressEvent {
  type: "progress" | "complete" | "error";
  progress?: number;
  file?: FileUploadResponse;
  error?: any;
}

@Injectable({
  providedIn: "root",
})
export class FileUploadService {
  private readonly baseUrl = resolveBaseUrl();

  constructor(private http: HttpClient) {}

  /**
   * Upload a file to the specified category
   */
  uploadFile(
    file: File,
    category: FileCategory
  ): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return this.http.post<FileUploadResponse>(
      `${this.baseUrl}/files/upload/${category}`,
      formData
    );
  }

  /**
   * Upload file with progress tracking
   */
  uploadFileWithProgress(
    file: File,
    category: FileCategory
  ): Observable<UploadProgressEvent> {
    const formData = new FormData();
    formData.append("file", file);

    return this.http
      .post<FileUploadResponse>(
        `${this.baseUrl}/files/upload/${category}`,
        formData,
        {
          reportProgress: true,
          observe: "events",
        }
      )
      .pipe(
        map((event) => {
          switch (event.type) {
            case 1: // HttpEventType.UploadProgress
              return {
                type: "progress" as const,
                progress: event.total
                  ? Math.round((event.loaded / event.total) * 100)
                  : 0,
              };
            case 4: // HttpEventType.Response
              return {
                type: "complete" as const,
                file: event.body as FileUploadResponse,
              };
            default:
              return {
                type: "progress" as const,
                progress: 0,
              };
          }
        })
      );
  }

  /**
   * Replace an existing file
   */
  replaceFile(
    filename: string,
    file: File,
    category: FileCategory
  ): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return this.http.post<FileUploadResponse>(
      `${this.baseUrl}/files/replace/${category}/${filename}`,
      formData
    );
  }

  /**
   * Get file information
   */
  getFileInfo(filename: string, category: FileCategory): Observable<FileInfo> {
    return this.http.get<FileInfo>(
      `${this.baseUrl}/files/${category}/${filename}/info`
    );
  }

  /**
   * Delete a file
   */
  deleteFile(
    filename: string,
    category: FileCategory
  ): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/files/${category}/${filename}`
    );
  }

  /**
   * Get the full URL for a file
   */
  getFileUrl(filename: string, category: FileCategory): string {
    return `${this.baseUrl}/files/${category}/${filename}`;
  }

  /**
   * Get the serving URL for a file (direct access)
   */
  getServeUrl(filename: string, category: FileCategory): string {
    return `${this.baseUrl}/files/${category}/${filename}`;
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File size must be less than 5MB",
      };
    }

    // Check file type (images only)
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Only image files (JPEG, PNG, GIF, WebP) are allowed",
      };
    }

    return { valid: true };
  }

  /**
   * Create a preview URL for an image file
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Clean up preview URL
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Upload profile picture
   */
  uploadProfilePicture(file: File): Observable<FileUploadResponse> {
    return this.uploadFile(file, FileCategory.PROFILE_PICTURES);
  }

  /**
   * Upload blog image
   */
  uploadBlogImage(file: File): Observable<FileUploadResponse> {
    return this.uploadFile(file, FileCategory.BLOG_IMAGES);
  }

  /**
   * Upload settings image (logo, favicon)
   */
  uploadSettingsImage(file: File): Observable<FileUploadResponse> {
    return this.uploadFile(file, FileCategory.SETTINGS);
  }

  /**
   * Helper to extract filename from URL
   */
  extractFilenameFromUrl(url: string): string | null {
    const match = url.match(/\/files\/[^\/]+\/(.+)$/);
    return match ? match[1] : null;
  }

  /**
   * Helper to extract category from URL
   */
  extractCategoryFromUrl(url: string): FileCategory | null {
    const match = url.match(/\/files\/([^\/]+)\//);
    if (!match) return null;

    const categoryStr = match[1];
    if (Object.values(FileCategory).includes(categoryStr as FileCategory)) {
      return categoryStr as FileCategory;
    }
    return null;
  }
}
