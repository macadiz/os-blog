import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Comment } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto, CommentQueryDto } from './dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    postId: string,
    createCommentDto: CreateCommentDto,
    clientIp: string,
    userAgent?: string,
  ): Promise<Comment> {
    await this.validatePost(postId);
    await this.checkCommentsEnabled();

    return this.prisma.comment.create({
      data: {
        ...createCommentDto,
        postId,
        authorIpAddress: clientIp,
        userAgent: userAgent || null,
        isApproved: false,
        isSpam: false,
      },
    });
  }

  async findAll(query: CommentQueryDto) {
    const {
      page = 1,
      limit = 10,
      postId,
      isApproved,
      isSpam,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (postId) where.postId = postId;
    if (typeof isApproved === 'boolean') where.isApproved = isApproved;
    if (typeof isSpam === 'boolean') where.isSpam = isSpam;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      data: comments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByPost(postId: string, includeUnapproved = false) {
    await this.validatePost(postId);

    const where: any = { 
      postId,
      isSpam: false,
    };

    if (!includeUnapproved) {
      where.isApproved = true;
    }

    return this.prisma.comment.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    await this.findOne(id);

    return this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.comment.delete({
      where: { id },
    });
  }

  async approve(id: string): Promise<Comment> {
    return this.update(id, { isApproved: true });
  }

  async markAsSpam(id: string): Promise<Comment> {
    return this.update(id, { isSpam: true, isApproved: false });
  }

  async getCommentStats(postId?: string) {
    const where = postId ? { postId } : {};

    const [total, approved, pending, spam] = await Promise.all([
      this.prisma.comment.count({ where }),
      this.prisma.comment.count({ where: { ...where, isApproved: true } }),
      this.prisma.comment.count({ where: { ...where, isApproved: false, isSpam: false } }),
      this.prisma.comment.count({ where: { ...where, isSpam: true } }),
    ]);

    return {
      total,
      approved,
      pending,
      spam,
    };
  }

  async checkRateLimit(clientIp: string, email: string): Promise<void> {
    const timeWindow = 15 * 60 * 1000; // 15 minutes
    const ipLimit = 3; // 3 comments per IP per 15 minutes
    const emailLimit = 5; // 5 comments per email per 15 minutes
    const since = new Date(Date.now() - timeWindow);

    const [ipCount, emailCount] = await Promise.all([
      this.prisma.comment.count({
        where: {
          authorIpAddress: clientIp,
          createdAt: {
            gte: since,
          },
        },
      }),
      this.prisma.comment.count({
        where: {
          authorEmail: email,
          createdAt: {
            gte: since,
          },
        },
      }),
    ]);

    if (ipCount >= ipLimit) {
      throw new BadRequestException(
        `Too many comments from this IP address. Please wait before submitting another comment.`,
      );
    }

    if (emailCount >= emailLimit) {
      throw new BadRequestException(
        `Too many comments from this email address. Please wait before submitting another comment.`,
      );
    }
  }

  private async validatePost(postId: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { published: true },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    if (!post.published) {
      throw new BadRequestException('Comments are not allowed on unpublished posts');
    }
  }

  private async checkCommentsEnabled(): Promise<void> {
    const settings = await this.prisma.blogSettings.findFirst({
      select: { allowComments: true },
    });

    if (!settings?.allowComments) {
      throw new ForbiddenException('Comments are not enabled for this blog');
    }
  }
}