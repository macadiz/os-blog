/**
 * Create admin and blog settings with files (multipart)
 */
// ...existing code...
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../../environments/environment";

// DTOs matching OpenAPI specification
export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// Backend response wrapper
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Users list response structure
export interface UsersListResponse {
  users: User[];
  total: number;
  meta: {
    sortBy: string;
    sortOrder: string;
  };
}

export interface CreatePostDto {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  published?: boolean;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  categoryId?: string;
  tagIds?: string[];
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  published?: boolean;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  categoryId?: string;
  tagIds?: string[];
}

export interface CreateAdminDto {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  blogTitle: string;
  blogDescription?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  color?: string;
}

export interface CreateUserDto {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  password: string;
  role: "ADMIN" | "AUTHOR";
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: "ADMIN" | "AUTHOR";
  isActive?: boolean;
}

export interface UserQueryDto {
  search?: string;
  role?: "ADMIN" | "AUTHOR";
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PostsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string; // Keep for backward compatibility
  tags?: string[]; // New field for multiple tags
  sortBy?: "createdAt" | "publishedAt" | "title";
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Response models matching OpenAPI specification
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  role: "ADMIN" | "AUTHOR";
  isActive: boolean;
  isTemporaryPassword?: boolean;
  mustChangePassword?: boolean;
  lastLoginAt?: Date;
  passwordResetAt?: Date;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metaTitle?: string;
  metaDescription?: string;
  authorId: string;
  categoryId?: string;
  author: User;
  category?: Category;
  tags: Tag[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount: number;
}

export interface TagWithCount {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface BlogMetadata {
  categories: CategoryWithCount[];
  tags: TagWithCount[];
  totalPosts: number;
}

export interface BlogSettings {
  blogTitle: string;
  blogDescription?: string;
  logoUrl?: string;
  faviconUrl?: string;
  theme?: string;
  emailSettings?: any;
  socialLinks?: any;
  seoSettings?: any;
}

export interface BlogSettingsDto {
  blogTitle: string;
  blogDescription?: string;
  logoUrl?: string;
  faviconUrl?: string;
  theme?: string;
  emailSettings?: any;
  socialLinks?: any;
  seoSettings?: any;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  profilePicture?: string;
}

export interface SetupStatusResponse {
  required: boolean;
}

export interface BlogSetupStatus {
  isSetup: boolean;
  hasAdminUsers: boolean;
  hasSettings: boolean;
  hasPosts: boolean;
  currentUserValid: boolean;
}

export interface BlogInsights {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalCategories: number;
  totalTags: number;
  totalUsers: number;
  recentPosts: number;
}

export interface CreateAdminResponse {
  message: string;
  admin: User;
}

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

@Injectable({
  providedIn: "root",
})
export class ApiService {
  public readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Health check endpoint
  getHealth(): Observable<string> {
    return this.http.get(`${this.baseUrl}/`, { responseType: "text" });
  }

  // Auth endpoints
  login(credentials: LoginDto): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/auth/login`,
      credentials
    );
  }

  // Setup endpoints
  checkSetupRequired(): Observable<SetupStatusResponse> {
    return this.http.get<SetupStatusResponse>(`${this.baseUrl}/setup/required`);
  }

  createAdmin(setupData: CreateAdminDto): Observable<CreateAdminResponse> {
    return this.http.post<CreateAdminResponse>(
      `${this.baseUrl}/setup/admin`,
      setupData
    );
  }

  /**
   * Create admin and blog settings with files (multipart)
   */
  createAdminMultipart(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/setup/admin`, formData);
  }

  getBlogSettings(): Observable<BlogSettings> {
    return this.http.get<BlogSettings>(`${this.baseUrl}/setup/blog-settings`);
  }

  updateBlogSettings(
    settings: BlogSettingsDto
  ): Observable<{ message: string; settings: BlogSettings }> {
    return this.http.put<{ message: string; settings: BlogSettings }>(
      `${this.baseUrl}/setup/blog-settings`,
      settings
    );
  }

  checkBlogSetup(): Observable<BlogSetupStatus> {
    return this.http.get<BlogSetupStatus>(`${this.baseUrl}/setup/blog-status`);
  }

  getBlogInsights(): Observable<BlogInsights> {
    return this.http.get<BlogInsights>(`${this.baseUrl}/insights`);
  }

