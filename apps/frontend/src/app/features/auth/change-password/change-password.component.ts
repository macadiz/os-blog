import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ApiService } from "../../../core/services/api.service";

@Component({
  selector: "app-change-password",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.css"],
})
export class ChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;
  isLoading = false;
  errorMessage = "";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ["", [Validators.required]],
        newPassword: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit() {
    // Check if user actually needs to change password
    const user = this.authService.getCurrentUserSync();
    if (!user?.mustChangePassword) {
      // If user doesn't need to change password, redirect based on role
      if (user?.role === "ADMIN") {
        this.router.navigate(["/admin"]);
      } else {
        this.router.navigate(["/blog"]);
      }
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get("newPassword");
    const confirmPassword = form.get("confirmPassword");

    if (
      newPassword &&
      confirmPassword &&
      newPassword.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword?.hasError("passwordMismatch")) {
      confirmPassword.setErrors(null);
    }

    return null;
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      this.errorMessage = "";

      const changePasswordData = {
        currentPassword: this.passwordForm.value.currentPassword,
        newPassword: this.passwordForm.value.newPassword,
      };

      this.apiService.changePassword(changePasswordData).subscribe({
        next: (response) => {
          this.isLoading = false;
          // Refresh user data to get updated mustChangePassword status
          this.authService.getCurrentUser().subscribe({
            next: (user) => {
              // Update the current user in auth service
              this.authService["currentUserSubject"].next(user);

              // Redirect based on user role
              if (user.role === "ADMIN") {
                this.router.navigate(["/admin"]);
              } else {
                this.router.navigate(["/blog"]);
              }
            },
            error: (error) => {
              console.error("Failed to refresh user data:", error);
              // Fallback redirect
              this.router.navigate(["/blog"]);
            },
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage =
            error.error?.message ||
            "Failed to change password. Please try again.";
        },
      });
    }
  }

  // Helper methods for form validation
  isFieldInvalid(field: string): boolean {
    const formField = this.passwordForm.get(field);
    return !!(
      formField &&
      formField.invalid &&
      (formField.dirty || formField.touched)
    );
  }

  getFieldError(field: string): string {
    const formField = this.passwordForm.get(field);
    if (formField?.errors) {
      if (formField.errors["required"]) {
        return `${this.getFieldLabel(field)} is required`;
      }
      if (formField.errors["minlength"]) {
        return `${this.getFieldLabel(field)} must be at least ${formField.errors["minlength"].requiredLength} characters`;
      }
      if (formField.errors["passwordMismatch"]) {
        return "Passwords do not match";
      }
    }
    return "";
  }

  private getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      currentPassword: "Current password",
      newPassword: "New password",
      confirmPassword: "Confirm password",
    };
    return labels[field] || field;
  }
}
