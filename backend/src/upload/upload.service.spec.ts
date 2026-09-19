import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { SparkDisabledStorageRepository } from '../common/storage/spark-disabled-storage.repository';

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        { provide: 'FileStorageRepository', useClass: SparkDisabledStorageRepository },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should report isStorageEnabled as false under Option B Spark plan', () => {
    expect(service.isStorageEnabled()).toBe(false);
  });
});
