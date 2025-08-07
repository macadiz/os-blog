import { IsOptional, IsString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class PostsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(({ value }) => {
    // Handle both single tag and multiple tags
    if (typeof value === 'string') {
      return value.includes(',')
        ? value.split(',').map((t) => t.trim())
        : [value];
    }
    return Array.isArray(value) ? value : [value];
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  tag?: string; // Keep for backward compatibility

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'publishedAt' | 'title';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
