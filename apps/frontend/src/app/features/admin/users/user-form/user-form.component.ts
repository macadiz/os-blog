import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router, ActivatedRoute } from "@angular/router";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import {
  ApiService,
  CreateUserDto,
  UpdateUserDto,
  User,
} from "../../../../core/services/api.service";
import { CardComponent, InputComponent, ButtonComponent } from "../../../../shared/ui";

@Component({
  selector: "app-user-form",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CardComponent, InputComponent, ButtonComponent],
  templateUrl: "./user-form.component.html",
  styleUrls: ["./user-form.component.css"],
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  isLoading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.checkMode();
  }

  initializeForm() {
    this.userForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      username: ["", [Validators.required, Validators.minLength(3)]],
      firstName: [""],
      lastName: [""],
      password: ["", [Validators.required, Validators.minLength(8)]],
      role: ["AUTHOR", Validators.required],
    });
  }

  checkMode() {
    this.userId = this.route.snapshot.paramMap.get("id");
    if (this.userId) {
      this.isEditMode = true;
      this.loadUser();
      // Remove password requirement for edit mode
      this.userForm.get("password")?.clearValidators();
      this.userForm.get("password")?.updateValueAndValidity();
    }
  }

  loadUser() {
    if (!this.userId) return;

    this.isLoading = true;
    this.apiService.getUser(this.userId).subscribe({
      next: (user: User) => {
        this.userForm.patchValue({
          email: user.email,
          username: user.username,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          role: user.role,
        });
        this.isLoading = false;
      },
      error: () => {
        alert("Failed to load user data. Please try again.");
        this.router.navigate(["/admin/users"]);
        this.isLoading = false;
      },
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.isLoading = true;
      const userData = this.userForm.value as CreateUserDto;

      if (this.isEditMode && this.userId) {
        this.apiService.updateUser(this.userId, userData).subscribe({
          next: () => {
            this.router.navigate(["/admin/users"]);
          },
          error: () => {
            this.isLoading = false;
          },
        });
      } else {
        this.apiService.createUser(userData).subscribe({
          next: () => {
            this.router.navigate(["/admin/users"]);
          },
          error: () => {
            this.isLoading = false;
          },
        });
      }
    }
  }

  markFormGroupTouched() {
    Object.keys(this.userForm.controls).forEach((key) => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors) {
      if (field.errors["required"]) return `${fieldName} is required`;
      if (field.errors["email"]) return "Please enter a valid email address";
      if (field.errors["minlength"]) {
        const requiredLength = field.errors["minlength"].requiredLength;
        return `${fieldName} must be at least ${requiredLength} characters long`;
      }
    }
    return "";
  }

  onCancel() {
    this.router.navigate(["/admin/users"]);
  }
}
