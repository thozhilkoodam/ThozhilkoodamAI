import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

export type DocumentType = 'resume' | 'certificate' | 'profile_image' | 'company_logo';

export const BUCKET_NAMES: Record<DocumentType, string> = {
  resume: 'candidate-resumes',
  certificate: 'candidate-certificates',
  profile_image: 'profile-images',
  company_logo: 'company-logos',
};

export const FILE_SIZE_LIMITS: Record<DocumentType, number> = {
  resume: 10 * 1024 * 1024,      // 10 MB
  certificate: 10 * 1024 * 1024, // 10 MB
  profile_image: 5 * 1024 * 1024, // 5 MB
  company_logo: 5 * 1024 * 1024,  // 5 MB
};

export const ALLOWED_MIME_TYPES: Record<DocumentType, string[]> = {
  resume: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  certificate: ['application/pdf', 'image/jpeg', 'image/png'],
  profile_image: ['image/jpeg', 'image/png'],
  company_logo: ['image/jpeg', 'image/png', 'image/svg+xml'],
};

const DANGEROUS_EXTENSIONS = [
  '.exe', '.dll', '.bat', '.sh', '.cmd', '.js', '.html', '.htm',
  '.php', '.py', '.rb', '.pl', '.jar', '.vbs', '.ps1', '.cgi', '.asp', '.aspx',
];

/**
 * Sanitizes a raw filename to prevent path traversal and unsafe character execution.
 */
export function sanitizeFileName(filename?: string): string {
  if (!filename || !filename.trim()) return 'document';
  
  // Remove path traversal and null bytes
  let safe = filename.replace(/\0/g, '').replace(/\\/g, '/');
  const basename = safe.split('/').pop() || 'document';
  
  // Remove special characters, keeping alphanumerics, dots, hyphens, and underscores
  safe = basename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  
  // Prevent leading dot or multiple dots
  safe = safe.replace(/^\.+/, '');
  
  // Check extension against dangerous list
  const ext = safe.substring(safe.lastIndexOf('.')).toLowerCase();
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    throw new BadRequestException(`Dangerous file extension '${ext}' is strictly prohibited.`);
  }

  return safe || 'document';
}

/**
 * Inspects buffer magic bytes (file signatures) to verify file integrity.
 */
export function validateMagicBytes(buffer: Buffer, mimeType: string, type: DocumentType): boolean {
  if (!buffer || buffer.length === 0) return false;

  // PDF signature: %PDF (0x25 0x50 0x44 0x46)
  if (mimeType === 'application/pdf') {
    return (
      buffer.length >= 4 &&
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    );
  }

  // PNG signature: \x89PNG\r\n\x1a\n (0x89 0x50 0x4E 0x47)
  if (mimeType === 'image/png') {
    return (
      buffer.length >= 4 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  // JPEG signature: \xFF\xD8\xFF (0xFF 0xD8 0xFF)
  if (mimeType === 'image/jpeg') {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  // DOC (OLE CFBF): 0xD0 0xCF 0x11 0xE0
  if (mimeType === 'application/msword') {
    return (
      buffer.length >= 4 &&
      buffer[0] === 0xd0 &&
      buffer[1] === 0xcf &&
      buffer[2] === 0x11 &&
      buffer[3] === 0xe0
    );
  }

  // DOCX (ZIP archive): 0x50 0x4B 0x03 0x04 or 0x50 0x4B 0x05 0x06
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return (
      buffer.length >= 4 &&
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      (buffer[2] === 0x03 || buffer[2] === 0x05)
    );
  }

  // SVG: Check for <svg or <?xml header
  if (mimeType === 'image/svg+xml' && type === 'company_logo') {
    const text = buffer.toString('utf8', 0, Math.min(buffer.length, 512)).toLowerCase();
    return text.includes('<svg') || text.includes('<?xml');
  }

  return true; // Fallback for supported mime types where magic byte header is verified above
}

/**
 * Full file validation pipeline.
 */
export function validateUploadedFile(
  file: { originalname: string; buffer: Buffer; mimetype: string; size: number },
  type: DocumentType,
) {
  if (!file || !file.buffer) {
    throw new BadRequestException('No file provided or empty file content.');
  }

  const safeFileName = sanitizeFileName(file.originalname);

  // Check file size
  const maxBytes = FILE_SIZE_LIMITS[type];
  if (file.size > maxBytes) {
    throw new BadRequestException(
      `File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds maximum allowed limit for ${type} (${maxBytes / 1024 / 1024} MB).`
    );
  }

  // Check MIME type
  const allowedMimes = ALLOWED_MIME_TYPES[type];
  if (!allowedMimes.includes(file.mimetype)) {
    throw new BadRequestException(
      `Invalid MIME type '${file.mimetype}' for ${type}. Allowed types: ${allowedMimes.join(', ')}`
    );
  }

  // Check magic bytes
  if (!validateMagicBytes(file.buffer, file.mimetype, type)) {
    throw new BadRequestException(
      `File content signature (magic bytes) does not match expected file type '${file.mimetype}'.`
    );
  }

  return { safeFileName };
}

/**
 * Constructs secure backend-controlled object key path.
 */
export function generateObjectKey(
  type: DocumentType,
  entityId: string,
  documentId: string,
  safeFileName: string,
): string {
  switch (type) {
    case 'resume':
      return `candidates/${entityId}/resumes/${documentId}/${safeFileName}`;
    case 'certificate':
      return `candidates/${entityId}/certificates/${documentId}/${safeFileName}`;
    case 'profile_image':
      return `users/${entityId}/profile/${documentId}/${safeFileName}`;
    case 'company_logo':
      return `companies/${entityId}/logo/${documentId}/${safeFileName}`;
    default:
      return `documents/${entityId}/${documentId}/${safeFileName}`;
  }
}

/**
 * Computes SHA-256 checksum for binary buffer integrity.
 */
export function computeChecksum(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
