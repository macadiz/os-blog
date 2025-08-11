import { Injectable } from "@angular/core";
import { resolveFileUrl } from "./resolve-file-url.util";

@Injectable({
  providedIn: "root",
})
export class FaviconService {
  setFavicon(faviconUrl: string | null | undefined): void {
    if (!faviconUrl) {
      // Use default favicon if no custom one is set
      this.setDefaultFavicon();
      return;
    }

    // Find existing favicon links
    const existingLinks = document.querySelectorAll('link[rel*="icon"]');

    // Remove existing favicon links
    existingLinks.forEach((link) => {
      link.remove();
    });

    // Create new favicon link
    this.createFaviconLink(this.resolveFaviconUrl(faviconUrl));
  }

  private resolveFaviconUrl(faviconUrl: string): string {
    return resolveFileUrl(faviconUrl) || faviconUrl;
  }

  private setDefaultFavicon(): void {
    // Find existing favicon links
    const existingLinks = document.querySelectorAll('link[rel*="icon"]');

    // Check if default favicon already exists
    const hasDefaultFavicon = Array.from(existingLinks).some((link: Element) =>
      (link as HTMLLinkElement).href.includes("favicon.ico")
    );

    if (!hasDefaultFavicon) {
      // Remove custom favicons
      existingLinks.forEach((link: Element) => {
        if (!(link as HTMLLinkElement).href.includes("favicon.ico")) {
          link.remove();
        }
      });

      // Add default favicon if it doesn't exist
      if (existingLinks.length === 0) {
        this.createFaviconLink("/favicon.ico");
      }
    }
  }

  private createFaviconLink(href: string): void {
    const head = document.getElementsByTagName("head")[0];

    // Create main favicon link
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/x-icon";
    link.href = href;
    head.appendChild(link);

    // Also create shortcut icon for older browsers
    const shortcutLink = document.createElement("link");
    shortcutLink.rel = "shortcut icon";
    shortcutLink.type = "image/x-icon";
    shortcutLink.href = href;
    head.appendChild(shortcutLink);
  }
}
