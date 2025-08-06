import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  IsUrl,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50, {
    message: 'First name must not exceed 50 characters',
  })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, {
    message: 'Last name must not exceed 50 characters',
  })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, {
    message: 'Username must not exceed 50 characters',
  })
  username?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Profile picture must be a valid URL' })
  profilePicture?: string;
}
