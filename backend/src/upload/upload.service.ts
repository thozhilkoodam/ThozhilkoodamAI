import { Injectable, Inject } from '@nestjs/common';
import { FileStorageRepository, StorageUploadResult } from '../common/storage/file-storage.repository';

@Injectable()
export class UploadService {
  constructor(
    @Inject('FileStorageRepository')
    private readonly storageRepository: FileStorageRepository,
  ) {}

  isStorageEnabled(): boolean {
    return this.storageRepository.isStorageEnabled();
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<StorageUploadResult> {
    const objectKey = `${folder}/${Date.now()}-${file?.originalname || 'file'}`;
    return this.storageRepository.uploadFile(file, folder, objectKey);
  }
}
