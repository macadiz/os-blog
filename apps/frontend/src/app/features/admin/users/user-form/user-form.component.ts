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

@Component({
  selector: "app-user-form",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
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
      error: (error: any) => {
        console.error("Error loading user:", error);
        alert("Failed to load user data. Please try again.");
        this.router.navigate(["/admin/users"]);
        this.isLoading = false;
      },
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.userForm.value;

    if (this.isEditMode && this.userId) {
      // Update user
      const updateData: UpdateUserDto = {
        email: formValue.email,
        username: formValue.username,
        firstName: formValue.firstName || undefined,
        lastName: formValue.lastName || undefined,
        role: formValue.role,
      };

      this.apiService.updateUser(this.userId, updateData).subscribe({
        next: () => {
          this.router.navigate(["/admin/users"]);
        },
        error: (error: any) => {
          console.error("Error updating user:", error);
          alert("Failed to update user. Please try again.");
          this.isSubmitting = false;
        },
      });
    } else {
      // Create user
      const createData: CreateUserDto = {
        email: formValue.email,
        username: formValue.username,
        firstName: formValue.firstName || undefined,
        lastName: formValue.lastName || undefined,
        password: formValue.password,
        role: formValue.role,
      };

      this.apiService.createUser(createData).subscribe({
        next: () => {
          this.router.navigate(["/admin/users"]);
        },
        error: (error: any) => {
          console.error("Error creating user:", error);
          alert("Failed to create user. Please try again.");
          this.isSubmitting = false;
        },
      });
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
