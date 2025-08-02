export class UpdatePostDto {
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
