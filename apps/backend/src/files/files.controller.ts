import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  Res,
  ParseEnumPipe,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilesService, FileCategory, UploadResult } from './files.service';
import * as mime from 'mime-types';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * Upload a file to a specific category
   */
  @Post('upload/:category')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('category', new ParseEnumPipe(FileCategory)) category: FileCategory,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.filesService.uploadFile(file, category);
  }

  /**
   * Replace an existing file (transactional update)
   */
  @Post('replace/:category/:filename')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async replaceFile(
    @Param('category', new ParseEnumPipe(FileCategory)) category: FileCategory,
    @Param('filename') filename: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    this.validateFilenameParam(filename);

    // Check if the file exists before replacing
    const exists = await this.filesService.fileExists(category, filename);
    if (!exists) {
      throw new NotFoundException('File to replace not found');
    }

    return this.filesService.uploadFile(file, category, filename);
  }

  /**
   * Serve a static file
   */
  @Get(':category/:filename')
  async serveFile(
    @Param('category', new ParseEnumPipe(FileCategory)) category: FileCategory,
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    this.validateFilenameParam(filename);
    const filePath = this.filesService.getFilePath(category, filename);
    const exists = await this.filesService.fileExists(category, filename);

    if (!exists) {
      throw new NotFoundException('File not found');
    }

    // Set appropriate content type
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);

    // Set cache headers for better performance
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    res.setHeader('ETag', `"${filename}"`);

    res.sendFile(filePath);
  }

  /**
   * Delete a file
   */
  @Delete(':category/:filename')
  @UseGuards(JwtAuthGuard)
  async deleteFile(
    @Param('category', new ParseEnumPipe(FileCategory)) category: FileCategory,
    @Param('filename') filename: string,
  ): Promise<{ message: string }> {
    this.validateFilenameParam(filename);
    const exists = await this.filesService.fileExists(category, filename);
    if (!exists) {
      throw new NotFoundException('File not found');
    }

    await this.filesService.deleteFile(category, filename);
    return { message: 'File deleted successfully' };
  }

  /**
   * Get file information without downloading
   */
  @Get(':category/:filename/info')
  async getFileInfo(
    @Param('category', new ParseEnumPipe(FileCategory)) category: FileCategory,
    @Param('filename') filename: string,
  ): Promise<{
    filename: string;
    category: string;
    url: string;
    exists: boolean;
  }> {
    this.validateFilenameParam(filename);
    const exists = await this.filesService.fileExists(category, filename);

    return {
      filename,
      category,
      url: this.filesService.getFileUrl(category, filename),
      exists,
    };
  }

  /**
   * Validate filename parameter to prevent directory traversal attacks
   */
  private validateFilenameParam(filename: string): void {
    if (!filename || typeof filename !== 'string') {
      throw new BadRequestException('Invalid filename');
    }

    // Check for directory traversal sequences
    const dangerousPatterns = [
      '../',
      '..\\',
      '..%2f',
      '..%5c', // Directory traversal
      '%00',
      '\0', // Null byte injection
      '/',
      '\\', // Path separators (shouldn't be in filename)
    ];

    const lowerFilename = filename.toLowerCase();
    for (const pattern of dangerousPatterns) {
      if (lowerFilename.includes(pattern.toLowerCase())) {
        throw new BadRequestException('Invalid filename parameter');
      }
    }

    // Additional security: ensure filename doesn't start with dots
    if (filename.startsWith('.')) {
      throw new BadRequestException('Invalid filename parameter');
    }

    // Ensure reasonable length
    if (filename.length > 255) {
      throw new BadRequestException('Filename parameter too long');
    }
  }
}
