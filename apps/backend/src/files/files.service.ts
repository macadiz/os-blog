import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export enum FileCategory {
  SETTINGS = 'settings',
  PROFILE_PICTURES = 'profile_pictures',
  BLOG_IMAGES = 'blog_images',
}

export interface UploadResult {
  filename: string;
  originalName: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
}

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly staticDir: string;
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];

  constructor(private readonly configService: ConfigService) {
    // Use different static paths based on environment
    const nodeEnv = this.configService.get('NODE_ENV', 'development');
    if (nodeEnv === 'production') {
      // In production (Docker), use the shared static volume
      this.staticDir = '/app/static';
    } else {
      // In development, use local static folder
      this.staticDir = path.join(process.cwd(), 'static');
    }

    this.logger.log(`Static directory: ${this.staticDir} (env: ${nodeEnv})`);
    void this.ensureDirectoriesExist();
  }

  /**
   * Upload a file to the specified category directory
   */
  async uploadFile(
    file: Express.Multer.File,
    category: FileCategory,
    oldFilename?: string,
  ): Promise<UploadResult> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExtension}`;
    const categoryDir = path.join(this.staticDir, category);
    const filePath = path.join(categoryDir, filename);

    try {
      // If updating, delete old file first (transactional approach)
      if (oldFilename) {
        await this.deleteFile(category, oldFilename);
      }

      // Write new file
      await fs.writeFile(filePath, file.buffer);

      const result: UploadResult = {
        filename,
        originalName: file.originalname,
        path: filePath,
        url: `/files/${category}/${filename}`,
        size: file.size,
        mimeType: file.mimetype,
      };

      this.logger.log(
        `[UPLOAD] File uploaded: ${file.originalname} -> ${filename} (${category})`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `[ERROR] Failed to upload file: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to upload file');
    }
  }

  /**
   * Delete a file from the specified category directory
   */
  async deleteFile(category: FileCategory, filename: string): Promise<void> {
    const filePath = path.join(this.staticDir, category, filename);

    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      this.logger.log(`[DELETE] File deleted: ${filename} (${category})`);
    } catch {
      // File doesn't exist, which is fine for our use case
      this.logger.warn(
        `[WARN] File not found for deletion: ${filename} (${category})`,
      );
    }
  }

  /**
   * Get file path for serving
   */
  getFilePath(category: FileCategory, filename: string): string {
    return path.join(this.staticDir, category, filename);
  }

  /**
   * Check if file exists
   */
  async fileExists(category: FileCategory, filename: string): Promise<boolean> {
    try {
      const filePath = this.getFilePath(category, filename);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the full URL for a file
   */
  getFileUrl(category: FileCategory, filename: string): string {
    return `/files/${category}/${filename}`;
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  /**
   * Ensure all required directories exist
   */
  private async ensureDirectoriesExist(): Promise<void> {
    const directories = [
      this.staticDir,
      path.join(this.staticDir, FileCategory.SETTINGS),
      path.join(this.staticDir, FileCategory.PROFILE_PICTURES),
      path.join(this.staticDir, FileCategory.BLOG_IMAGES),
    ];

    for (const dir of directories) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        this.logger.log(`[SETUP] Created directory: ${dir}`);
      }
    }
  }

  /**
   * Serve a file by category and filename
   */
  async serveFile(category: FileCategory, filename: string): Promise<string> {
    const filePath = this.getFilePath(category, filename);

    try {
      await fs.access(filePath);
      return filePath;
    } catch {
      throw new NotFoundException(`File not found: ${filename} in ${category}`);
    }
  }
}
