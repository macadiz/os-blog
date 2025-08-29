// Utility to resolve file/image URLs (relative or absolute) for the frontend
import { environment } from "../../../environments/environment";
import { resolveBaseUrl } from "../utils/url-resolver.util";

/**
 * Resolves a file or image URL to an absolute URL if needed.
 * - If the input is an absolute URL (starts with http/https), returns as is.
 * - If the input is a relative path (starts with /), prepends the API base URL.
 * - If input is falsy, returns undefined.
 */
export function resolveFileUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//.test(url)) return url;
  if (url.startsWith("/")) {
    let baseUrl = resolveBaseUrl();

    // If baseUrl is relative (like "/api"), prepend current origin
    if (baseUrl.startsWith("/")) {
      baseUrl = window.location.origin + baseUrl;
    } else {
      // Remove trailing slash from absolute baseUrl if present
      baseUrl = baseUrl.replace(/\/$/, "");
    }

    return baseUrl + url;
  }
  return url;
}
