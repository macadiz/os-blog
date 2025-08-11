import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsNotEmpty()
  blogTitle: string;

  @IsString()
  @IsOptional()
  blogDescription?: string;

  // logo and favicon will be handled as files in the controller, not as DTO fields
}

export class BlogSettingsDto {
  @IsString()
  @IsNotEmpty()
  blogTitle: string;

  @IsString()
  @IsOptional()
  blogDescription?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}
