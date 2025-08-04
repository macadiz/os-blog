import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute, RouterModule } from "@angular/router";
import {
  TagsService,
  type Tag,
  type CreateTagDto,
  type UpdateTagDto,
} from "../../../../core/services/tags.service";

@Component({
  selector: "app-tag-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: "./tag-form.component.html",
})
export class TagFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tagsService = inject(TagsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  tagForm = this.fb.group({
    name: ["", [Validators.required, Validators.maxLength(50)]],
  });

  isEdit = signal(false);
  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  private tagId: string | null = null;

  ngOnInit() {
    this.tagId = this.route.snapshot.paramMap.get("id");
    this.isEdit.set(!!this.tagId);

    if (this.isEdit()) {
      this.loadTag();
    }
  }

  private loadTag() {
    if (!this.tagId) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.tagsService.getTagById(this.tagId).subscribe({
      next: (tag: Tag) => {
        this.tagForm.patchValue({
          name: tag.name,
        });
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error("Error loading tag:", err);
        this.error.set("Failed to load tag. Please try again.");
        this.isLoading.set(false);
      },
    });
  }

  onSubmit() {
    if (this.tagForm.invalid) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    const formValue = this.tagForm.value;

    if (this.isEdit() && this.tagId) {
      // Update existing tag
      const updateData: UpdateTagDto = {
        name: formValue.name || undefined,
      };

      this.tagsService.updateTag(this.tagId, updateData).subscribe({
        next: () => {
          this.router.navigate(["/admin/tags"]);
        },
        error: (err: any) => {
          console.error("Error updating tag:", err);
          if (err.status === 409) {
            this.error.set("A tag with this name already exists.");
          } else {
            this.error.set("Failed to update tag. Please try again.");
          }
          this.isSubmitting.set(false);
        },
      });
    } else {
      // Create new tag
      const createData: CreateTagDto = {
        name: formValue.name!,
      };

      this.tagsService.createTag(createData).subscribe({
        next: () => {
          this.router.navigate(["/admin/tags"]);
        },
        error: (err: any) => {
          console.error("Error creating tag:", err);
          if (err.status === 409) {
            this.error.set("A tag with this name already exists.");
          } else {
            this.error.set("Failed to create tag. Please try again.");
          }
          this.isSubmitting.set(false);
        },
      });
    }
  }

  onCancel() {
    this.router.navigate(["/admin/tags"]);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.tagForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  generateSlugPreview(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
