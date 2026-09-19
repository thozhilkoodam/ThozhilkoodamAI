import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileStorageRepository } from '../common/storage/file-storage.repository';
import {
  DocumentType,
  BUCKET_NAMES,
  validateUploadedFile,
  generateObjectKey,
  computeChecksum,
} from '../common/utils/file-validation.util';
import { randomUUID } from 'crypto';

export interface UserContext {
  id: string;
  role: string;
  companyId?: string;
}

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('FileStorageRepository')
    private readonly storageRepository: FileStorageRepository,
  ) {}

  private checkAuthorization(user: UserContext, type: DocumentType, targetEntityId?: string) {
    if (!user || !user.id) {
      throw new ForbiddenException('User authentication is required.');
    }

    const isAdmin = ['admin', 'super_admin'].includes(user.role);
    if (isAdmin) return;

    if (type === 'resume' || type === 'certificate' || type === 'profile_image') {
      const entityId = targetEntityId || user.id;
      if (entityId !== user.id) {
        throw new ForbiddenException(`Candidates may only manage their own ${type}.`);
      }
    }

    if (type === 'company_logo') {
      const companyId = targetEntityId || user.companyId;
      if (!companyId) {
        throw new ForbiddenException('Company ID is required for company logo management.');
      }
      if (user.companyId && user.companyId !== companyId) {
        throw new ForbiddenException('Employers may only manage their own company logo.');
      }
    }
  }

  async uploadDocument(
    user: UserContext,
    type: DocumentType,
    file: Express.Multer.File,
    targetEntityId?: string,
  ) {
    this.checkAuthorization(user, type, targetEntityId);

    const entityId = targetEntityId || (type === 'company_logo' ? user.companyId || user.id : user.id);
    const { safeFileName } = validateUploadedFile(file, type);
    const documentId = randomUUID();
    const checksum = computeChecksum(file.buffer);
    const bucket = BUCKET_NAMES[type];
    const objectKey = generateObjectKey(type, entityId, documentId, safeFileName);

    // 1. Create document metadata record in database with status 'uploading'
    let docRecord: any;
    try {
      docRecord = await this.prisma.candidateDocument.create({
        data: {
          id: documentId,
          userId: user.id,
          name: safeFileName,
          type: type,
          url: objectKey, // Stores the objectKey as the canonical storage location
          size: String(file.size),
        },
      });
    } catch (dbErr: any) {
      this.logger.error(`Database metadata creation failed: ${dbErr?.message}`);
      throw new InternalServerErrorException('Failed to create document metadata.');
    }

    // 2. Upload file to Supabase Storage
    try {
      await this.storageRepository.uploadFile(
        { originalname: safeFileName, buffer: file.buffer, mimetype: file.mimetype },
        bucket,
        objectKey,
      );
    } catch (uploadErr: any) {
      this.logger.error(`Storage upload failed for doc ${documentId}: ${uploadErr?.message}`);
      // Mark record failed or delete
      await this.prisma.candidateDocument.delete({ where: { id: documentId } }).catch(() => {});
      throw new InternalServerErrorException(`Storage upload failed: ${uploadErr?.message}`);
    }

    // 3. Log audit operation safely (no secrets logged)
    this.logger.log(`Document uploaded successfully: docId=${documentId}, userId=${user.id}, type=${type}`);

    return {
      documentId,
      candidateId: user.id,
      type,
      fileName: safeFileName,
      storageProvider: 'supabase',
      bucketName: bucket,
      objectKey,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      checksum,
      status: 'ready',
      createdAt: docRecord.createdAt,
    };
  }

  async getSignedDownloadUrl(user: UserContext, documentId: string) {
    const doc = await this.prisma.candidateDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');

    const isAdmin = ['admin', 'super_admin'].includes(user.role);
    const isEmployer = ['msme_client', 'recruitment_agency', 'hr_recruiter'].includes(user.role);
    const isOwner = doc.userId === user.id;

    if (!isOwner && !isAdmin && !isEmployer) {
      throw new ForbiddenException('You are not authorized to access this document.');
    }

    const type = (doc.type as DocumentType) || 'resume';
    const bucket = BUCKET_NAMES[type] || 'candidate-resumes';
    const objectKey = doc.url;

    const signedUrl = await this.storageRepository.getSignedDownloadUrl(bucket, objectKey, 900);
    if (!signedUrl) {
      throw new InternalServerErrorException('Failed to generate signed download URL.');
    }

    this.logger.log(`Signed URL generated for docId=${documentId}, userId=${user.id}`);

    return {
      documentId,
      signedUrl,
      expiresInSeconds: 900,
    };
  }

  async getDocumentMetadata(user: UserContext, documentId: string) {
    const doc = await this.prisma.candidateDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');

    const isAdmin = ['admin', 'super_admin'].includes(user.role);
    const isEmployer = ['msme_client', 'recruitment_agency', 'hr_recruiter'].includes(user.role);
    const isOwner = doc.userId === user.id;

    if (!isOwner && !isAdmin && !isEmployer) {
      throw new ForbiddenException('You are not authorized to access this document metadata.');
    }

    const type = (doc.type as DocumentType) || 'resume';
    const bucket = BUCKET_NAMES[type] || 'candidate-resumes';

    return {
      documentId: doc.id,
      candidateId: doc.userId,
      type: doc.type,
      fileName: doc.name,
      storageProvider: 'supabase',
      bucketName: bucket,
      objectKey: doc.url,
      sizeBytes: doc.size,
      status: 'ready',
      createdAt: doc.createdAt,
    };
  }

  async deleteDocument(user: UserContext, documentId: string) {
    const doc = await this.prisma.candidateDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');

    const isAdmin = ['admin', 'super_admin'].includes(user.role);
    const isOwner = doc.userId === user.id;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You are not authorized to delete this document.');
    }

    const type = (doc.type as DocumentType) || 'resume';
    const bucket = BUCKET_NAMES[type] || 'candidate-resumes';
    const objectKey = doc.url;

    // 1. Delete storage object
    await this.storageRepository.deleteFile(bucket, objectKey);

    // 2. Delete database record
    await this.prisma.candidateDocument.delete({ where: { id: documentId } });

    this.logger.log(`Document deleted: docId=${documentId}, userId=${user.id}`);

    return {
      success: true,
      message: 'Document deleted successfully',
    };
  }

  async replaceDocument(
    user: UserContext,
    documentId: string,
    file: Express.Multer.File,
  ) {
    const doc = await this.prisma.candidateDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');

    const isAdmin = ['admin', 'super_admin'].includes(user.role);
    const isOwner = doc.userId === user.id;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You are not authorized to replace this document.');
    }

    const type = (doc.type as DocumentType) || 'resume';
    const oldBucket = BUCKET_NAMES[type] || 'candidate-resumes';
    const oldObjectKey = doc.url;

    const { safeFileName } = validateUploadedFile(file, type);
    const newDocId = randomUUID();
    const newChecksum = computeChecksum(file.buffer);
    const newObjectKey = generateObjectKey(type, user.id, newDocId, safeFileName);

    // 1. Upload new file to Supabase
    await this.storageRepository.uploadFile(
      { originalname: safeFileName, buffer: file.buffer, mimetype: file.mimetype },
      oldBucket,
      newObjectKey,
    );

    // 2. Update metadata in database
    const updated = await this.prisma.candidateDocument.update({
      where: { id: documentId },
      data: {
        name: safeFileName,
        url: newObjectKey,
        size: String(file.size),
      },
    });

    // 3. Delete old storage object ONLY after successful upload and metadata update
    await this.storageRepository.deleteFile(oldBucket, oldObjectKey).catch(() => {});

    this.logger.log(`Document replaced: docId=${documentId}, userId=${user.id}`);

    return {
      documentId: updated.id,
      candidateId: updated.userId,
      type: updated.type,
      fileName: updated.name,
      storageProvider: 'supabase',
      bucketName: oldBucket,
      objectKey: newObjectKey,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      checksum: newChecksum,
      status: 'ready',
      updatedAt: new Date(),
    };
  }
}
