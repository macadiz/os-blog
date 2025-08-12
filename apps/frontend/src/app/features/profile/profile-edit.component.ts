import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from "@angular/forms";
import {
  ApiService,
  User,
  UpdateProfileDto,
} from "../../core/services/api.service";
import {
  FileUploadComponent,
  FileUploadConfig,
} from "../../shared/components/file-upload/file-upload.component";
import {
  FileCategory,
  FileUploadResponse,
} from "../../shared/components/file-upload/file-upload.component";
import { ImageUrlUtil } from "../../core/utils/image-url.util";

@Component({
  selector: "app-profile-edit",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadComponent,
  ],
  templateUrl: "./profile-edit.component.html",
  styleUrls: ["./profile-edit.component.css"],
})
export class ProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  currentUser?: User;
  isLoading = false;
  isSaving = false;
  message = "";
  isError = false;

  profilePictureConfig: FileUploadConfig = {
    category: FileCategory.PROFILE_PICTURES,
    accept: "image/*",
    maxSize: 5 * 1024 * 1024, // 5MB
    placeholder: "Upload profile picture",
    showPreview: true,
    previewSize: "large",
  };

  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder
  ) {
    this.profileForm = this.formBuilder.group({
      firstName: [""],
      lastName: [""],
      email: [""],
      username: [""],
      profilePicture: [""],
    });
  }

  ngOnInit() {
    this.loadCurrentProfile();
  }

  loadCurrentProfile() {
    this.isLoading = true;
    this.apiService.getCurrentProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.profileForm.patchValue({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email,
          username: user.username,
          profilePicture: user.profilePicture || "",
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.showError("Failed to load profile");
        this.isLoading = false;
      },
    });
  }

  onProfilePictureUploaded(fileResponse: FileUploadResponse) {
    this.profileForm.patchValue({
      profilePicture: fileResponse.url,
    });
    this.showSuccess("Profile picture uploaded successfully");
  }

  onProfilePictureRemoved() {
    this.profileForm.patchValue({
      profilePicture: "",
    });
    this.showSuccess("Profile picture removed");
  }

  onUploadError(error: string) {
    this.showError(error);
  }

  onSubmit() {
    if (this.profileForm.valid && !this.isSaving) {
      this.isSaving = true;

      const updateData: UpdateProfileDto = {
        firstName: this.profileForm.value.firstName || undefined,
        lastName: this.profileForm.value.lastName || undefined,
        email: this.profileForm.value.email,
        username: this.profileForm.value.username,
        profilePicture: this.profileForm.value.profilePicture || undefined,
      };

      this.apiService.updateProfile(updateData).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.showSuccess("Profile updated successfully");
          this.isSaving = false;
        },
        error: (error) => {
          this.showError("Failed to update profile");
          this.isSaving = false;
        },
      });
    }
  }

  private showSuccess(message: string) {
    this.message = message;
    this.isError = false;
    setTimeout(() => (this.message = ""), 5000);
  }

  private showError(message: string) {
    this.message = message;
    this.isError = true;
    setTimeout(() => (this.message = ""), 5000);
  }

  get currentProfilePictureUrl(): string | null {
    if (!this.currentUser?.profilePicture) {
      return null;
    }
    return ImageUrlUtil.getAbsoluteImageUrl(this.currentUser.profilePicture);
  }
}
