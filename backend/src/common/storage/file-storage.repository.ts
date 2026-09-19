export interface StorageUploadResult {
  url: string | null;
  path: string | null;
  message: string;
  isStorageEnabled: boolean;
  bucket?: string;
  objectKey?: string;
}

export abstract class FileStorageRepository {
  abstract uploadFile(
    file: { originalname: string; buffer: Buffer; mimetype: string },
    bucket: string,
    objectKey: string,
  ): Promise<StorageUploadResult>;

  abstract getSignedDownloadUrl(
    bucket: string,
    objectKey: string,
    expiresInSeconds?: number,
  ): Promise<string | null>;

  abstract deleteFile(bucket: string, objectKey: string): Promise<boolean>;

  abstract isStorageEnabled(): boolean;

  abstract getFileBuffer(bucket: string, objectKey: string): Promise<Buffer | null>;
}

