// Design System Components
export * from './card.component';
export * from './input.component';
export * from './select.component';
export * from './textarea.component';
export * from './button.component';

// Re-export all components as an array for easy importing
import { CardComponent } from './card.component';
import { InputComponent } from './input.component';
import { SelectComponent } from './select.component';
import { TextareaComponent } from './textarea.component';
import { ButtonComponent } from './button.component';

export const UI_COMPONENTS = [
  CardComponent,
  InputComponent,
  SelectComponent,
  TextareaComponent,
  ButtonComponent,
] as const;