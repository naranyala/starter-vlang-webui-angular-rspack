/**
 * Form Input Component
 * Reusable text input with validation
 */

import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="input-wrapper">
      @if (label) {
        <label class="input-label">
          {{ label }}
          @if (required) {
            <span class="required">*</span>
          }
        </label>
      }
      <div class="input-container" [class.input-focused]="focused" [class.input-error]="error">
        @if (prefix) {
          <span class="input-prefix">{{ prefix }}</span>
        }
        <input
          [type]="type"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [required]="required"
          [min]="min"
          [max]="max"
          [step]="step"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          class="input-field"
        />
        @if (suffix) {
          <span class="input-suffix">{{ suffix }}</span>
        }
      </div>
      @if (error) {
        <span class="input-error-message">{{ error }}</span>
      }
      @if (hint && !error) {
        <span class="input-hint">{{ hint }}</span>
      }
    </div>
  `,
  styles: [`
    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .input-label {
      font-size: 0.9rem;
      font-weight: 500;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .required {
      color: #ef4444;
    }

    .input-container {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 8px;
      background: rgba(30, 41, 59, 0.8);
      transition: all 0.2s;
    }

    .input-container:focus-within {
      border-color: rgba(59, 130, 246, 0.5);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .input-focused {
      border-color: rgba(59, 130, 246, 0.5);
    }

    .input-error {
      border-color: rgba(239, 68, 68, 0.5);
    }

    .input-field {
      flex: 1;
      padding: 12px 0;
      border: none;
      background: transparent;
      color: #fff;
      font-size: 0.95rem;
      outline: none;
    }

    .input-field::placeholder {
      color: #64748b;
    }

    .input-field:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .input-prefix, .input-suffix {
      font-size: 0.9rem;
      color: #94a3b8;
      white-space: nowrap;
    }

    .input-error-message {
      font-size: 0.85rem;
      color: #ef4444;
    }

    .input-hint {
      font-size: 0.85rem;
      color: #64748b;
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  @Input() type = 'text';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() min?: number | string;
  @Input() max?: number | string;
  @Input() step?: number | string;
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() hint = '';
  @Input() error = '';

  value = '';
  focused = false;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.focused = false;
    this.onTouched();
  }

  onFocus(): void {
    this.focused = true;
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

/**
 * Select Component
 * Reusable dropdown select with validation
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="select-wrapper">
      @if (label) {
        <label class="select-label">
          {{ label }}
          @if (required) {
            <span class="required">*</span>
          }
        </label>
      }
      <div class="select-container" [class.select-focused]="focused" [class.select-error]="error">
        <select
          [value]="value"
          [disabled]="disabled"
          [required]="required"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          class="select-field"
        >
          @if (placeholder) {
            <option value="" disabled>{{ placeholder }}</option>
          }
          @for (option of options; track option.value) {
            <option [value]="option.value">{{ option.label }}</option>
          }
        </select>
        <span class="select-arrow">▼</span>
      </div>
      @if (error) {
        <span class="select-error-message">{{ error }}</span>
      }
      @if (hint && !error) {
        <span class="select-hint">{{ hint }}</span>
      }
    </div>
  `,
  styles: [`
    .select-wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .select-label {
      font-size: 0.9rem;
      font-weight: 500;
      color: #e2e8f0;
    }

    .select-container {
      position: relative;
      padding: 0 12px;
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 8px;
      background: rgba(30, 41, 59, 0.8);
      transition: all 0.2s;
    }

    .select-container:focus-within {
      border-color: rgba(59, 130, 246, 0.5);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .select-focused {
      border-color: rgba(59, 130, 246, 0.5);
    }

    .select-error {
      border-color: rgba(239, 68, 68, 0.5);
    }

    .select-field {
      width: 100%;
      padding: 12px 0;
      padding-right: 30px;
      border: none;
      background: transparent;
      color: #fff;
      font-size: 0.95rem;
      outline: none;
      cursor: pointer;
      appearance: none;
    }

    .select-arrow {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.7rem;
      color: #94a3b8;
      pointer-events: none;
    }

    .select-error-message {
      font-size: 0.85rem;
      color: #ef4444;
    }

    .select-hint {
      font-size: 0.85rem;
      color: #64748b;
    }
  `]
})
export class SelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() options: Array<{ value: string; label: string }> = [];
  @Input() hint = '';
  @Input() error = '';

  value = '';
  focused = false;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.focused = false;
    this.onTouched();
  }

  onFocus(): void {
    this.focused = true;
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

/**
 * Textarea Component
 * Reusable multi-line text input
 */
@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true
    }
  ],
  template: `
    <div class="textarea-wrapper">
      @if (label) {
        <label class="textarea-label">
          {{ label }}
          @if (required) {
            <span class="required">*</span>
          }
        </label>
      }
      <div class="textarea-container" [class.textarea-focused]="focused" [class.textarea-error]="error">
        <textarea
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [required]="required"
          [rows]="rows"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          class="textarea-field"
        ></textarea>
      </div>
      @if (error) {
        <span class="textarea-error-message">{{ error }}</span>
      }
      @if (hint && !error) {
        <span class="textarea-hint">{{ hint }} ({{ charCount }}/{{ maxLength }})</span>
      }
    </div>
  `,
  styles: [`
    .textarea-wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .textarea-label {
      font-size: 0.9rem;
      font-weight: 500;
      color: #e2e8f0;
    }

    .textarea-container {
      padding: 0 12px;
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 8px;
      background: rgba(30, 41, 59, 0.8);
      transition: all 0.2s;
    }

    .textarea-container:focus-within {
      border-color: rgba(59, 130, 246, 0.5);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .textarea-focused {
      border-color: rgba(59, 130, 246, 0.5);
    }

    .textarea-error {
      border-color: rgba(239, 68, 68, 0.5);
    }

    .textarea-field {
      width: 100%;
      padding: 12px 0;
      border: none;
      background: transparent;
      color: #fff;
      font-size: 0.95rem;
      outline: none;
      resize: vertical;
      font-family: inherit;
    }

    .textarea-field::placeholder {
      color: #64748b;
    }

    .textarea-field:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .textarea-error-message {
      font-size: 0.85rem;
      color: #ef4444;
    }

    .textarea-hint {
      font-size: 0.85rem;
      color: #64748b;
    }
  `]
})
export class TextareaComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() rows = 4;
  @Input() maxLength = 1000;
  @Input() hint = '';
  @Input() error = '';

  value = '';
  focused = false;
  charCount = 0;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.charCount = this.value.length;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.focused = false;
    this.onTouched();
  }

  onFocus(): void {
    this.focused = true;
  }

  writeValue(value: string): void {
    this.value = value || '';
    this.charCount = this.value.length;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
