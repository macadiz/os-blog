import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ApiService, BlogPost } from "../../../core/services/api.service";
import { BlogUnavailableComponent } from "../../../shared/components/blog-unavailable/blog-unavailable.component";

interface BlogSettings {
  blogTitle: string;
  blogDescription?: string;
}

@Component({
  selector: "app-blog",
  standalone: true,
  imports: [CommonModule, RouterModule, BlogUnavailableComponent],
  templateUrl: "./blog.component.html",
  styleUrls: ["./blog.component.css"],
})
export class BlogComponent implements OnInit {
  posts: BlogPost[] = [];
  blogSettings: BlogSettings | null = null;
  isLoading = true;
  isBlogUnavailable = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadBlogSettings();
    this.loadPosts();
  }

  private loadBlogSettings() {
    this.apiService.getBlogSettings().subscribe({
      next: (settings: BlogSettings) => {
        this.blogSettings = settings;
      },
      error: () => {
        // If settings fail to load, show blog unavailable page
        this.isBlogUnavailable = true;
        this.isLoading = false;
      },
    });
  }

  private loadPosts() {
    this.apiService.getPublishedPosts().subscribe({
      next: (posts: BlogPost[]) => {
        this.posts = posts;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onImageError(event: any) {
    // Hide the broken image and show placeholder
    const imgElement = event.target;
    const container = imgElement.parentElement;

    // Hide the image
    imgElement.style.display = "none";

    // Create and show placeholder
    const placeholder = document.createElement("div");
    placeholder.className =
      "h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center";
    placeholder.innerHTML = `
      <span class="material-symbols-outlined text-4xl text-gray-400">image</span>
    `;
    container.appendChild(placeholder);
  }
}
