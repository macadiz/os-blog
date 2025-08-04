import { Routes } from "@angular/router";

export const TAGS_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./tags-list/tags-list.component").then(
        (m) => m.TagsListComponent
      ),
  },
  {
    path: "new",
    loadComponent: () =>
      import("./tag-form/tag-form.component").then((m) => m.TagFormComponent),
  },
  {
    path: ":id/edit",
    loadComponent: () =>
      import("./tag-form/tag-form.component").then((m) => m.TagFormComponent),
  },
];
