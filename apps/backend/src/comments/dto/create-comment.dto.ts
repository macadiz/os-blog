import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000, { message: 'Comment content cannot exceed 2000 characters' })
  content: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  authorEmail: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100, { message: 'Author name cannot exceed 100 characters' })
  authorName: string;
}