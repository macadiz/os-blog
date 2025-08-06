import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class UpdateBlogSettingsDto {
  @IsString()
  @MaxLength(100, {
    message: 'Blog title must not exceed 100 characters',
  })
  blogTitle: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Blog description must not exceed 500 characters',
  })
  blogDescription?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Logo URL must be a valid URL' })
  logoUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Favicon URL must be a valid URL' })
  faviconUrl?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  emailSettings?: any;

  @IsOptional()
  socialLinks?: any;

  @IsOptional()
  seoSettings?: any;
}
