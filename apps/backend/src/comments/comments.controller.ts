import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ExpressUser } from '../types/express';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto, CommentQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':postId')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 2, ttl: 900000 } }) // 2 comments per 15 minutes per IP
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const clientIp = this.getClientIp(req);
    const userAgent = req.headers['user-agent'];

    await this.commentsService.checkRateLimit(
      clientIp,
      createCommentDto.authorEmail,
    );

    const comment = await this.commentsService.create(
      postId,
      createCommentDto,
      clientIp,
      userAgent,
    );

    return {
      id: comment.id,
      content: comment.content,
      authorName: comment.authorName,
      createdAt: comment.createdAt,
      isApproved: comment.isApproved,
      message:
        'Comment submitted successfully. It will be visible after approval.',
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query() query: CommentQueryDto) {
    return this.commentsService.findAll(query);
  }

  @Get('post/:postId')
  @UseGuards(OptionalJwtAuthGuard)
  async findByPost(@Param('postId') postId: string, @Req() req: Request) {
    const isAdmin = (req.user as ExpressUser)?.role === UserRole.ADMIN;
    return this.commentsService.findByPost(postId, isAdmin);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats(@Query('postId') postId?: string) {
    return this.commentsService.getCommentStats(postId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async approve(@Param('id') id: string) {
    const comment = await this.commentsService.approve(id);
    return {
      ...comment,
      message: 'Comment approved successfully',
    };
  }

  @Patch(':id/spam')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async markAsSpam(@Param('id') id: string) {
    const comment = await this.commentsService.markAsSpam(id);
    return {
      ...comment,
      message: 'Comment marked as spam',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.commentsService.remove(id);
  }

  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string) ||
      (req.headers['x-real-ip'] as string) ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      '127.0.0.1'
    );
  }
}
