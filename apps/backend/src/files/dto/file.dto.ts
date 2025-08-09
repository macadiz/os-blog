import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { FileCategory } from '../files.service';

export class UploadFileDto {
  @IsEnum(FileCategory)
  @IsNotEmpty()
  category: FileCategory;
}

export class ReplaceFileDto {
  @IsEnum(FileCategory)
  @IsNotEmpty()
  category: FileCategory;

  @IsString()
  @IsNotEmpty()
  filename: string;
}

export class FileInfoDto {
  @IsEnum(FileCategory)
  @IsNotEmpty()
  category: FileCategory;

  @IsString()
  @IsNotEmpty()
  filename: string;
}

export class FileResponseDto {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
}

export class FileDeleteResponseDto {
  message: string;
}

export class FileInfoResponseDto {
  filename: string;
  category: string;
  url: string;
  exists: boolean;
}
