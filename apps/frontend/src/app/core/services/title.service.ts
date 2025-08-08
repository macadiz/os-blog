import { Injectable } from "@angular/core";
import { Title, Meta } from "@angular/platform-browser";
import { ApiService } from "./api.service";
import { BehaviorSubject, Observable } from "rxjs";

export interface BlogSettings {
  blogTitle: string;
  blogDescription?: string;
}

@Injectable({
  providedIn: "root",
})
export class TitleService {
  private blogSettingsSubject = new BehaviorSubject<BlogSettings | null>(null);
  public blogSettings$ = this.blogSettingsSubject.asObservable();

  constructor(
    private title: Title,
    private meta: Meta,
    private apiService: ApiService
  ) {
    this.loadBlogSettings();
  }

  private loadBlogSettings() {
    this.apiService.getBlogSettings().subscribe({
      next: (settings: BlogSettings) => {
        this.blogSettingsSubject.next(settings);
      },
      error: (error) => {
        console.warn("Failed to load blog settings:", error);
        // Fallback to default, but signal that there was an error
        // This allows components to detect when the blog is unavailable
        this.blogSettingsSubject.next(null);
      },
    });
  }

  /**
   * Set the page title for the blog homepage
   */
  setBlogTitle(description?: string) {
    const settings = this.blogSettingsSubject.value;
    if (settings) {
      this.title.setTitle(settings.blogTitle);
      this.setMetaDescription(description || settings.blogDescription || "");
    } else {
      this.title.setTitle("Open Blog");
      this.setMetaDescription(description || "A modern blogging platform");
    }
  }

  /**
   * Set the page title for individual blog posts
   */
  setPostTitle(
    postTitle: string,
    metaTitle?: string,
    metaDescription?: string,
    excerpt?: string
  ) {
    const settings = this.blogSettingsSubject.value;
    const blogName = settings?.blogTitle || "Open Blog";

    // Use metaTitle if available, otherwise use post title + blog name
    const finalTitle = metaTitle || `${postTitle} - ${blogName}`;
    this.title.setTitle(finalTitle);

    // Set meta description
    const description = metaDescription || excerpt || "";
    this.setMetaDescription(description);
  }

  /**
   * Set a custom page title (for admin pages, etc.)
   */
  setCustomTitle(pageTitle: string) {
    const settings = this.blogSettingsSubject.value;
    const blogName = settings?.blogTitle || "Open Blog";
    this.title.setTitle(`${pageTitle} - ${blogName}`);
  }

  /**
   * Get current blog settings
   */
  getBlogSettings(): BlogSettings | null {
    return this.blogSettingsSubject.value;
  }

  /**
   * Get blog settings as observable
   */
  getBlogSettings$(): Observable<BlogSettings | null> {
    return this.blogSettings$;
  }

  /**
   * Refresh blog settings from API
   */
  refreshBlogSettings() {
    this.loadBlogSettings();
  }

  /**
   * Set meta description
   */
  private setMetaDescription(description: string) {
    if (description) {
      this.meta.updateTag({ name: "description", content: description });
    }
  }
}
