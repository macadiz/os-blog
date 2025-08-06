import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  ApiService,
  BlogPost,
  Category,
  Tag,
} from "../../../core/services/api.service";
import { BlogUnavailableComponent } from "../../../shared/components/blog-unavailable/blog-unavailable.component";

interface BlogSettings {
  blogTitle: string;
  blogDescription?: string;
}

@Component({
  selector: "app-blog",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BlogUnavailableComponent],
  templateUrl: "./blog.component.html",
  styleUrls: ["./blog.component.css"],
})
export class BlogComponent implements OnInit {
  posts: BlogPost[] = [];
  filteredPosts: BlogPost[] = [];
  categories: Category[] = [];
  tags: Tag[] = [];
  blogSettings: BlogSettings | null = null;
  isLoading = true;
  isBlogUnavailable = false;

  // Filter properties
  searchQuery = "";
  selectedCategoryId = "";
  selectedTagIds: string[] = [];
  showFilters = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadBlogSettings();
    this.loadPosts();
    this.loadCategories();
    this.loadTags();
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
        this.filteredPosts = posts;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
      },
      error: () => {
        // Fail silently for filters
      },
    });
  }

  private loadTags() {
    this.apiService.getTags().subscribe({
      next: (tags: Tag[]) => {
        this.tags = tags;
      },
      error: () => {
        // Fail silently for filters
      },
    });
  }

  // Filter methods
  applyFilters() {
    let filtered = [...this.posts];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (this.selectedCategoryId) {
      filtered = filtered.filter(
        (post) => post.category?.id === this.selectedCategoryId
      );
    }

    // Tags filter
    if (this.selectedTagIds.length > 0) {
      filtered = filtered.filter((post) =>
        post.tags.some((tag) => this.selectedTagIds.includes(tag.id))
      );
    }

    this.filteredPosts = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onCategoryChange() {
    this.applyFilters();
  }

  onTagToggle(tagId: string) {
    const index = this.selectedTagIds.indexOf(tagId);
    if (index > -1) {
      this.selectedTagIds.splice(index, 1);
    } else {
      this.selectedTagIds.push(tagId);
    }
    this.applyFilters();
  }

  clearFilters() {
    this.searchQuery = "";
    this.selectedCategoryId = "";
    this.selectedTagIds = [];
    this.filteredPosts = [...this.posts];
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchQuery.trim() !== "" ||
      this.selectedCategoryId !== "" ||
      this.selectedTagIds.length > 0
    );
  }

  get filteredPostsCount(): number {
    return this.filteredPosts.length;
  }

  isTagSelected(tagId: string): boolean {
    return this.selectedTagIds.includes(tagId);
  }

  getPostsCountByCategory(categoryId: string): number {
    return this.posts.filter((post) => post.category?.id === categoryId).length;
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find((c) => c.id === categoryId);
    return category ? category.name : "";
  }

  getTagName(tagId: string): string {
    const tag = this.tags.find((t) => t.id === tagId);
    return tag ? tag.name : "";
  }

  trackByPostId(index: number, post: BlogPost): string {
    return post.id;
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
