import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectState = 'default' | 'error' | 'success' | 'warning';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="space-y-2">
      <label *ngIf="label" [for]="selectId" class="block text-sm font-medium themed-text-label mb-2">
        {{ label }}
        <span *ngIf="required" class="text-red-500 ml-1">*</span>
      </label>

      <div class="relative">
        <select
          #selectElement
          [id]="selectId"
          [disabled]="disabled"
          [class]="getSelectClasses()"
          (change)="onSelectionChange($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
        >
          <option *ngIf="placeholder" value="">{{ placeholder }}</option>
          <option
            *ngFor="let option of options"
            [value]="option.value"
            [disabled]="option.disabled"
          >
            {{ option.label }}
          </option>
        </select>

        <!-- Custom dropdown arrow -->
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span class="material-symbols-outlined text-lg themed-text-secondary">expand_more</span>
        </div>
      </div>

      <div *ngIf="helpText || errorMessage" class="text-sm" [class]="getHelpTextClasses()">
        {{ errorMessage || helpText }}
      </div>
    </div>
  `,
})
export class SelectComponent implements ControlValueAccessor, AfterViewInit, OnChanges {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() helpText = '';
  @Input() errorMessage = '';
  @Input() size: SelectSize = 'md';
  @Input() state: SelectState = 'default';
  @Input() required = false;
  @Input() disabled = false;
  @Input() options: SelectOption[] = [];
  @Input() selectId = `select-${Math.random().toString(36).substr(2, 9)}`;

  @Output() selectionChange = new EventEmitter<string>();
  @Output() selectBlur = new EventEmitter<void>();
  @Output() selectFocus = new EventEmitter<void>();

  @ViewChild('selectElement') selectElement!: ElementRef<HTMLSelectElement>;

  value = '';
  private onChange = (_: any) => {};
  private onTouched = () => {};

  ngAfterViewInit(): void {
    // Set initial value after view is initialized
    this.updateSelectValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update select value when options change
    if (changes['options'] && this.selectElement) {
      setTimeout(() => this.updateSelectValue(), 0);
    }
  }

  private updateSelectValue(): void {
    if (this.selectElement && this.value !== undefined) {
      this.selectElement.nativeElement.value = this.value;
    }
  }

  writeValue(value: any): void {
    this.value = value || '';
    this.updateSelectValue();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.onChange(this.value);
    this.selectionChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
    this.selectBlur.emit();
  }

  onFocus(): void {
    this.selectFocus.emit();
  }

  getSelectClasses(): string {
    const baseClasses = 'form-select block w-full transition-all duration-200 ease-in-out focus:outline-none appearance-none bg-no-repeat bg-right pr-10 themed-text themed-surface rounded';

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg'
    };

    const stateClasses = {
      default: 'themed-border border focus:ring-2 focus:ring-blue-200 focus:border-theme-accent',
      error: 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500',
      success: 'border-green-300 focus:ring-2 focus:ring-green-200 focus:border-green-500',
      warning: 'border-yellow-300 focus:ring-2 focus:ring-yellow-200 focus:border-yellow-500'
    };

    return `${baseClasses} ${sizeClasses[this.size]} ${stateClasses[this.errorMessage ? 'error' : this.state]}`;
  }

  getHelpTextClasses(): string {
    if (this.errorMessage) {
      return 'text-red-600 themed-text-error';
    }
    return 'themed-text-secondary';
  }
}