import { NotImplementedException } from '@nestjs/common';
import { SparkDisabledStorageRepository } from './spark-disabled-storage.repository';

describe('SparkDisabledStorageRepository', () => {
  let repository: SparkDisabledStorageRepository;

  beforeEach(() => {
    repository = new SparkDisabledStorageRepository();
  });

  it('should return isStorageEnabled as false under Spark plan (Option B)', () => {
    expect(repository.isStorageEnabled()).toBe(false);
  });

  it('should throw NotImplementedException on uploadFile without fake URLs', async () => {
    const dummyFile = {
      originalname: 'resume.pdf',
      buffer: Buffer.from('test'),
      mimetype: 'application/pdf',
    };

    await expect(repository.uploadFile(dummyFile, 'candidate-resumes', 'candidates/1/resumes/1/resume.pdf')).rejects.toThrow(
      NotImplementedException
    );
  });

  it('should return null for getSignedDownloadUrl', async () => {
    const url = await repository.getSignedDownloadUrl('candidate-resumes', 'path/file.pdf');
    expect(url).toBeNull();
  });

  it('should return false for deleteFile', async () => {
    const res = await repository.deleteFile('candidate-resumes', 'path/file.pdf');
    expect(res).toBe(false);
  });
});
