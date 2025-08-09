# File Upload Integration - Settings & Setup

This document outlines the implementation of file upload functionality in the blog settings and setup pages.

## Overview

The file upload system has been successfully integrated into two key areas:
1. **Setup Page** - Initial blog configuration with logo and favicon upload
2. **Admin Blog Settings** - Ongoing blog management with asset uploads

## Setup Page Integration

**Location**: `/apps/frontend/src/app/features/setup/setup/`

### Features Added:
- **Logo Upload**: Blog logo upload during initial setup
- **Favicon Upload**: Favicon upload during initial setup
- **Form Integration**: File URLs automatically populate form fields
- **Validation**: Client-side file validation with error handling

### Usage:
During the initial blog setup, users can now:
- Upload a blog logo (max 2MB, images only)
- Upload a favicon (max 1MB, images only)
- Preview uploaded images before submission
- Complete setup with uploaded assets automatically configured

### Technical Implementation:
```typescript
// Logo upload configuration
logoUploadConfig: FileUploadConfig = {
  category: FileCategory.SETTINGS,
  accept: 'image/*',
  maxSize: 2 * 1024 * 1024, // 2MB
  placeholder: 'Upload blog logo (optional)',
  showPreview: true,
  previewSize: 'medium'
};

// Form integration
onLogoUploaded(fileResponse: FileUploadResponse) {
  this.setupForm.patchValue({
    logoUrl: fileResponse.url
  });
}
```

## Admin Blog Settings Integration

**Location**: `/apps/frontend/src/app/features/admin/blog-settings/`

### Features Added:
- **Logo Management**: Upload, replace, or remove blog logo
- **Favicon Management**: Upload, replace, or remove favicon
- **Real-time Preview**: See changes immediately
- **Form Synchronization**: Uploaded files sync with form data
- **Success Feedback**: Visual confirmation of upload actions

### Usage:
In the admin panel, users can:
- Manage blog logo with drag-and-drop or file picker
- Update favicon with visual preview
- See real-time feedback on upload progress
- Save all settings changes together

### Technical Implementation:
```typescript
// Upload handlers with feedback
onLogoUploaded(fileResponse: FileUploadResponse) {
  this.settingsForm.patchValue({
    logoUrl: fileResponse.url
  });
  this.message = "Logo uploaded successfully";
  setTimeout(() => this.message = "", 3000);
}
```

## File Organization

All uploaded files are organized by category:
- **Logo files**: Stored in `/static/settings/` directory
- **Favicon files**: Stored in `/static/settings/` directory
- **Unique naming**: UUID-based filenames prevent conflicts
- **Secure access**: JWT authentication required for uploads

## API Integration

Both components integrate with the backend file upload system:
- **Upload Endpoint**: `POST /files/upload`
- **Replace Endpoint**: `PUT /files/replace/:filename`
- **Delete Endpoint**: `DELETE /files/:filename`
- **Serve Endpoint**: `GET /files/serve/:filename` (public access)

## Security Features

- **Authentication**: JWT required for all upload operations
- **File Validation**: Size and type restrictions enforced
- **Error Handling**: Comprehensive error messages and feedback
- **Clean URLs**: Direct file serving with appropriate cache headers

## User Experience

### Setup Flow:
1. User enters basic blog information
2. Optionally uploads logo and favicon
3. Files are immediately processed and validated
4. Setup completes with all assets properly configured

### Settings Management:
1. Admin accesses blog settings
2. Current assets are displayed with preview
3. New files can be uploaded with real-time feedback
4. Changes are saved together with other settings

## File Upload Component Features

- **Drag & Drop**: Full drag-and-drop support
- **Progress Tracking**: Visual progress bars during upload
- **Preview**: Real-time image preview
- **Validation**: Client-side size and type validation
- **Error Handling**: Clear error messages and recovery
- **Responsive Design**: Works on all device sizes

## Benefits

1. **User-Friendly**: Intuitive upload interface with visual feedback
2. **Secure**: JWT authentication and file validation
3. **Organized**: Automatic file organization and unique naming
4. **Performance**: Efficient file serving with caching
5. **Integrated**: Seamless integration with existing forms and workflows

## Next Steps

The file upload system is now ready for:
- Profile picture uploads in user management
- Featured image uploads in blog post creation/editing
- Additional asset types as needed

All components follow the same patterns established in the settings and setup pages, ensuring consistency across the application.
