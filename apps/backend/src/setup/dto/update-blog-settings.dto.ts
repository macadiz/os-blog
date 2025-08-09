import {
  IsString,
  IsOptional,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';

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
  @ValidateIf((o) => o.logoUrl !== null)
  @Matches(/^(https?:\/\/[\w\-.]+(:\d+)?\/|\/)/i, {
    message: 'Logo URL must be a valid URL or relative path',
  })
  logoUrl?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.faviconUrl !== null)
  @Matches(/^(https?:\/\/[\w\-.]+(:\d+)?\/|\/)/i, {
    message: 'Favicon URL must be a valid URL or relative path',
  })
  faviconUrl?: string | null;

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
