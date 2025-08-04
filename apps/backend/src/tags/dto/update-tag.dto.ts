import { IsString, IsOptional, Matches, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateTagDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  @Transform(({ value, obj }) => {
    // Auto-generate slug from name if not provided
    return (
      value ||
      obj.name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    );
  })
  slug?: string;
}
