import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Observable } from "rxjs";
import {
  ApiService,
  BlogPost,
  Category,
  Tag,
  PostsQueryDto,
  PaginatedResponse,
  PaginationMeta,
  BlogMetadata,
  CategoryWithCount,
  TagWithCount,
} from "../../../core/services/api.service";
import { resolveFileUrl } from "../../../core/services/resolve-file-url.util";
import {
  TitleService,
  BlogSettings,
} from "../../../core/services/title.service";
import { BlogUnavailableComponent } from "../../../shared/components/blog-unavailable/blog-unavailable.component";
import { TagDisplayComponent } from "../../../shared/components/tag-display/tag-display.component";
import { CategoryDisplayComponent } from "../../../shared/components/category-display/category-display.component";
import { CardComponent, InputComponent, ButtonComponent } from "../../../shared/ui";

@Component({
  selector: "app-blog",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BlogUnavailableComponent, TagDisplayComponent, CategoryDisplayComponent, CardComponent, InputComponent, ButtonComponent],
  templateUrl: "./blog.component.html",
  styleUrls: ["./blog.component.css"],
})
export class BlogComponent implements OnInit {
  posts: BlogPost[] = [];
  allPosts: BlogPost[] = []; // Keep all loaded posts for client-side filtering
  categories: CategoryWithCount[] = [];
  tags: TagWithCount[] = [];
  blogSettings$: Observable<BlogSettings | null>;
  isLoading = true;
  isBlogUnavailable = false;
  isLoadingMore = false;

  // Pagination
  pagination: PaginationMeta | null = null;
  currentQuery: PostsQueryDto = {
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  };

  // Filter properties
  searchQuery = "";
  selectedCategorySlug = "";
  selectedTagSlugs: string[] = [];
  showFilters = false;

  constructor(
    private apiService: ApiService,
    private titleService: TitleService
  ) {
    this.blogSettings$ = this.titleService.getBlogSettings$();
  }

  // Helper to resolve featured image URLs for posts
  getFeaturedImageSrc(featuredImage?: string | null): string | undefined {
    return resolveFileUrl(featuredImage);
  }

  ngOnInit() {
    this.loadBlogSettings();
  }

  private loadBlogSettings() {
    this.titleService.getBlogSettings$().subscribe({
      next: (settings: BlogSettings | null) => {
        if (settings) {
          // Settings loaded successfully
          this.titleService.setBlogTitle(settings.blogDescription);
          // Now load the blog content
          this.loadPosts();
          this.loadBlogMetadata();
        } else {
          // Settings failed to load, but check if it's just empty settings or an error
          // Try to load posts to see if the API is available
          this.checkBlogAvailability();
        }
      },
      error: () => {
        // Settings failed to load completely
        this.isBlogUnavailable = true;
        this.isLoading = false;
        this.titleService.setBlogTitle();
      },
    });
  }

  private checkBlogAvailability() {
    // Try to load posts to determine if the blog is available
    this.apiService.getPublishedPosts({ page: 1, limit: 1 }).subscribe({
      next: (response) => {
        // API is working, but settings might be missing
        // Load default settings and continue
        this.titleService.setBlogTitle();
        this.loadPosts();
        this.loadBlogMetadata();
      },
      error: (error) => {
        // API is not available
        console.error("Blog API unavailable:", error);
        this.isBlogUnavailable = true;
        this.isLoading = false;
        this.titleService.setBlogTitle();
      },
    });
  }

  private loadPosts() {
    this.apiService.getPublishedPosts(this.currentQuery).subscribe({
      next: (response: PaginatedResponse<BlogPost>) => {
        this.posts = response.data;
        this.allPosts = [...response.data]; // Store all posts for filtering
        this.pagination = response.pagination;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  loadMorePosts() {
    if (!this.pagination?.hasNext || this.isLoadingMore) return;

    this.isLoadingMore = true;
    const nextPageQuery = {
      ...this.currentQuery,
      page: (this.currentQuery.page || 1) + 1,
    };

    this.apiService.getPublishedPosts(nextPageQuery).subscribe({
      next: (response: PaginatedResponse<BlogPost>) => {
        this.posts = [...this.posts, ...response.data];
        this.allPosts = [...this.allPosts, ...response.data];
        this.pagination = response.pagination;
        this.currentQuery = nextPageQuery;
        this.isLoadingMore = false;
      },
      error: () => {
        this.isLoadingMore = false;
      },
    });
  }

  // Apply server-side filters by reloading posts
  applyServerFilters() {
    this.currentQuery = {
      ...this.currentQuery,
      page: 1, // Reset to first page
      search: this.searchQuery || undefined,
      category: this.selectedCategorySlug || undefined,
      tags:
        this.selectedTagSlugs.length > 0 ? this.selectedTagSlugs : undefined, // Use multiple tags
    };

    this.isLoading = true;
    this.posts = [];
    this.allPosts = [];
    this.loadPosts();
  }

  private loadBlogMetadata() {
    this.apiService.getBlogMetadata().subscribe({
      next: (metadata: BlogMetadata) => {
        this.categories = metadata.categories;
        this.tags = metadata.tags;
      },
      error: () => {
        // Fail silently for filters
      },
    });
  }

  // Filter methods - now use server-side filtering
  applyFilters() {
    this.applyServerFilters();
  }

  onSearchChange() {
    // Debounce search to avoid too many API calls
    setTimeout(() => {
      this.applyFilters();
    }, 500);
  }

  onCategoryChange() {
    this.applyFilters();
  }

  onTagToggle(tagSlug: string) {
    const index = this.selectedTagSlugs.indexOf(tagSlug);
    if (index > -1) {
      this.selectedTagSlugs.splice(index, 1);
    } else {
      this.selectedTagSlugs.push(tagSlug); // Support multiple tags
    }
    this.applyFilters();
  }

  clearFilters() {
    this.searchQuery = "";
    this.selectedCategorySlug = "";
    this.selectedTagSlugs = [];
    this.currentQuery = {
      page: 1,
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    this.loadPosts();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchQuery.trim() !== "" ||
      this.selectedCategorySlug !== "" ||
      this.selectedTagSlugs.length > 0
    );
  }

  get filteredPostsCount(): number {
    return this.pagination?.total || this.posts.length;
  }

  get currentPostsCount(): number {
    return this.posts.length;
  }

  get hasMorePosts(): boolean {
    return this.pagination?.hasNext || false;
  }

  isTagSelected(tagSlug: string): boolean {
    return this.selectedTagSlugs.includes(tagSlug);
  }

  getPostsCountByCategory(categorySlug: string): number {
    // Use the postCount from metadata instead of filtering current posts
    const category = this.categories.find((c) => c.slug === categorySlug);
    return category ? category.postCount : 0;
  }

  getCategoryName(categorySlug: string): string {
    const category = this.categories.find((c) => c.slug === categorySlug);
    return category ? category.name : "";
  }

  getTagName(tagSlug: string): string {
    const tag = this.tags.find((t) => t.slug === tagSlug);
    return tag ? tag.name : "";
  }

  trackByPostId(index: number, post: BlogPost): string {
    return post.id;
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.style.display = "none";
  }
}
