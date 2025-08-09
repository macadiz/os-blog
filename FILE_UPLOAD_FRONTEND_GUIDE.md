# File Upload System - Frontend Integration

This document explains how the frontend file upload system works and how to integrate it with your components.

## Overview

The file upload system provides a complete solution for uploading images to your blog backend, including:

- Profile pictures for users
- Blog logos and favicons
- Featured images for blog posts
- Any other image assets

## Core Components

### 1. FileUploadService (`core/services/file-upload.service.ts`)

The main service that handles all file upload operations:

```typescript
import { FileUploadService } from '../core/services/file-upload.service';

// Upload a file
this.fileUploadService.uploadFile(file, FileCategory.PROFILE_PICTURES)
  .subscribe(response => {
    console.log('File uploaded:', response.url);
  });

// Upload with progress tracking
this.fileUploadService.uploadFileWithProgress(file, FileCategory.BLOG_IMAGES)
  .subscribe(event => {
    if (event.type === 'progress') {
      console.log('Upload progress:', event.progress);
    } else if (event.type === 'complete') {
      console.log('Upload complete:', event.file);
    }
  });

// Delete a file
this.fileUploadService.deleteFile(filename)
  .subscribe(() => {
    console.log('File deleted');
  });
```

### 2. FileUploadComponent (`shared/components/file-upload/file-upload.component.ts`)

A reusable component for file uploads with drag-and-drop support:

```typescript
import { FileUploadComponent, FileUploadConfig } from '../shared/components/file-upload/file-upload.component';

@Component({
  // ...
  imports: [FileUploadComponent]
})
export class MyComponent {
  uploadConfig: FileUploadConfig = {
    category: FileCategory.PROFILE_PICTURES,
    accept: 'image/*',
    maxSize: 5 * 1024 * 1024, // 5MB
    placeholder: 'Upload profile picture',
    showPreview: true,
    previewSize: 'medium'
  };

  onFileUploaded(response: FileUploadResponse) {
    console.log('File uploaded:', response);
  }

  onFileRemoved() {
    console.log('File removed');
  }

  onUploadError(error: string) {
    console.error('Upload error:', error);
  }
}
```

Template usage:
```html
<app-file-upload
  [config]="uploadConfig"
  [currentFileUrl]="currentImageUrl"
  [disabled]="isLoading"
  (fileUploaded)="onFileUploaded($event)"
  (fileRemoved)="onFileRemoved()"
  (uploadError)="onUploadError($event)">
</app-file-upload>
```

### 3. BlogImageUploadComponent (`shared/components/blog-image-upload/blog-image-upload.component.ts`)

A specialized component for blog images:

```html
<app-blog-image-upload
  title="Featured Image"
  [imageUrl]="post.featuredImage"
  [disabled]="isSaving"
  helpText="This image will appear at the top of your post"
  (imageUploaded)="onFeaturedImageUploaded($event)"
  (imageRemoved)="onFeaturedImageRemoved()"
  (uploadError)="onUploadError($event)">
</app-blog-image-upload>
```

## File Categories

The system supports three categories of files:

```typescript
export enum FileCategory {
  SETTINGS = 'settings',           // Blog logos, favicons
  PROFILE_PICTURES = 'profile_pictures', // User profile pictures
  BLOG_IMAGES = 'blog_images'      // Featured images, content images
}
```

## Configuration Options

### FileUploadConfig

```typescript
interface FileUploadConfig {
  category: FileCategory;          // Where to store the file
  accept?: string;                 // MIME types to accept (default: 'image/*')
  maxSize?: number;               // Max file size in bytes (default: 5MB)
  placeholder?: string;           // Upload area placeholder text
  showPreview?: boolean;          // Show image preview (default: true)
  previewSize?: 'small' | 'medium' | 'large'; // Preview size
}
```

## Example Implementations

### 1. Profile Picture Upload

```typescript
// profile-edit.component.ts
export class ProfileEditComponent {
  profilePictureConfig: FileUploadConfig = {
    category: FileCategory.PROFILE_PICTURES,
    accept: 'image/*',
    maxSize: 5 * 1024 * 1024,
    placeholder: 'Upload profile picture',
    showPreview: true,
    previewSize: 'large'
  };

  onProfilePictureUploaded(fileResponse: FileUploadResponse) {
    this.profileForm.patchValue({
      profilePicture: fileResponse.url
    });
    // Update profile via API
    this.apiService.updateProfile({ profilePicture: fileResponse.url })
      .subscribe(user => console.log('Profile updated'));
  }
}
```

