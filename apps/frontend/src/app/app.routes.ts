import { Routes } from "@angular/router";
import { setupGuard } from "./core/guards/setup.guard";
import { authGuard } from "./core/guards/auth.guard";
import { guestGuard } from "./core/guards/guest.guard";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "/blog",
    pathMatch: "full",
  },
  {
    path: "setup",
    loadComponent: () =>
      import("./features/setup/setup/setup.component").then(
        (m) => m.SetupComponent
      ),
    canActivate: [setupGuard],
  },
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/login/login.component").then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: "blog",
    pathMatch: "full",
    loadComponent: () =>
      import("./features/blog/blog/blog.component").then(
        (m) => m.BlogComponent
      ),
  },
  {
    path: "blog/:slug",
    loadComponent: () =>
      import("./features/blog/blog-post/blog-post.component").then(
        (m) => m.BlogPostComponent
      ),
  },
  {
    path: "admin",
    loadChildren: () =>
      import("./features/admin/admin.routes").then((m) => m.adminRoutes),
    canActivate: [authGuard],
  },
  {
    path: "**",
    redirectTo: "/blog",
  },
];
