import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { TagsService, type Tag } from "../../../../core/services/tags.service";
import { CreateButtonComponent } from "../../../../shared/components/create-button/create-button.component";
import { CardComponent } from "../../../../shared/ui";

@Component({
  selector: "app-tags-list",
  standalone: true,
  imports: [CommonModule, RouterModule, CreateButtonComponent, CardComponent],
  templateUrl: "./tags-list.component.html",
})
export class TagsListComponent implements OnInit {
  private readonly tagsService = inject(TagsService);

  tags = signal<Tag[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

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
