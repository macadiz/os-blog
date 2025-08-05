import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequireActiveUser } from '../auth/decorators/require-active-user.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @RequireActiveUser(['ADMIN'])
  create(
    @Body(ValidationPipe) createCategoryDto: CreateCategoryDto,
    @CurrentUser() user: any,
  ) {
    return this.categoriesService.create(createCategoryDto, user.id);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @RequireActiveUser(['ADMIN'])
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @RequireActiveUser(['ADMIN'])
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
