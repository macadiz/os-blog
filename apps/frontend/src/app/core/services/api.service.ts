import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

// DTOs matching OpenAPI specification
export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
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

// Response models matching OpenAPI specification
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: "ADMIN" | "AUTHOR";
  isActive: boolean;
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

export interface BlogSettings {
  blogTitle: string;
  blogDescription?: string;
  logoUrl?: string;
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
  private readonly baseUrl = environment.apiUrl;

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

  getBlogSettings(): Observable<BlogSettings> {
    return this.http.get<BlogSettings>(`${this.baseUrl}/setup/blog-settings`);
  }

  checkBlogSetup(): Observable<BlogSetupStatus> {
    return this.http.get<BlogSetupStatus>(`${this.baseUrl}/setup/blog-status`);
  }

  // Public post endpoints
  getPublishedPosts(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(`${this.baseUrl}/posts/published`);
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

  // Tags
  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/tags`);
  }
}
