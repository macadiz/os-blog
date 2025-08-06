import { Routes } from "@angular/router";
import { authGuard } from "../../core/guards/auth.guard";
import { roleGuard } from "../../core/guards/role.guard";
import { passwordChangeGuard } from "../../core/guards/password-change.guard";

export const adminRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import(
        "../../shared/components/admin-layout/admin-layout.component"
      ).then((m) => m.AdminLayoutComponent),
    canActivate: [
      authGuard,
      roleGuard(["ADMIN", "AUTHOR"]),
      passwordChangeGuard,
    ],
    children: [
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
      {
        path: "dashboard",
        loadComponent: () =>
          import("./admin-dashboard/admin-dashboard.component").then(
            (m) => m.AdminDashboardComponent
          ),
        data: {
          title: "Admin Dashboard",
        },
      },
      {
        path: "posts",
        children: [
          {
            path: "",
            loadComponent: () =>
              import("./posts/posts-list/posts-list.component").then(
                (m) => m.PostsListComponent
              ),
          },
          {
            path: "new",
            loadComponent: () =>
              import("./posts/post-editor/post-editor.component").then(
                (m) => m.PostEditorComponent
              ),
          },
          {
            path: "edit/:id",
            loadComponent: () =>
              import("./posts/post-editor/post-editor.component").then(
                (m) => m.PostEditorComponent
              ),
          },
        ],
      },
      // Admin-only routes
      {
        path: "users",
        canActivate: [roleGuard(["ADMIN"])],
        children: [
          {
            path: "",
            loadComponent: () =>
              import("./users/users-list/users-list.component").then(
                (m) => m.UsersListComponent
              ),
          },
          {
            path: "new",
            loadComponent: () =>
              import("./users/user-form/user-form.component").then(
                (m) => m.UserFormComponent
              ),
          },
          {
            path: ":id/edit",
            loadComponent: () =>
              import("./users/user-form/user-form.component").then(
                (m) => m.UserFormComponent
              ),
          },
        ],
      },
      {
        path: "categories",
        canActivate: [roleGuard(["ADMIN"])],
        children: [
          {
            path: "",
            loadComponent: () =>
              import(
                "./categories/categories-list/categories-list.component"
              ).then((m) => m.CategoriesListComponent),
          },
          {
            path: "new",
            loadComponent: () =>
              import("./categories/category-form/category-form.component").then(
                (m) => m.CategoryFormComponent
              ),
          },
          {
            path: "edit/:id",
            loadComponent: () =>
              import("./categories/category-form/category-form.component").then(
                (m) => m.CategoryFormComponent
              ),
          },
        ],
      },
      {
        path: "tags",
        canActivate: [roleGuard(["ADMIN"])],
        loadChildren: () =>
          import("./tags/tags.routes").then((m) => m.TAGS_ROUTES),
      },
      {
        path: "settings",
        canActivate: [roleGuard(["ADMIN"])],
        loadComponent: () =>
          import("./blog-settings/blog-settings.component").then(
            (m) => m.BlogSettingsComponent
          ),
        data: {
          title: "Blog Settings",
        },
      },
      {
        path: "profile",
        loadComponent: () =>
          import("./user-profile/user-profile.component").then(
            (m) => m.UserProfileComponent
          ),
        data: {
          title: "My Profile",
        },
      },
    ],
  },
];
