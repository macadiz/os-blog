# Static Files Directory

This directory contains uploaded files organized by category:

- `settings/` - Logo and favicon files
- `profile_pictures/` - User profile picture files  
- `blog_images/` - Blog post image files

## File Organization

Files are automatically organized into subdirectories and given unique names to prevent conflicts.

## Security

- Only authenticated users can upload/delete files
- File type validation ensures only image files are accepted
- File size limited to 5MB maximum
- All files are served with appropriate cache headers
