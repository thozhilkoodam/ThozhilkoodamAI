import { BadRequestException } from '@nestjs/common';
import {
  sanitizeFileName,
  validateMagicBytes,
  validateUploadedFile,
  generateObjectKey,
  computeChecksum,
} from './file-validation.util';

describe('FileValidationUtil', () => {
  describe('sanitizeFileName', () => {
    it('should sanitize unsafe filenames and path traversal', () => {
      expect(sanitizeFileName('../../etc/passwd')).toBe('passwd');
      expect(sanitizeFileName('my resume!@#$%^&*().pdf')).toBe('my_resume__________.pdf');
    });

    it('should reject dangerous executable file extensions', () => {
      expect(() => sanitizeFileName('malicious.exe')).toThrow(BadRequestException);
      expect(() => sanitizeFileName('script.sh')).toThrow(BadRequestException);
      expect(() => sanitizeFileName('page.html')).toThrow(BadRequestException);
    });
  });

  describe('validateMagicBytes', () => {
    it('should validate PDF magic bytes (%PDF)', () => {
      const validPdf = Buffer.from('%PDF-1.5 test content');
      const invalidPdf = Buffer.from('NOT A PDF');
      expect(validateMagicBytes(validPdf, 'application/pdf', 'resume')).toBe(true);
      expect(validateMagicBytes(invalidPdf, 'application/pdf', 'resume')).toBe(false);
    });

    it('should validate PNG magic bytes (0x89PNG)', () => {
      const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const invalidPng = Buffer.from([0x00, 0x00, 0x00, 0x00]);
      expect(validateMagicBytes(validPng, 'image/png', 'profile_image')).toBe(true);
      expect(validateMagicBytes(invalidPng, 'image/png', 'profile_image')).toBe(false);
    });

    it('should validate JPEG magic bytes (0xFFD8FF)', () => {
      const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
      const invalidJpeg = Buffer.from([0x00, 0x00, 0x00]);
      expect(validateMagicBytes(validJpeg, 'image/jpeg', 'profile_image')).toBe(true);
      expect(validateMagicBytes(invalidJpeg, 'image/jpeg', 'profile_image')).toBe(false);
    });
  });

  describe('validateUploadedFile', () => {
    it('should reject oversized resume files (> 10MB)', () => {
      const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024);
      expect(() =>
        validateUploadedFile(
          { originalname: 'resume.pdf', buffer: oversizedBuffer, mimetype: 'application/pdf', size: oversizedBuffer.length },
          'resume',
        ),
      ).toThrow(BadRequestException);
    });

    it('should reject invalid MIME types', () => {
      const buffer = Buffer.from('%PDF-1.4');
      expect(() =>
        validateUploadedFile(
          { originalname: 'file.txt', buffer, mimetype: 'text/plain', size: buffer.length },
          'resume',
        ),
      ).toThrow(BadRequestException);
    });
  });

  describe('generateObjectKey', () => {
    it('should construct secure object key paths for all document types', () => {
      expect(generateObjectKey('resume', 'cand-1', 'doc-1', 'resume.pdf')).toBe(
        'candidates/cand-1/resumes/doc-1/resume.pdf',
      );
      expect(generateObjectKey('certificate', 'cand-1', 'doc-2', 'cert.pdf')).toBe(
        'candidates/cand-1/certificates/doc-2/cert.pdf',
      );
      expect(generateObjectKey('profile_image', 'user-1', 'doc-3', 'photo.png')).toBe(
        'users/user-1/profile/doc-3/photo.png',
      );
      expect(generateObjectKey('company_logo', 'comp-1', 'doc-4', 'logo.png')).toBe(
        'companies/comp-1/logo/doc-4/logo.png',
      );
    });
  });

  describe('computeChecksum', () => {
    it('should compute SHA-256 hex checksum accurately', () => {
      const buffer = Buffer.from('Hello Thozhil Koodam');
      const hash = computeChecksum(buffer);
      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });
  });
});
