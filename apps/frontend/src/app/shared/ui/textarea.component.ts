import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaState = 'default' | 'error' | 'success' | 'warning';

@Component({
  selector: 'ui-textarea',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true
    }
  ],
  template: `
    <div class="space-y-2">
      <label *ngIf="label" [for]="textareaId" class="block text-sm font-medium themed-text mb-2">
        {{ label }}
        <span *ngIf="required" class="text-red-500 ml-1">*</span>
      </label>

      <div class="relative">
        <textarea
          [id]="textareaId"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [rows]="rows"
          [attr.maxlength]="maxLength"
          [value]="value"
          [class]="getTextareaClasses()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
        ></textarea>

        <div *ngIf="showCharCount && maxLength" class="absolute bottom-2 right-2 text-xs themed-text-secondary">
          {{ value.length }}/{{ maxLength }}
        </div>
      </div>

      <div *ngIf="helpText || errorMessage" class="text-sm" [class]="getHelpTextClasses()">
        {{ errorMessage || helpText }}
      </div>
    </div>
  `,
})
export class TextareaComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() helpText = '';
  @Input() errorMessage = '';
  @Input() size: TextareaSize = 'md';
  @Input() state: TextareaState = 'default';
  @Input() required = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() rows = 4;
  @Input() maxLength = 0;
  @Input() showCharCount = false;
  @Input() textareaId = `textarea-${Math.random().toString(36).substr(2, 9)}`;

  @Output() textareaChange = new EventEmitter<string>();
  @Output() textareaBlur = new EventEmitter<void>();
  @Output() textareaFocus = new EventEmitter<void>();

  value = '';
  private onChange = (_: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    this.value = value || '';
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

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
    this.textareaChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
    this.textareaBlur.emit();
  }

  onFocus(): void {
    this.textareaFocus.emit();
  }

  getTextareaClasses(): string {
    const baseClasses = 'form-input block w-full resize-y transition-all duration-200 ease-in-out focus:outline-none';

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

    const charCountPadding = this.showCharCount && this.maxLength ? 'pb-8' : '';

    return `${baseClasses} ${sizeClasses[this.size]} ${stateClasses[this.errorMessage ? 'error' : this.state]} ${charCountPadding}`;
  }

  getHelpTextClasses(): string {
    if (this.errorMessage) {
      return 'text-red-600';
    }
    if (this.state === 'success') {
      return 'text-green-600';
    }
    if (this.state === 'warning') {
      return 'text-yellow-600';
    }
    return 'themed-text-secondary';
  }
}