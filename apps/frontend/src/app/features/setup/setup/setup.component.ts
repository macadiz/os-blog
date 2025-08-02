import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { ApiService } from "../../../core/services/api.service";

@Component({
  selector: "app-setup",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./setup.component.html",
  styles: [],
})
export class SetupComponent {
  setupForm: FormGroup;
  isLoading = false;
  errorMessage = "";

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.setupForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      username: ["", Validators.required],
      password: ["", [Validators.required, Validators.minLength(8)]],
      firstName: [""],
      lastName: [""],
      blogTitle: ["My Blog", Validators.required],
      blogDescription: [""],
    });
  }

  onSubmit() {
    if (this.setupForm.valid) {
      this.isLoading = true;
      this.errorMessage = "";

      const formValue = this.setupForm.value;
      const setupData = {
        email: formValue.email,
        username: formValue.username,
        password: formValue.password,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        blogTitle: formValue.blogTitle,
        blogDescription: formValue.blogDescription,
      };

      this.apiService.createAdmin(setupData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.router.navigate(["/login"]);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage =
            error.error?.message || "Setup failed. Please try again.";
        },
      });
    }
  }
}