  // Public post endpoints
  getPublishedPosts(
    query?: PostsQueryDto
  ): Observable<PaginatedResponse<BlogPost>> {
    let params = "";
    if (query) {
      const queryParams = new URLSearchParams();
      if (query.page) queryParams.append("page", query.page.toString());
      if (query.limit) queryParams.append("limit", query.limit.toString());
      if (query.search) queryParams.append("search", query.search);
      if (query.category) queryParams.append("category", query.category);
      if (query.tag) queryParams.append("tag", query.tag);
      // Handle multiple tags
      if (query.tags && query.tags.length > 0) {
        queryParams.append("tags", query.tags.join(","));
      }
      if (query.sortBy) queryParams.append("sortBy", query.sortBy);
      if (query.sortOrder) queryParams.append("sortOrder", query.sortOrder);
      params = queryParams.toString() ? `?${queryParams.toString()}` : "";
    }
    return this.http.get<PaginatedResponse<BlogPost>>(
      `${this.baseUrl}/posts/published${params}`
    );
  }

  getBlogMetadata(): Observable<BlogMetadata> {
    return this.http.get<BlogMetadata>(`${this.baseUrl}/posts/metadata`);
  }

  getPostBySlug(slug: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.baseUrl}/posts/slug/${slug}`);
  }

  // Admin post endpoints (require authentication)
  getPosts(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(`${this.baseUrl}/admin/posts`);
  }

  getPost(id: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.baseUrl}/admin/posts/${id}`);
  }

  createPost(post: CreatePostDto): Observable<BlogPost> {
    return this.http.post<BlogPost>(`${this.baseUrl}/admin/posts`, post);
  }

  updatePost(id: string, post: UpdatePostDto): Observable<BlogPost> {
    return this.http.patch<BlogPost>(`${this.baseUrl}/admin/posts/${id}`, post);
  }

  deletePost(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/admin/posts/${id}`
    );
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

  getCategory(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/categories/${id}`);
  }

  createCategory(category: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/categories`, category);
  }

  updateCategory(
    id: string,
    category: UpdateCategoryDto
  ): Observable<Category> {
    return this.http.patch<Category>(
      `${this.baseUrl}/categories/${id}`,
      category
    );
  }

  deleteCategory(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/categories/${id}`
    );
  }

  // Tags
  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/tags`);
  }

  // Users
  getUsers(query?: UserQueryDto): Observable<User[]> {
    let params = "";
    if (query) {
      const queryParams = new URLSearchParams();
      if (query.search) queryParams.append("search", query.search);
      if (query.role) queryParams.append("role", query.role);
      if (query.isActive !== undefined)
        queryParams.append("isActive", query.isActive.toString());
      if (query.sortBy) queryParams.append("sortBy", query.sortBy);
      if (query.sortOrder) queryParams.append("sortOrder", query.sortOrder);
      params = queryParams.toString() ? `?${queryParams.toString()}` : "";
    }
    return this.http
      .get<ApiResponse<UsersListResponse>>(`${this.baseUrl}/users${params}`)
      .pipe(map((response) => response.data.users));
  }

  getUser(id: string): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.baseUrl}/users/${id}`)
      .pipe(map((response) => response.data));
  }

  createUser(user: CreateUserDto): Observable<User> {
    return this.http
      .post<ApiResponse<User>>(`${this.baseUrl}/users`, user)
      .pipe(map((response) => response.data));
  }

  updateUser(id: string, user: UpdateUserDto): Observable<User> {
    return this.http
      .patch<ApiResponse<User>>(`${this.baseUrl}/users/${id}`, user)
      .pipe(map((response) => response.data));
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http
      .delete<ApiResponse<{ message: string }>>(`${this.baseUrl}/users/${id}`)
      .pipe(map((response) => response.data));
  }

  toggleUserStatus(id: string): Observable<User> {
    return this.http
      .patch<ApiResponse<User>>(`${this.baseUrl}/users/${id}/toggle-status`, {})
      .pipe(map((response) => response.data));
  }

  resetUserPassword(
    id: string
  ): Observable<{ message: string; temporaryPassword: string; note: string }> {
    return this.http
      .patch<
        ApiResponse<{
          message: string;
          temporaryPassword: string;
          note: string;
        }>
      >(`${this.baseUrl}/users/${id}/reset-password`, {})
      .pipe(map((response) => response.data));
  }

  // Profile management methods
  getCurrentProfile(): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.baseUrl}/users/profile`)
      .pipe(map((response) => response.data));
  }

  updateProfile(profileData: UpdateProfileDto): Observable<User> {
    return this.http
      .patch<ApiResponse<User>>(`${this.baseUrl}/users/profile`, profileData)
      .pipe(map((response) => response.data));
  }

  changePassword(changePasswordData: {
    currentPassword: string;
    newPassword: string;
  }): Observable<any> {
    return this.http
      .patch<
        ApiResponse<any>
      >(`${this.baseUrl}/users/profile/change-password`, changePasswordData)
      .pipe(map((response) => response.data));
  }
}
