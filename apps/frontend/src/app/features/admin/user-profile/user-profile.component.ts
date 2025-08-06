import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import {
  ApiService,
  User,
  UpdateProfileDto,
} from "../../../core/services/api.service";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-user-profile",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.css"],
})
export class UserProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  saving = false;
  changingPassword = false;
  message = "";
  error = "";
  passwordMessage = "";
  passwordError = "";
  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize profile form
    this.profileForm = this.fb.group({
      firstName: ["", [Validators.maxLength(50)]],
      lastName: ["", [Validators.maxLength(50)]],
      email: ["", [Validators.required, Validators.email]],
      username: ["", [Validators.required, Validators.maxLength(50)]],
      profilePicture: ["", [Validators.pattern("https?://.+")]],
    });

    // Initialize password form
    this.passwordForm = this.fb.group(
      {
        currentPassword: ["", [Validators.required]],
        newPassword: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  async ngOnInit() {
    // Wait for auth service to initialize
    await this.authService.waitForInitialization();

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(["/admin/login"]);
      return;
    }

    this.loadProfile();
  }

  private loadProfile() {
    this.loading = true;
    this.error = "";

    this.apiService.getCurrentProfile().subscribe({
      next: (user: User) => {
        this.currentUser = user;
        this.profileForm.patchValue({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email,
          username: user.username,
          profilePicture: user.profilePicture || "",
        });
        this.loading = false;
      },
      error: (error) => {
        if (error.status === 401) {
          this.error = "Authentication required. Please log in again.";
        } else if (error.status === 0) {
          this.error =
            "Cannot connect to server. Please check if the backend is running.";
        } else {
          this.error =
            error.error?.message ||
            `Failed to load profile (Error ${error.status})`;
        }
        this.loading = false;
      },
    });
  }

  onSubmitProfile() {
    if (this.profileForm.valid) {
      this.saving = true;
      this.message = "";
      this.error = "";

      const formValue = this.profileForm.value;
      const profileData: UpdateProfileDto = {
        firstName: formValue.firstName || undefined,
        lastName: formValue.lastName || undefined,
        email: formValue.email,
        username: formValue.username,
        profilePicture: formValue.profilePicture || undefined,
      };

      this.apiService.updateProfile(profileData).subscribe({
        next: (updatedUser) => {
          this.currentUser = updatedUser;
          this.message = "Profile updated successfully";
          this.saving = false;
          // Clear message after 3 seconds
          setTimeout(() => {
            this.message = "";
          }, 3000);
        },
        error: (error) => {
          this.error = error.error?.message || "Failed to update profile";
          this.saving = false;
        },
      });
    }
  }

  onSubmitPassword() {
    if (this.passwordForm.valid) {
      this.changingPassword = true;
      this.passwordMessage = "";
      this.passwordError = "";

      const formValue = this.passwordForm.value;

      this.apiService
        .changePassword({
          currentPassword: formValue.currentPassword,
          newPassword: formValue.newPassword,
        })
        .subscribe({
          next: (response) => {
            this.passwordMessage = "Password changed successfully";
            this.passwordForm.reset();
            this.changingPassword = false;
            // Clear message after 3 seconds
            setTimeout(() => {
              this.passwordMessage = "";
            }, 3000);
          },
          error: (error) => {
            this.passwordError =
              error.error?.message || "Failed to change password";
            this.changingPassword = false;
          },
        });
    }
  }

  // Custom validator for password confirmation
  private passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get("newPassword");
    const confirmPassword = group.get("confirmPassword");

    if (
      newPassword &&
      confirmPassword &&
      newPassword.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword?.errors?.["passwordMismatch"]) {
      delete confirmPassword.errors["passwordMismatch"];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }

    return null;
  }

  // Helper method to check if a field has errors
  hasError(formName: "profile" | "password", fieldName: string): boolean {
    const form = formName === "profile" ? this.profileForm : this.passwordForm;
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Helper method to get error message for a field
  getErrorMessage(formName: "profile" | "password", fieldName: string): string {
    const form = formName === "profile" ? this.profileForm : this.passwordForm;
    const field = form.get(fieldName);

    if (field?.errors) {
      if (field.errors["required"]) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors["email"]) {
        return "Please enter a valid email address";
      }
      if (field.errors["maxlength"]) {
        return `${this.getFieldDisplayName(fieldName)} must not exceed ${field.errors["maxlength"].requiredLength} characters`;
      }
      if (field.errors["minlength"]) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors["minlength"].requiredLength} characters`;
      }
      if (field.errors["pattern"]) {
        return "Please enter a valid URL (starting with http:// or https://)";
      }
      if (field.errors["passwordMismatch"]) {
        return "Passwords do not match";
      }
    }
    return "";
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      username: "Username",
      profilePicture: "Profile picture",
      currentPassword: "Current password",
      newPassword: "New password",
      confirmPassword: "Confirm password",
    };
    return fieldNames[fieldName] || fieldName;
  }

  // Helper method to get user initials for avatar fallback
  getUserInitials(): string {
    if (!this.currentUser) return "";

    const firstInitial = this.currentUser.firstName?.charAt(0) || "";
    const lastInitial = this.currentUser.lastName?.charAt(0) || "";

    if (firstInitial && lastInitial) {
      return (firstInitial + lastInitial).toUpperCase();
    }

    return this.currentUser.username?.charAt(0).toUpperCase() || "";
  }

  // Handle image load errors
  onImageError(): void {
    if (this.currentUser) {
      this.currentUser.profilePicture = undefined;
    }
  }
}
