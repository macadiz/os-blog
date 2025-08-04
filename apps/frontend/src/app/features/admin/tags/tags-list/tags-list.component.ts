import { Component, inject, OnInit, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { TagsService, type Tag } from "../../../../core/services/tags.service";
import {
  DropdownMenuItemComponent,
  type DropdownMenuItem,
} from "../../../../shared/components/dropdown-menu-item/dropdown-menu-item.component";

@Component({
  selector: "app-tags-list",
  standalone: true,
  imports: [CommonModule, RouterModule, DropdownMenuItemComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Tags</h1>
          <p class="mt-2 text-sm text-gray-700">
            Manage your blog tags. Tags with 0 posts can be safely deleted.
          </p>
        </div>
        <div class="mt-4 sm:mt-0">
          <a
            routerLink="/admin/tags/new"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span class="material-symbols-outlined text-base mr-2">add</span>
            New Tag
          </a>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="flex justify-center py-12">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
          ></div>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-700">
            {{ error() }}
          </div>
        </div>
      }

      <!-- Tags List -->
      @if (!isLoading() && !error()) {
        <div class="bg-white shadow sm:rounded-md">
          @if (tags().length === 0) {
            <div class="text-center py-12">
              <span
                class="material-symbols-outlined text-4xl text-gray-300 mb-4 block"
              >
                sell
              </span>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                No tags yet
              </h3>
              <p class="text-gray-500 mb-4">
                Get started by creating your first tag.
              </p>
              <a
                routerLink="/admin/tags/new"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <span class="material-symbols-outlined text-base mr-2"
                  >add</span
                >
                Create Tag
              </a>
            </div>
          } @else {
            <ul class="divide-y divide-gray-200">
              @for (tag of tags(); track tag.id) {
                <li class="px-6 py-4 hover:bg-gray-50">
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <div class="flex items-center">
                        <div>
                          <h3 class="text-lg font-medium text-gray-900">
                            {{ tag.name }}
                          </h3>
                          <p class="text-sm text-gray-500">
                            Slug: {{ tag.slug }}
                            @if (tag._count) {
                              • {{ tag._count.postTags }}
                              {{ tag._count.postTags === 1 ? "post" : "posts" }}
                            }
                          </p>
                          <p class="text-xs text-gray-400 mt-1">
                            Created {{ formatDate(tag.createdAt) }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Actions Dropdown -->
                    <div class="relative">
                      <button
                        type="button"
                        class="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
                        [attr.aria-expanded]="openDropdown() === tag.id"
                        (click)="toggleDropdown(tag.id)"
                      >
                        <span class="sr-only">Open options</span>
                        <span class="material-symbols-outlined text-xl"
                          >more_vert</span
                        >
                      </button>

                      @if (openDropdown() === tag.id) {
                        <div
                          class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10"
                        >
                          <div class="py-1">
                            <app-dropdown-menu-item
                              [item]="getEditMenuItem(tag)"
                              (itemClick)="closeDropdown()"
                            />
                            <app-dropdown-menu-item
                              [item]="getDeleteMenuItem(tag)"
                              (itemClick)="closeDropdown()"
                            />
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </li>
              }
            </ul>
          }
        </div>
      }
    </div>

    <!-- Click outside to close dropdown -->
    @if (openDropdown()) {
      <div
        class="fixed inset-0 z-0"
        (click)="closeDropdown()"
        aria-hidden="true"
      ></div>
    }
  `,
})
export class TagsListComponent implements OnInit {
  private readonly tagsService = inject(TagsService);

  tags = signal<Tag[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  openDropdown = signal<string | null>(null);

  ngOnInit() {
    this.loadTags();
  }

  private loadTags() {
    this.isLoading.set(true);
    this.error.set(null);

    this.tagsService.getAllTags().subscribe({
      next: (tags) => {
        this.tags.set(tags);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Error loading tags:", err);
        this.error.set("Failed to load tags. Please try again.");
        this.isLoading.set(false);
      },
    });
  }

  toggleDropdown(tagId: string) {
    this.openDropdown.set(this.openDropdown() === tagId ? null : tagId);
  }

  closeDropdown() {
    this.openDropdown.set(null);
  }

  getEditMenuItem(tag: Tag): DropdownMenuItem {
    return {
      label: "Edit tag",
      icon: "edit",
      routerLink: ["/admin/tags", tag.id, "edit"],
      type: "link",
    };
  }

  getDeleteMenuItem(tag: Tag): DropdownMenuItem {
    return {
      label: "Delete tag",
      icon: "delete",
      variant: "danger",
      type: "button",
      action: () => this.deleteTag(tag),
    };
  }

  deleteTag(tag: Tag) {
    if (!confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
      return;
    }

    this.tagsService.deleteTag(tag.id).subscribe({
      next: () => {
        this.tags.update((tags) => tags.filter((t) => t.id !== tag.id));
      },
      error: (err) => {
        console.error("Error deleting tag:", err);
        if (err.status === 409) {
          alert("Cannot delete this tag because it is being used by posts.");
        } else {
          alert("Failed to delete tag. Please try again.");
        }
      },
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
