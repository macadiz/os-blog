export enum UserRole {
  ADMIN = "ADMIN",
  AUTHOR = "AUTHOR",
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  htmlContent?: string;
  excerpt?: string;
  featuredImage?: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metaTitle?: string;
  metaDescription?: string;
  authorId: string;
  author?: User;
  categoryId?: string;
  category?: Category;
  tags?: Tag[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  createdBy?: User;
  posts?: Post[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  posts?: Post[];
}

export interface BlogSettings {
  id: string;
  blogTitle: string;
  blogDescription: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  theme: string;
  emailSettings?: any;
  socialLinks?: any;
  seoSettings?: any;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs
export interface CreateAdminDto {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface BlogSettingsDto {
  blogTitle: string;
  blogDescription?: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
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
  profilePicture?: string | null;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: Omit<User, "password">;
}

export interface SetupStatusResponse {
  setupRequired: boolean;
  message: string;
}

export interface CreateAdminResponse {
  message: string;
  admin: Omit<User, "password">;
}

// File Upload Types
export interface FileUploadResponse {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  category: FileCategory;
  url: string;
}

export interface FileInfo {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  category: FileCategory;
  url: string;
  uploadedAt: Date;
}

export enum FileCategory {
  SETTINGS = "settings",
  PROFILE_PICTURES = "profile_pictures",
  BLOG_IMAGES = "blog_images",
}
