import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { FilesController } from '../files/files.controller';
import { SupabaseStorageRepository } from '../common/storage/supabase-storage.repository';
import { SparkDisabledStorageRepository } from '../common/storage/spark-disabled-storage.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FilesController],
  providers: [
    DocumentsService,
    SupabaseStorageRepository,
    SparkDisabledStorageRepository,
    {
      provide: 'FileStorageRepository',
      useFactory: (supabaseRepo: SupabaseStorageRepository, sparkRepo: SparkDisabledStorageRepository) => {
        if (supabaseRepo.isStorageEnabled()) {
          return supabaseRepo;
        }
        return sparkRepo;
      },
      inject: [SupabaseStorageRepository, SparkDisabledStorageRepository],
    },
  ],
  exports: [DocumentsService, 'FileStorageRepository'],
})
export class DocumentsModule {}
