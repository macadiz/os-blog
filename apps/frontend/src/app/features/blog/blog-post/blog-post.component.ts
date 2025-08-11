import {
  Component,
  OnInit,
  AfterViewChecked,
  ViewEncapsulation,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ApiService, BlogPost } from "../../../core/services/api.service";
import { TitleService } from "../../../core/services/title.service";
import { marked } from "marked";

// Import Prism for syntax highlighting
declare var Prism: any;

@Component({
  selector: "app-blog-post",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./blog-post.component.html",
  styleUrls: ["./blog-post.component.css"],
  encapsulation: ViewEncapsulation.None, // Disable view encapsulation
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
    private apiService: ApiService,
    private titleService: TitleService
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

        // Update page title and meta using title service
        this.titleService.setPostTitle(
          post.title,
          post.metaTitle,
          post.metaDescription,
          post.excerpt
        );
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(["/404"]);
      },
    });
  }

  ngAfterViewChecked() {
    // Highlight code blocks after content is rendered
    if (this.highlightPending && typeof Prism !== "undefined") {
      Prism.highlightAll();
      this.highlightPending = false;
    }
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.style.display = "none";
  }

  goBack() {
    // Restore blog title when going back
    this.titleService.setBlogTitle();
    this.router.navigate(["/blog"]);
  }
}
