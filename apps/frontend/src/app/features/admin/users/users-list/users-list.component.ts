import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  ApiService,
  User,
  UserQueryDto,
} from "../../../../core/services/api.service";
import { Observable, BehaviorSubject, combineLatest, of } from "rxjs";
import { switchMap, startWith, catchError } from "rxjs/operators";
import { CreateButtonComponent } from "../../../../shared/components/create-button/create-button.component";

@Component({
  selector: "app-users-list",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CreateButtonComponent],
  templateUrl: "./users-list.component.html",
  styleUrls: ["./users-list.component.css"],
})
export class UsersListComponent implements OnInit {
  users$!: Observable<User[]>;

  // Filters
  searchTerm = "";
  selectedRole: string = "";
  selectedStatus: string = "";
  sortBy = "createdAt";
  sortOrder: "asc" | "desc" = "desc";

  private filterSubject = new BehaviorSubject<UserQueryDto>({});

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.users$ = this.filterSubject.pipe(
      startWith({}),
      switchMap((query) =>
        this.apiService.getUsers(query).pipe(
          catchError((error) => {
            console.error("Error fetching users:", error);
            return of([]); // Return empty array on error
          })
        )
      )
    );

    this.applyFilters();
  }

  applyFilters() {
    const query: UserQueryDto = {
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    };

    if (this.searchTerm.trim()) {
      query.search = this.searchTerm.trim();
    }

    if (this.selectedRole) {
      query.role = this.selectedRole as "ADMIN" | "AUTHOR";
    }

    if (this.selectedStatus) {
      query.isActive = this.selectedStatus === "active";
    }

    this.filterSubject.next(query);
  }

  clearFilters() {
    this.searchTerm = "";
    this.selectedRole = "";
    this.selectedStatus = "";
    this.sortBy = "createdAt";
    this.sortOrder = "desc";
    this.applyFilters();
  }

  deleteUser(user: User) {
    if (
      confirm(
        `Are you sure you want to delete the user "${user.username}"? This action cannot be undone.`
      )
    ) {
      this.apiService.deleteUser(user.id).subscribe({
        next: () => {
          this.applyFilters(); // Refresh the list
        },
        error: (error: any) => {
          console.error("Error deleting user:", error);
          alert("Failed to delete user. Please try again.");
        },
      });
    }
  }

  toggleUserStatus(user: User) {
    const action = user.isActive ? "deactivate" : "activate";
    if (
      confirm(`Are you sure you want to ${action} the user "${user.username}"?`)
    ) {
      this.apiService.toggleUserStatus(user.id).subscribe({
        next: () => {
          this.applyFilters(); // Refresh the list
        },
        error: (error: any) => {
          console.error(`Error ${action}ing user:`, error);
          alert(`Failed to ${action} user. Please try again.`);
        },
      });
    }
  }

  resetPassword(user: User) {
    if (
      confirm(
        `Are you sure you want to reset the password for "${user.username}"? A temporary password will be generated.`
      )
    ) {
      this.apiService.resetUserPassword(user.id).subscribe({
        next: (response) => {
          alert(
            `Password reset successfully!\n\nTemporary password: ${response.temporaryPassword}\n\n${response.note}`
          );
          this.applyFilters(); // Refresh the list to show updated status
        },
        error: (error: any) => {
          console.error("Error resetting password:", error);
          alert("Failed to reset password. Please try again.");
        },
      });
    }
  }

  getStatusBadgeClass(user: User): string {
    if (!user.isActive) return "bg-red-100 text-red-800";
    if (user.mustChangePassword) return "bg-yellow-100 text-yellow-800";
    if (user.isTemporaryPassword) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  }

  getStatusText(user: User): string {
    if (!user.isActive) return "Inactive";
    if (user.mustChangePassword) return "Must Change Password";
    if (user.isTemporaryPassword) return "Temporary Password";
    return "Active";
  }

  getRoleBadgeClass(role: string): string {
    return role === "ADMIN"
      ? "bg-purple-100 text-purple-800"
      : "bg-blue-100 text-blue-800";
  }
}
