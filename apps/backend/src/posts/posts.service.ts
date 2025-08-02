import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private async ensureUniqueSlug(
    baseSlug: string,
    excludeId?: string,
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.post.findFirst({
        where: {
          slug,
          ...(excludeId && { id: { not: excludeId } }),
        },
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async create(createPostDto: CreatePostDto, authorId: string) {
    const { tagIds, ...postData } = createPostDto;

    // Generate unique slug
    const baseSlug = this.generateSlug(createPostDto.title);
    const slug = await this.ensureUniqueSlug(baseSlug);

    // Validate category if provided
    if (createPostDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: createPostDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    // Validate tags if provided
    if (tagIds && tagIds.length > 0) {
      const existingTags = await this.prisma.tag.findMany({
        where: { id: { in: tagIds } },
      });
      if (existingTags.length !== tagIds.length) {
        throw new BadRequestException('One or more tags not found');
      }
    }

    // Create post
    const post = await this.prisma.post.create({
      data: {
        ...postData,
        slug,
        authorId,
        publishedAt: createPostDto.published ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        category: true,
        postTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Create post-tag relationships if tags provided
    if (tagIds && tagIds.length > 0) {
      await this.prisma.postTag.createMany({
        data: tagIds.map((tagId) => ({
          postId: post.id,
          tagId,
        })),
      });

      // Refetch post with tags
      return this.findOne(post.id);
    }

    return this.transformPost(post);
  }

  async findAll(includeUnpublished = false) {
    const posts = await this.prisma.post.findMany({
      where: includeUnpublished ? {} : { published: true },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        category: true,
        postTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return posts.map((post) => this.transformPost(post));
  }

  async findPublished() {
    return this.findAll(false);
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        category: true,
        postTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.transformPost(post);
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        category: true,
        postTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Only return published posts for public access
    if (!post.published) {
      throw new NotFoundException('Post not found');
    }

    return this.transformPost(post);
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const existingPost = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      throw new NotFoundException('Post not found');
    }

    const { tagIds, ...postData } = updatePostDto;

    // Generate new slug if title changed
    let slug = existingPost.slug;
    if (updatePostDto.title && updatePostDto.title !== existingPost.title) {
      const baseSlug = this.generateSlug(updatePostDto.title);
      slug = await this.ensureUniqueSlug(baseSlug, id);
    }

    // Validate category if provided
    if (updatePostDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updatePostDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    // Update post
    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: {
        ...postData,
        slug,
        publishedAt: updatePostDto.published
          ? new Date()
          : existingPost.publishedAt,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        category: true,
        postTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Update tags if provided
    if (tagIds !== undefined) {
      // Validate tags
      if (tagIds.length > 0) {
        const existingTags = await this.prisma.tag.findMany({
          where: { id: { in: tagIds } },
        });
        if (existingTags.length !== tagIds.length) {
          throw new BadRequestException('One or more tags not found');
        }
      }

      // Remove existing post-tag relationships
      await this.prisma.postTag.deleteMany({
        where: { postId: id },
      });

      // Create new post-tag relationships
      if (tagIds.length > 0) {
        await this.prisma.postTag.createMany({
          data: tagIds.map((tagId) => ({
            postId: id,
            tagId,
          })),
        });
      }

      // Refetch post with updated tags
      return this.findOne(id);
    }

    return this.transformPost(updatedPost);
  }

  async remove(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Delete post (cascade will handle post-tag relationships)
    await this.prisma.post.delete({
      where: { id },
    });

    return { message: 'Post deleted successfully' };
  }

  private transformPost(post: any) {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      published: post.published,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      author: post.author,
      category: post.category,
      tags: post.postTags?.map((postTag: any) => postTag.tag) || [],
    };
  }
}
