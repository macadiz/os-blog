import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string; // Can be either username or email

  @IsString()
  @IsNotEmpty()
  password: string;
}
