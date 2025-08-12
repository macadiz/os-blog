# File Upload System Documentation

## Overview

The file upload system provides secure image upload and management capabilities for the OS Blog platform. It supports three main categories of files and provides transactional file replacement.

## Features

- **Secure Upload**: JWT authentication required for uploads and deletions
- **File Categories**: Organized storage in `settings`, `profile_pictures`, and `blog_images`
- **Transactional Updates**: When replacing files, old files are deleted atomically
- **File Validation**: Size limits (5MB) and type validation (JPEG, PNG, GIF, WebP, SVG)
- **Efficient Serving**: Static files served with appropriate cache headers
- **Unique Naming**: UUID-based filenames prevent conflicts

## API Endpoints

### Upload File
```
POST /api/files/upload/{category}
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>

Body: file (binary)
```

### Replace File (Transactional)
```
POST /api/files/replace/{category}/{filename}
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>

Body: file (binary)
```

### Serve File
```
GET /api/files/{category}/{filename}
```

### Delete File
```
DELETE /api/files/{category}/{filename}
Authorization: Bearer <jwt-token>
```

### Get File Info
```
GET /api/files/{category}/{filename}/info
```

## Categories

- **`settings`**: Blog logos, favicons, and theme images
- **`profile_pictures`**: User avatar images
- **`blog_images`**: Images used in blog posts

## File Structure

```
static/
├── settings/
│   ├── uuid-1.png (logo)
│   └── uuid-2.ico (favicon)
├── profile_pictures/
│   ├── uuid-3.jpg (user avatar)
│   └── uuid-4.png (another avatar)
└── blog_images/
    ├── uuid-5.jpg (blog post image)
    └── uuid-6.png (another blog image)
```

## Response Examples

### Upload Success
```json
{
  "filename": "a1b2c3d4-e5f6-7890-1234-567890abcdef.jpg",
  "originalName": "profile-picture.jpg",
  "url": "/api/files/profile_pictures/a1b2c3d4-e5f6-7890-1234-567890abcdef.jpg",
  "size": 1024576,
  "mimeType": "image/jpeg"
}
```

### File Info
```json
{
  "filename": "a1b2c3d4-e5f6-7890-1234-567890abcdef.jpg",
  "category": "profile_pictures",
  "url": "/api/files/profile_pictures/a1b2c3d4-e5f6-7890-1234-567890abcdef.jpg",
  "exists": true
}
```

## Error Handling

- **400 Bad Request**: Invalid file type, size too large, or upload failure
- **401 Unauthorized**: Missing or invalid JWT token
- **404 Not Found**: File doesn't exist
- **500 Internal Server Error**: Server-side upload issues

## Security Considerations

- All upload/delete operations require JWT authentication
- File type validation prevents malicious uploads
- File size limits prevent abuse
- Unique filenames prevent path traversal attacks
- Static files are served with cache headers for performance

## Integration Examples

### Upload Profile Picture
```typescript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('/api/files/upload/profile_pictures', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  },
  body: formData
});

const result = await response.json();
console.log('Uploaded:', result.url);
```

### Replace Logo
```typescript
const formData = new FormData();
formData.append('file', newLogoFile);

const response = await fetch('/api/files/replace/settings/current-logo.png', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  },
  body: formData
});
```
