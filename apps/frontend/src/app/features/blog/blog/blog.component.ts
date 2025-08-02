import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ApiService, BlogPost } from "../../../core/services/api.service";

interface BlogSettings {
  blogTitle: string;
  blogDescription?: string;
}

@Component({
  selector: "app-blog",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./blog.component.html",
  styleUrls: ["./blog.component.css"],
})
export class BlogComponent implements OnInit {
  posts: BlogPost[] = [];
  blogSettings: BlogSettings | null = null;
  isLoading = true;

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
      error: (error: any) => {
        console.error("Failed to load blog settings:", error);
      },
    });
  }

  private loadPosts() {
    this.apiService.getPublishedPosts().subscribe({
      next: (posts: BlogPost[]) => {
        this.posts = posts;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error("Failed to load posts:", error);
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
      <svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
      </svg>
    `;
    container.appendChild(placeholder);
  }
}
