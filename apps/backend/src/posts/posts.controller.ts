import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsQueryDto } from './dto/posts-query.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireActiveUser } from '../auth/decorators/require-active-user.decorator';
import { RssService } from '../rss/rss.service';

@Controller()
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly rssService: RssService,
  ) {}

  // RSS Feed endpoint
  @Get('feed.xml')
  async getRssFeed(@Res() res: Response) {
    const origin = res.req.headers.origin || res.req.headers.host;
    const feed = await this.rssService.generateFeed(origin);
    res.set('Content-Type', 'application/rss+xml');
    res.send(feed);
  }

  // Public endpoints
  @Get('posts/published')
  findPublished(@Query() query: PostsQueryDto) {
    return this.postsService.findPublished(query);
  }

  @Get('posts/metadata')
  getBlogMetadata() {
    return this.postsService.getBlogMetadata();
  }

  @Get('posts/slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  // Admin endpoints (protected)
  @RequireActiveUser()
  @Post('admin/posts')
  create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: any) {
    return this.postsService.create(createPostDto, user.id);
  }

  @RequireActiveUser()
  @Get('admin/posts')
  findAll(@CurrentUser() user: any) {
    // Admins can see all posts, authors can only see their own
    if (user.role === 'ADMIN') {
      return this.postsService.findAll(true); // Include unpublished posts for admin
    } else {
      return this.postsService.findByAuthor(user.id, true); // Include unpublished posts for author
    }
  }

  @RequireActiveUser()
  @Get('admin/posts/:id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const post = await this.postsService.findOne(id);

    // Authors can only view their own posts, admins can view all
    if (user.role !== 'ADMIN' && post.author.id !== user.id) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  @RequireActiveUser()
  @Patch('admin/posts/:id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: any,
  ) {
    const post = await this.postsService.findOne(id);

    // Authors can only update their own posts, admins can update all
    if (user.role !== 'ADMIN' && post.author.id !== user.id) {
      throw new NotFoundException('Post not found');
    }

    return this.postsService.update(id, updatePostDto);
  }

  @RequireActiveUser()
  @Delete('admin/posts/:id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const post = await this.postsService.findOne(id);

    // Authors can only delete their own posts, admins can delete all
    if (user.role !== 'ADMIN' && post.author.id !== user.id) {
      throw new NotFoundException('Post not found');
    }

    return this.postsService.remove(id);
  }
}
