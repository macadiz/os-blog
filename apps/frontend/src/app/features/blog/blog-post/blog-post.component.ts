import { Component, OnInit, AfterViewChecked } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ApiService, BlogPost } from "../../../core/services/api.service";
import { marked } from "marked";

// Import Prism for syntax highlighting
declare var Prism: any;

@Component({
  selector: "app-blog-post",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./blog-post.component.html",
  styleUrls: ["./blog-post.component.css"],
})
export class BlogPostComponent implements OnInit, AfterViewChecked {
  post: BlogPost | null = null;
  parsedContent: string = "";
  isLoading = true;
  errorMessage = "";
  private highlightPending = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {
    // Configure marked options for better security and formatting
    marked.setOptions({
      breaks: true, // Convert line breaks to <br>
      gfm: true, // Enable GitHub Flavored Markdown
    });
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const slug = params["slug"];
      if (slug) {
        this.loadPost(slug);
      } else {
        this.errorMessage = "No post slug provided";
        this.isLoading = false;
      }
    });
  }

  private loadPost(slug: string) {
    this.isLoading = true;
    this.errorMessage = "";

    this.apiService.getPostBySlug(slug).subscribe({
      next: (post: BlogPost) => {
        this.post = post;

        // Parse Markdown content to HTML
        if (post.content) {
          this.parsedContent = marked(post.content) as string;
          this.highlightPending = true; // Flag to trigger syntax highlighting
        }

        this.isLoading = false;

        // Update page title
        if (post.metaTitle) {
          document.title = post.metaTitle;
        } else {
          document.title = post.title;
        }

        // Update meta description
        if (post.metaDescription) {
          this.updateMetaDescription(post.metaDescription);
        } else if (post.excerpt) {
          this.updateMetaDescription(post.excerpt);
        }
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(["/404"]);
      },
    });
  }

  private updateMetaDescription(description: string) {
    const metaTag = document.querySelector('meta[name="description"]');
    if (metaTag) {
      metaTag.setAttribute("content", description);
    } else {
      const newMetaTag = document.createElement("meta");
      newMetaTag.setAttribute("name", "description");
      newMetaTag.setAttribute("content", description);
      document.head.appendChild(newMetaTag);
    }
  }

  ngAfterViewChecked() {
    // Highlight code blocks after content is rendered
    if (this.highlightPending && typeof Prism !== "undefined") {
      Prism.highlightAll();
      this.highlightPending = false;
    }
  }

  onImageError(event: any) {
    // Hide the image if it fails to load
    event.target.style.display = "none";
  }

  goBack() {
    this.router.navigate(["/blog"]);
  }
}
