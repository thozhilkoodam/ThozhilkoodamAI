import { Injectable, NotImplementedException } from '@nestjs/common';
import { FileStorageRepository, StorageUploadResult } from './file-storage.repository';

@Injectable()
export class SparkDisabledStorageRepository implements FileStorageRepository {
  isStorageEnabled(): boolean {
    return false;
  }

  async uploadFile(
    file: { originalname: string; buffer: Buffer; mimetype: string },
    bucket: string,
    objectKey: string,
  ): Promise<StorageUploadResult> {
    throw new NotImplementedException(
      `File uploads are disabled under the Firebase Spark plan (Step 4 Option B). ` +
      `Supabase Storage is available when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured (Step 5).`
    );
  }

  async getSignedDownloadUrl(
    bucket: string,
    objectKey: string,
    expiresInSeconds = 900,
  ): Promise<string | null> {
    return null;
  }

  async deleteFile(bucket: string, objectKey: string): Promise<boolean> {
    return false;
  }

  async getFileBuffer(bucket: string, objectKey: string): Promise<Buffer | null> {
    return null;
  }
}

