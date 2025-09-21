import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CategoryData {
  name: string;
  id?: string;
}

export type CategoryDisplaySize = 'sm' | 'md' | 'lg';
export type CategoryDisplayVariant = 'default' | 'minimal';

@Component({
  selector: 'app-category-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="getCategoryClasses()">
      <span *ngIf="showIcon" class="material-symbols-outlined mr-1" [class]="getIconSizeClass()">folder</span>
      {{ category.name }}
    </span>
  `,
})
export class CategoryDisplayComponent {
  @Input() category!: CategoryData;
  @Input() size: CategoryDisplaySize = 'md';
  @Input() variant: CategoryDisplayVariant = 'default';
  @Input() showIcon = true;

  getCategoryClasses(): string {
    const baseClasses = 'inline-flex items-center rounded-lg themed-border border';

    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base'
    };

    const variantClasses = {
      default: 'bg-theme-accent/10 themed-accent',
      minimal: 'themed-surface-alt themed-text-secondary'
    };

    return `${baseClasses} ${sizeClasses[this.size]} ${variantClasses[this.variant]}`;
  }

  getIconSizeClass(): string {
    const iconSizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    };
    return iconSizes[this.size];
  }
}