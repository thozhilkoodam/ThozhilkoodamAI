import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FileStorageRepository, StorageUploadResult } from './file-storage.repository';

@Injectable()
export class SupabaseStorageRepository implements FileStorageRepository {
  private readonly logger = new Logger(SupabaseStorageRepository.name);
  private client: SupabaseClient | null = null;

  constructor() {
    this.initClient();
  }

  private initClient(): SupabaseClient | null {
    if (this.client) return this.client;

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
      this.logger.warn('Supabase URL or Service Role Key is not configured in environment variables.');
      return null;
    }

    try {
      this.client = createClient(url, key, {
        auth: { persistSession: false },
      });
      return this.client;
    } catch (err: any) {
      this.logger.error(`Failed to initialize Supabase client: ${err?.message}`);
      return null;
    }
  }

  isStorageEnabled(): boolean {
    return this.initClient() !== null;
  }

  async uploadFile(
    file: { originalname: string; buffer: Buffer; mimetype: string },
    bucket: string,
    objectKey: string,
  ): Promise<StorageUploadResult> {
    const client = this.initClient();
    if (!client) {
      throw new InternalServerErrorException('Supabase storage is unconfigured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    }

    const { error } = await client.storage
      .from(bucket)
      .upload(objectKey, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      this.logger.error(`Supabase upload failed for bucket '${bucket}' key '${objectKey}': ${error.message}`);
      throw new InternalServerErrorException(`Storage upload failed: ${error.message}`);
    }

    return {
      url: null, // Private buckets do not expose static public URLs
      path: objectKey,
      bucket,
      objectKey,
      message: 'File uploaded successfully to Supabase Storage',
      isStorageEnabled: true,
    };
  }

  async getSignedDownloadUrl(
    bucket: string,
    objectKey: string,
    expiresInSeconds = 900,
  ): Promise<string | null> {
    const client = this.initClient();
    if (!client) return null;

    const { data, error } = await client.storage
      .from(bucket)
      .createSignedUrl(objectKey, expiresInSeconds);

    if (error || !data?.signedUrl) {
      this.logger.error(`Failed to create signed URL for bucket '${bucket}' key '${objectKey}': ${error?.message}`);
      return null;
    }

    return data.signedUrl;
  }

  async deleteFile(bucket: string, objectKey: string): Promise<boolean> {
    const client = this.initClient();
    if (!client) return false;

    const { error } = await client.storage.from(bucket).remove([objectKey]);
    if (error) {
      this.logger.error(`Failed to delete object from bucket '${bucket}' key '${objectKey}': ${error.message}`);
      return false;
    }
    return true;
  }

  async getFileBuffer(bucket: string, objectKey: string): Promise<Buffer | null> {
    const client = this.initClient();
    if (!client) return null;

    const { data, error } = await client.storage.from(bucket).download(objectKey);
    if (error || !data) {
      this.logger.error(`Failed to download object buffer from bucket '${bucket}' key '${objectKey}': ${error?.message}`);
      return null;
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

