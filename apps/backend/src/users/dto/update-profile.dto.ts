import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  Matches,
  ValidateIf,
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
  @ValidateIf((o) => o.profilePicture !== null)
  @Matches(/^(https?:\/\/[\w\-.]+(:\d+)?\/|\/)/i, {
    message: 'Profile picture must be a valid URL or relative path',
  })
  profilePicture?: string | null;
}
