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
  logoUrl?: string;
  faviconUrl?: string;
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
  logoUrl?: string;
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
