import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { SparkDisabledStorageRepository } from '../common/storage/spark-disabled-storage.repository';

@Module({
  controllers: [UploadController],
  providers: [
    UploadService,
    {
      provide: 'FileStorageRepository',
      useClass: SparkDisabledStorageRepository,
    },
  ],
  exports: [UploadService, 'FileStorageRepository'],
})
export class UploadModule {}
