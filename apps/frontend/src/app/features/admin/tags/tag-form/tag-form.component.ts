import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import {
  TagsService,
  type Tag,
  type CreateTagDto,
  type UpdateTagDto,
} from "../../../../core/services/tags.service";

@Component({
  selector: "app-tag-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEdit() ? "Edit Tag" : "Create New Tag" }}
        </h1>
        <p class="mt-2 text-sm text-gray-700">
          {{
            isEdit()
              ? "Update the tag information below."
              : "Fill in the details to create a new tag."
          }}
        </p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="flex justify-center py-12">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
        </div>
      } @else {
        <!-- Form -->
        <form [formGroup]="tagForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div class="md:grid md:grid-cols-3 md:gap-6">
              <div class="md:col-span-1">
                <h3 class="text-lg font-medium leading-6 text-gray-900">
                  Tag Information
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                  Basic information about the tag. The slug will be
                  automatically generated from the name.
                </p>
              </div>
              <div class="mt-5 md:mt-0 md:col-span-2">
                <div class="space-y-6">
                  <!-- Name Field -->
                  <div>
                    <label
                      for="name"
                      class="block text-sm font-medium text-gray-700"
                    >
                      Name <span class="text-red-500">*</span>
                    </label>
                    <div class="mt-1">
                      <input
                        type="text"
                        id="name"
                        formControlName="name"
                        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        [class.border-red-300]="isFieldInvalid('name')"
                        placeholder="e.g., JavaScript, React, Angular"
                      />
                      @if (isFieldInvalid("name")) {
                        <p class="mt-2 text-sm text-red-600">
                          @if (tagForm.get("name")?.errors?.["required"]) {
                            Tag name is required.
                          }
                          @if (tagForm.get("name")?.errors?.["maxlength"]) {
                            Tag name cannot exceed 50 characters.
                          }
                        </p>
                      }
                    </div>
                    <p class="mt-2 text-sm text-gray-500">
                      Choose a descriptive name for your tag. It will be used to
                      categorize your posts.
                    </p>
                  </div>

                  <!-- Preview Slug -->
                  @if (tagForm.get("name")?.value) {
                    <div>
                      <label class="block text-sm font-medium text-gray-700">
                        Generated Slug (Preview)
                      </label>
                      <div
                        class="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600"
                      >
                        {{
                          generateSlugPreview(tagForm.get("name")?.value || "")
                        }}
                      </div>
                      <p class="mt-2 text-sm text-gray-500">
                        This is how your tag will appear in URLs.
                      </p>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          @if (error()) {
            <div class="rounded-md bg-red-50 p-4">
              <div class="text-sm text-red-700">
                {{ error() }}
              </div>
            </div>
          }

          <!-- Form Actions -->
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              (click)="onCancel()"
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="isSubmitting() || tagForm.invalid"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (isSubmitting()) {
                <span class="inline-flex items-center">
                  <svg
                    class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {{ isEdit() ? "Updating..." : "Creating..." }}
                </span>
              } @else {
                {{ isEdit() ? "Update Tag" : "Create Tag" }}
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
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