### 2. Blog Settings (Logo & Favicon)

```typescript
// blog-settings.component.ts
export class BlogSettingsComponent {
  logoUploadConfig: FileUploadConfig = {
    category: FileCategory.SETTINGS,
    accept: 'image/*',
    maxSize: 2 * 1024 * 1024, // 2MB for logos
    placeholder: 'Upload blog logo',
    showPreview: true,
    previewSize: 'medium'
  };

  faviconUploadConfig: FileUploadConfig = {
    category: FileCategory.SETTINGS,
    accept: 'image/*',
    maxSize: 1 * 1024 * 1024, // 1MB for favicons
    placeholder: 'Upload favicon',
    showPreview: true,
    previewSize: 'small'
  };

  onLogoUploaded(fileResponse: FileUploadResponse) {
    this.settingsForm.patchValue({ logoUrl: fileResponse.url });
  }

  onFaviconUploaded(fileResponse: FileUploadResponse) {
    this.settingsForm.patchValue({ faviconUrl: fileResponse.url });
  }
}
```

### 3. Blog Post Featured Image

```typescript
// post-edit.component.ts
export class PostEditComponent {
  onFeaturedImageUploaded(fileResponse: FileUploadResponse) {
    this.postForm.patchValue({
      featuredImage: fileResponse.url
    });
  }

  onFeaturedImageRemoved() {
    this.postForm.patchValue({
      featuredImage: null
    });
  }
}
```

## API Integration

The file upload service automatically integrates with the backend API:

- **Upload endpoint**: `POST /files/upload`
- **Replace endpoint**: `PUT /files/replace/:filename`  
- **Info endpoint**: `GET /files/info/:filename`
- **Delete endpoint**: `DELETE /files/:filename`
- **Serve endpoint**: `GET /files/serve/:filename`

## File URLs

Uploaded files are accessible via two URL patterns:

1. **API URL**: `${apiUrl}/files/${filename}` - Requires authentication
2. **Serve URL**: `${apiUrl}/files/serve/${filename}` - Public access with caching

Use the serve URL for displaying images in your templates:

```typescript
getImageUrl(filename: string): string {
  return this.fileUploadService.getServeUrl(filename);
}
```

## Validation

The system includes automatic validation:

- **File size**: Maximum 5MB (configurable)
- **File type**: Images only (JPEG, PNG, GIF, WebP)
- **Security**: JWT authentication required for uploads

## Error Handling

All components emit error events for proper error handling:

```typescript
onUploadError(error: string) {
  // Display error to user
  this.showErrorMessage(error);
}
```

Common errors:
- File too large
- Invalid file type
- Network errors
- Authentication failures

## Best Practices

1. **Always handle errors**: Implement error handling for upload failures
2. **Show progress**: Use progress tracking for large files
3. **Validate client-side**: Check file size and type before uploading
4. **Provide feedback**: Show success/error messages to users
5. **Clean up**: Remove old files when replacing them
6. **Use appropriate categories**: Store files in the correct category folder
7. **Optimize images**: Consider image compression for better performance

## File Structure

```
frontend/src/app/
├── core/services/
│   └── file-upload.service.ts       # Main upload service
├── shared/components/
│   ├── file-upload/                 # Generic upload component
│   │   ├── file-upload.component.ts
│   │   ├── file-upload.component.html
│   │   └── file-upload.component.css
│   └── blog-image-upload/           # Blog-specific upload component
│       └── blog-image-upload.component.ts
└── features/
    ├── profile/                     # Profile edit example
    │   ├── profile-edit.component.ts
    │   ├── profile-edit.component.html
    │   └── profile-edit.component.css
    └── blog-settings/               # Blog settings example
        ├── blog-settings.component.ts
        ├── blog-settings.component.html
        └── blog-settings.component.css
```

This file upload system provides a complete, secure, and user-friendly solution for handling image uploads in your blog application.
