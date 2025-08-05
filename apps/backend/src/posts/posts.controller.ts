import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireActiveUser } from '../auth/decorators/require-active-user.decorator';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // Public endpoints
  @Get('posts/published')
  findPublished() {
    return this.postsService.findPublished();
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
  findAll() {
    return this.postsService.findAll(true); // Include unpublished posts for admin
  }

  @RequireActiveUser()
  @Get('admin/posts/:id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @RequireActiveUser()
  @Patch('admin/posts/:id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @RequireActiveUser()
  @Delete('admin/posts/:id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
