import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

describe('JobsController', () => {
  let controller: JobsController;
  let service: any;

  const mockUser = { id: 'comp-123', role: 'recruitment_agency', name: 'ABC Agency' };

  beforeEach(async () => {
    service = {
      findAllPublished: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      submitJob: jest.fn(),
      publishJob: jest.fn(),
      closeJob: jest.fn(),
      archiveJob: jest.fn(),
      deleteJob: jest.fn(),
      getAdminStats: jest.fn(),
      getStats: jest.fn(),
      findByStatus: jest.fn(),
      approveJob: jest.fn(),
      rejectJob: jest.fn(),
      requestChanges: jest.fn(),
      featureJob: jest.fn(),
      unfeatureJob: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [{ provide: JobsService, useValue: service }],
    }).compile();

    controller = module.get<JobsController>(JobsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate findAllPublished to service', async () => {
    service.findAllPublished.mockResolvedValue({ jobs: [], total: 0 });
    const res = await controller.findPublished({ search: 'developer' });
    expect(service.findAllPublished).toHaveBeenCalledWith({ search: 'developer' });
    expect(res).toEqual({ jobs: [], total: 0 });
  });

  it('should delegate findAll with CurrentUser to service', async () => {
    service.findAll.mockResolvedValue([]);
    await controller.findAll('active', mockUser, undefined);
    expect(service.findAll).toHaveBeenCalledWith('active', mockUser, undefined);
  });

  it('should delegate create with CurrentUser to service', async () => {
    const dto = { title: 'Backend Lead' };
    service.create.mockResolvedValue({ id: 'job-1', ...dto });
    const res = await controller.create(dto, mockUser);
    expect(service.create).toHaveBeenCalledWith(dto, mockUser);
    expect(res.id).toBe('job-1');
  });

  it('should delegate update with CurrentUser to service', async () => {
    const dto = { title: 'Updated' };
    service.update.mockResolvedValue({ id: 'job-1', ...dto });
    await controller.update('job-1', dto, mockUser);
    expect(service.update).toHaveBeenCalledWith('job-1', dto, mockUser);
  });

  it('should delegate publish to service', async () => {
    service.publishJob.mockResolvedValue({ id: 'job-1', status: 'published' });
    await controller.publish('job-1', mockUser);
    expect(service.publishJob).toHaveBeenCalledWith('job-1', mockUser);
  });

  it('should delegate close to service', async () => {
    service.closeJob.mockResolvedValue({ id: 'job-1', status: 'closed' });
    await controller.close('job-1', mockUser);
    expect(service.closeJob).toHaveBeenCalledWith('job-1', mockUser);
  });

  it('should delegate deleteJob to service', async () => {
    service.deleteJob.mockResolvedValue({ id: 'job-1' });
    await controller.deleteJob('job-1', mockUser);
    expect(service.deleteJob).toHaveBeenCalledWith('job-1', mockUser);
  });
});
