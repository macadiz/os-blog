import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { ApiService } from "../../../../core/services/api.service";
import { AuthService } from "../../../../core/services/auth.service";

@Component({
  selector: "app-posts-list",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./posts-list.component.html",
  styleUrls: ["./posts-list.component.css"],
})
export class PostsListComponent implements OnInit {
  posts: any[] = [];
  filteredPosts: any[] = [];
  isLoading = false;
  errorMessage = "";
  currentUser: any = null;
  showMyPostsOnly = true; // Default to showing only user's posts

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Get current user
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.loadPosts();
    });
  }

  loadPosts() {
    this.isLoading = true;
    this.errorMessage = "";

    this.apiService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.filterPosts();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = "Failed to load posts";
        this.isLoading = false;
        console.error("Error loading posts:", error);
      },
    });
  }

  filterPosts() {
    if (this.showMyPostsOnly && this.currentUser) {
      // Show only posts by current user
      this.filteredPosts = this.posts.filter(
        (post) => post.author && post.author.id === this.currentUser.id
      );
    } else {
      // Show all posts
      this.filteredPosts = [...this.posts];
    }
  }

  togglePostFilter() {
    this.showMyPostsOnly = !this.showMyPostsOnly;
    this.filterPosts();
  }

  get filterButtonText(): string {
    return this.showMyPostsOnly ? "Show All Posts" : "Show My Posts";
  }

  get currentFilterText(): string {
    return this.showMyPostsOnly ? "My Posts" : "All Posts";
  }

  canEditPost(post: any): boolean {
    if (!this.currentUser) return false;

    // Admins can edit all posts, authors can only edit their own
    return (
      this.currentUser.role === "ADMIN" ||
      (post.author && post.author.id === this.currentUser.id)
    );
  }

  canDeletePost(post: any): boolean {
    if (!this.currentUser) return false;

    // Admins can delete all posts, authors can only delete their own
    return (
      this.currentUser.role === "ADMIN" ||
      (post.author && post.author.id === this.currentUser.id)
    );
  }

  getAuthorName(author: any): string {
    if (!author) return "Unknown Author";

    if (author.firstName && author.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }

    return author.username || author.email || "Unknown Author";
  }

  getAuthorInitials(author: any): string {
    if (!author) return "?";

    if (author.firstName && author.lastName) {
      return `${author.firstName.charAt(0)}${author.lastName.charAt(0)}`.toUpperCase();
    }

    if (author.username) {
      return author.username.charAt(0).toUpperCase();
    }

    if (author.email) {
      return author.email.charAt(0).toUpperCase();
    }

    return "?";
  }

  onDelete(postId: string) {
    if (confirm("Are you sure you want to delete this post?")) {
      this.apiService.deletePost(postId).subscribe({
        next: () => {
          this.posts = this.posts.filter((post) => post.id !== postId);
          this.filterPosts(); // Re-filter after deletion
        },
        error: (error) => {
          this.errorMessage = "Failed to delete post";
          console.error("Error deleting post:", error);
        },
      });
    }
  }
}
