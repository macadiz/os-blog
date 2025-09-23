import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { firstValueFrom } from "rxjs";
import {
  ApiService,
  CreatePostDto,
  UpdatePostDto,
  BlogPost,
  Category,
  Tag,
} from "../../../../core/services/api.service";
import {
  FileUploadComponent,
  FileUploadConfig,
} from "../../../../shared/components/file-upload/file-upload.component";
import {
  FileCategory,
  FileUploadResponse,
} from "../../../../shared/components/file-upload/file-upload.component";
import { CardComponent, InputComponent, TextareaComponent, ButtonComponent } from "../../../../shared/ui";

@Component({
  selector: "app-post-editor",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileUploadComponent, CardComponent, InputComponent, TextareaComponent, ButtonComponent],
  templateUrl: "./post-editor.component.html",
  styles: [],
})
export class PostEditorComponent implements OnInit {
  postForm: FormGroup;
  isLoading = false;
  isEditing = false;
  postId: string | null = null;
  errorMessage = "";
  successMessage = "";

  categories: Category[] = [];
  tags: Tag[] = [];
  selectedTagIds: string[] = [];

  // File upload configuration for featured image
  featuredImageUploadConfig: FileUploadConfig = {
    category: FileCategory.BLOG_IMAGES,
    accept: "image/*",
    maxSize: 5 * 1024 * 1024, // 5MB for post images
    placeholder: "Upload featured image",
    showPreview: true,
    previewSize: "large",
  };

  onFeaturedImageUploaded(response: FileUploadResponse) {
    this.postForm.patchValue({
      featuredImage: response.url, // Store the full URL instead of just filename
    });
  }

  onFeaturedImageRemoved() {
    this.postForm.patchValue({
      featuredImage: null,
    });
  }

  onUploadError(error: any) {
    console.error("File upload error:", error);
    // Could show an error toast or message to the user
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {
    this.postForm = this.fb.group({
      title: ["", [Validators.required, Validators.maxLength(200)]],
      content: ["", Validators.required],
      excerpt: ["", Validators.maxLength(500)],
      featuredImage: [""],
      published: [false],
      publishedAt: [""],
      metaTitle: ["", Validators.maxLength(60)],
      metaDescription: ["", Validators.maxLength(160)],
      categoryId: [""],
    });
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.postId = params["id"] || null;
      this.isEditing = !!this.postId;

      if (this.isEditing) {
        this.loadPost();
      }
    });

    this.loadCategories();
    this.loadTags();
  }

  private async loadPost() {
    if (!this.postId) return;

    try {
      this.isLoading = true;
      const post = (await firstValueFrom(
        this.apiService.getPost(this.postId)
      )) as BlogPost;

      if (post) {
        this.postForm.patchValue({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          featuredImage: post.featuredImage,
          published: post.published,
          publishedAt: post.publishedAt
            ? new Date(post.publishedAt).toISOString().slice(0, 16)
            : "",
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          categoryId: post.categoryId || "", // Convert null/undefined to empty string for select placeholder
        });

        this.selectedTagIds = post.tags.map((tag: Tag) => tag.id);
      }
    } catch (error) {
      this.errorMessage = "Failed to load post";
      console.error("Error loading post:", error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadCategories() {
    try {
      this.categories = await firstValueFrom(this.apiService.getCategories());
    } catch (error) {
      console.error("Error loading categories:", error);
      this.categories = [];
    }
  }

  private async loadTags() {
    try {
      this.tags = await firstValueFrom(this.apiService.getTags());
    } catch (error) {
      console.error("Error loading tags:", error);
      this.tags = [];
    }
  }

  onTagToggle(tagId: string) {
    const index = this.selectedTagIds.indexOf(tagId);
    if (index > -1) {
      this.selectedTagIds.splice(index, 1);
    } else {
      this.selectedTagIds.push(tagId);
    }
  }

  isTagSelected(tagId: string): boolean {
    return this.selectedTagIds.includes(tagId);
  }

  async onSubmit() {
    if (this.postForm.invalid) {
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = "";
      this.successMessage = "";

      const formValue = this.postForm.value;
      const postData = {
        title: formValue.title,
        content: formValue.content,
        excerpt: formValue.excerpt || undefined,
        featuredImage: formValue.featuredImage || undefined,
        published: formValue.published || false,
        publishedAt: formValue.published
          ? formValue.publishedAt || new Date().toISOString()
          : undefined,
        metaTitle: formValue.metaTitle || undefined,
        metaDescription: formValue.metaDescription || undefined,
        categoryId: formValue.categoryId || undefined,
        tagIds:
          this.selectedTagIds.length > 0 ? this.selectedTagIds : undefined,
      };

      let result: BlogPost;
      if (this.isEditing && this.postId) {
        const updateData: UpdatePostDto = postData;
        result = await firstValueFrom(
          this.apiService.updatePost(this.postId, updateData)
        );
        this.successMessage = "Post updated successfully!";
      } else {
        const createData: CreatePostDto = postData as CreatePostDto;
        result = await firstValueFrom(this.apiService.createPost(createData));
        this.successMessage = "Post created successfully!";
      }

      // Redirect to posts list after a short delay
      setTimeout(() => {
        this.router.navigate(["/admin/posts"]);
      }, 1500);
    } catch (error: any) {
      this.errorMessage = error.error?.message || "Failed to save post";
      console.error("Error saving post:", error);
    } finally {
      this.isLoading = false;
    }
  }

  onCancel() {
    this.router.navigate(["/admin/posts"]);
  }

  onPublishToggle() {
    const currentValue = this.postForm.get("published")?.value;
    this.postForm.patchValue({ published: !currentValue });
  }

  async onSaveAsDraft() {
    // Set as draft and save
    this.postForm.patchValue({ published: false });
    await this.onSubmit();
  }

  async onPublish() {
    // Set as published and save
    this.postForm.patchValue({ published: true });
    await this.onSubmit();
  }

  private markFormGroupTouched() {
    Object.keys(this.postForm.controls).forEach((key) => {
      const control = this.postForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.postForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.postForm.get(fieldName);
    if (field?.errors) {
      if (field.errors["required"]) return `${fieldName} is required`;
      if (field.errors["maxlength"]) return `${fieldName} is too long`;
      if (field.errors["minlength"]) return `${fieldName} is too short`;
    }
    return "";
  }
}
