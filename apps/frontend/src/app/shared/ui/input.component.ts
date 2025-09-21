import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'url' | 'search' | 'datetime-local';
export type InputSize = 'sm' | 'md' | 'lg';
export type InputState = 'default' | 'error' | 'success' | 'warning';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="space-y-2">
      <label *ngIf="label" [for]="inputId" class="block text-sm font-medium themed-text mb-2">
        {{ label }}
        <span *ngIf="required" class="text-red-500 ml-1">*</span>
      </label>

      <div class="relative">
        <div *ngIf="prefixIcon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span class="material-symbols-outlined text-lg themed-text-secondary">{{ prefixIcon }}</span>
        </div>

        <input
          [id]="inputId"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [value]="value"
          [class]="getInputClasses()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
        />

        <div *ngIf="suffixIcon" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span class="material-symbols-outlined text-lg themed-text-secondary">{{ suffixIcon }}</span>
        </div>
      </div>

      <div *ngIf="helpText || errorMessage" class="text-sm" [class]="getHelpTextClasses()">
        {{ errorMessage || helpText }}
      </div>
    </div>
  `,
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type: InputType = 'text';
  @Input() placeholder = '';
  @Input() helpText = '';
  @Input() errorMessage = '';
  @Input() size: InputSize = 'md';
  @Input() state: InputState = 'default';
  @Input() required = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() prefixIcon = '';
  @Input() suffixIcon = '';
  @Input() inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  @Output() inputChange = new EventEmitter<string>();
  @Output() inputBlur = new EventEmitter<void>();
  @Output() inputFocus = new EventEmitter<void>();

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
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
    this.inputBlur.emit();
  }

  onFocus(): void {
    this.inputFocus.emit();
  }

  getInputClasses(): string {
    const baseClasses = 'form-input block w-full transition-all duration-200 ease-in-out focus:outline-none';

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

    const paddingAdjustment = this.prefixIcon ? 'pl-10' : this.suffixIcon ? 'pr-10' : '';

    return `${baseClasses} ${sizeClasses[this.size]} ${stateClasses[this.errorMessage ? 'error' : this.state]} ${paddingAdjustment}`;
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