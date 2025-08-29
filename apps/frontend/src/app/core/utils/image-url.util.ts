import { environment } from "../../../environments/environment";
import { resolveBaseUrl } from "./url-resolver.util";

/**
 * Utility functions for handling image URLs in different environments
 */
export class ImageUrlUtil {
  /**
   * Convert relative image URL to absolute URL based on environment
   *
   * Development: Use BASE_URL env var or fallback to 'http://localhost:3001'
   * Production: Use current base URL + /api
   *
   * @param imagePath - The relative or absolute image path
   * @returns Absolute URL for the image
   */
  static getAbsoluteImageUrl(imagePath: string): string {
    if (!imagePath) return "";

    // If it's already an absolute URL (starts with http/https), return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    // Handle relative paths based on environment
    if (environment.production) {
      // Production: use current base URL, add /api only if not already present
      const currentBaseUrl = window.location.origin;
      const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

      // If path already starts with /api, don't add another /api prefix (backward compatibility)
      if (cleanPath.startsWith("/api/")) {
        return `${currentBaseUrl}${cleanPath}`;
      } else {
        // For clean relative paths like /files/category/filename, add /api prefix in production
        return `${currentBaseUrl}/api${cleanPath}`;
      }
    } else {
      // Development: use BASE_URL env var or fallback to http://localhost:3001
      const baseUrl = resolveBaseUrl();
      const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
      return `${baseUrl}${cleanPath}`;
    }
  }

  /**
   * Process HTML content to convert relative image URLs to absolute
   *
   * @param content - HTML content containing img tags
   * @returns Processed HTML with absolute image URLs
   */
  static processContentImages(content: string): string {
    return content.replace(
      /<img([^>]+)src=["']([^"']+)["']([^>]*)>/gi,
      (match, before, src, after) => {
        // If it's already an absolute URL, leave it as is
        if (src.startsWith("http://") || src.startsWith("https://")) {
          return match;
        }

        const absoluteSrc = ImageUrlUtil.getAbsoluteImageUrl(src);
        return `<img${before}src="${absoluteSrc}"${after}>`;
      }
    );
  }
}
