import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { ApiService } from "../../../../core/services/api.service";

@Component({
  selector: "app-posts-list",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./posts-list.component.html",
  styleUrls: ["./posts-list.component.css"],
})
export class PostsListComponent implements OnInit {
  posts: any[] = [];
  isLoading = false;
  errorMessage = "";

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading = true;
    this.errorMessage = "";

    this.apiService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = "Failed to load posts";
        this.isLoading = false;
        console.error("Error loading posts:", error);
      },
    });
  }

  onDelete(postId: string) {
    if (confirm("Are you sure you want to delete this post?")) {
      this.apiService.deletePost(postId).subscribe({
        next: () => {
          this.posts = this.posts.filter((post) => post.id !== postId);
        },
        error: (error) => {
          this.errorMessage = "Failed to delete post";
          console.error("Error deleting post:", error);
        },
      });
    }
  }
}
