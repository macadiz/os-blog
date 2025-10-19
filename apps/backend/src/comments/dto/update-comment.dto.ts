import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Comment content cannot exceed 2000 characters' })
  content?: string;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @IsOptional()
  @IsBoolean()
  isSpam?: boolean;
}