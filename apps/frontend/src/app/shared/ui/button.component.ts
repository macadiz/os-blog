import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Router Link Button -->
    <a
      *ngIf="routerLink"
      [routerLink]="routerLink"
      [class]="getButtonClasses()"
      [attr.disabled]="disabled"
    >
      <span *ngIf="prefixIcon" class="material-symbols-outlined" [class]="getIconClasses(true)">
        {{ prefixIcon }}
      </span>
      <ng-content></ng-content>
      <span *ngIf="suffixIcon" class="material-symbols-outlined" [class]="getIconClasses(false)">
        {{ suffixIcon }}
      </span>
      <div *ngIf="loading" [class]="getSpinnerClasses()"></div>
    </a>

    <!-- Regular Button -->
    <button
      *ngIf="!routerLink"
      [type]="type"
      [disabled]="disabled || loading"
      [class]="getButtonClasses()"
      (click)="onClick()"
    >
      <span *ngIf="prefixIcon && !loading" class="material-symbols-outlined" [class]="getIconClasses(true)">
        {{ prefixIcon }}
      </span>
      <div *ngIf="loading" [class]="getSpinnerClasses()"></div>
      <ng-content></ng-content>
      <span *ngIf="suffixIcon && !loading" class="material-symbols-outlined" [class]="getIconClasses(false)">
        {{ suffixIcon }}
      </span>
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() routerLink: string[] | null = null;
  @Input() prefixIcon = '';
  @Input() suffixIcon = '';

  @Output() buttonClick = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled && !this.loading) {
      this.buttonClick.emit();
    }
  }

  getButtonClasses(): string {
    const baseClasses = 'btn inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeClasses = {
      xs: 'px-2.5 py-1.5 text-xs rounded',
      sm: 'px-3 py-2 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-4 py-2 text-base rounded-lg',
      xl: 'px-6 py-3 text-lg rounded-lg'
    };

    const variantClasses = {
      primary: 'themed-accent-bg text-white hover:bg-theme-accent-hover focus:ring-2 focus:ring-blue-200 shadow-sm',
      secondary: 'themed-surface themed-border border themed-text hover:bg-theme-border focus:ring-2 focus:ring-blue-200 shadow-sm',
      outline: 'border-2 themed-border themed-text hover:themed-accent-bg hover:text-white focus:ring-2 focus:ring-blue-200',
      ghost: 'themed-text hover:bg-theme-border focus:ring-2 focus:ring-blue-200',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm'
    };

    const widthClass = this.fullWidth ? 'w-full' : '';

    return `${baseClasses} ${sizeClasses[this.size]} ${variantClasses[this.variant]} ${widthClass}`;
  }

  getIconClasses(isPrefix: boolean): string {
    const spacing = isPrefix ? 'mr-2' : 'ml-2';
    const sizeClasses = {
      xs: 'text-sm',
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl',
      xl: 'text-2xl'
    };
    return `${spacing} ${sizeClasses[this.size]}`;
  }

  getSpinnerClasses(): string {
    const sizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
      xl: 'w-6 h-6'
    };
    const spacing = this.prefixIcon ? 'mr-2' : '';
    return `${sizeClasses[this.size]} border-2 border-current border-t-transparent rounded-full animate-spin ${spacing}`;
  }
}