import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export type CardVariant =
  | "default"
  | "elevated"
  | "outlined"
  | "flat"
  | "tight"
  | "compact";
export type CardSize = "sm" | "md" | "lg";

@Component({
  selector: "ui-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getCardClasses()">
      <div *ngIf="header" class="card-header" [class]="getHeaderClasses()">
        <ng-content select="[slot=header]"></ng-content>
      </div>
      <div [class]="getBodyContainerClasses()">
        <ng-content></ng-content>
      </div>
      <div *ngIf="footer" class="card-footer" [class]="getFooterClasses()">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `,
})
export class CardComponent {
  @Input() variant: CardVariant = "default";
  @Input() size: CardSize = "md";
  @Input() header = false;
  @Input() footer = false;
  @Input() padding = true;

  getCardClasses(): string {
    const baseClasses = "overflow-hidden transition-all duration-200";

    const variantClasses = {
      default: "themed-surface shadow-theme rounded-lg themed-border border",
      elevated: "themed-surface shadow-theme-hover rounded-lg border-0",
      outlined: "themed-surface themed-border border rounded-lg shadow-none",
      flat: "themed-surface rounded-lg shadow-none border-0",
      tight: "themed-surface shadow-theme rounded-lg themed-border border",
      compact: "themed-surface shadow-theme rounded-lg themed-border border",
    };

    return `${baseClasses} ${variantClasses[this.variant]}`;
  }

  getHeaderClasses(): string {
    // 'tight' variant needs horizontal padding to align with content, but no vertical padding
    if (this.variant === "tight") {
      const horizontalPadding = this.getHorizontalPaddingFromSize();
      return `themed-border border-b ${horizontalPadding} py-3`;
    }
    // 'compact' variant uses reduced padding
    if (this.variant === "compact") {
      return "themed-border border-b px-4 py-2";
    }
    const basePadding = this.padding ? this.getPaddingClasses() : "";
    return `themed-border border-b ${basePadding}`;
  }

  getBodyContainerClasses(): string {
    // 'tight' variant doesn't use card-body class at all (which has default p-5)
    if (this.variant === "tight") {
      return "";
    }
    // 'compact' variant uses reduced padding instead of card-body
    if (this.variant === "compact") {
      return "p-4";
    }

    const baseClasses = "card-body";
    const additionalPadding = this.padding ? this.getPaddingClasses() : "";
    return `${baseClasses} ${additionalPadding}`.trim();
  }

  getBodyClasses(): string {
    // 'tight' variant never has body padding
    if (this.variant === "tight") {
      return "";
    }
    return this.padding ? this.getPaddingClasses() : "";
  }

  getFooterClasses(): string {
    // 'tight' variant never has footer padding
    if (this.variant === "tight") {
      return "themed-border border-t bg-theme-border";
    }
    const basePadding = this.padding ? this.getPaddingClasses() : "";
    return `themed-border border-t bg-theme-border ${basePadding}`;
  }

  private getPaddingClasses(): string {
    const sizeClasses = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };
    return sizeClasses[this.size];
  }

  private getHorizontalPaddingFromSize(): string {
    const sizeClasses = {
      sm: "px-4",
      md: "px-6",
      lg: "px-8",
    };
    return sizeClasses[this.size];
  }
}
