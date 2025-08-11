import { Module } from '@nestjs/common';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';
import { FilesService } from '../files/files.service';

@Module({
  controllers: [SetupController],
  providers: [SetupService, FilesService],
  exports: [SetupService],
})
export class SetupModule {}
