import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { UnauthorizedException } from '@nestjs/common';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let service: ApplicationsService;

  const mockService = {
    findAllForEmployer: jest.fn(),
    findOneForEmployer: jest.fn(),
    updateStatusForEmployer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        { provide: ApplicationsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
    service = module.get<ApplicationsService>(ApplicationsService);
    jest.clearAllMocks();
  });

  it('should call findAllForEmployer with authenticated user id', async () => {
    mockService.findAllForEmployer.mockResolvedValue({ applications: [], total: 0 });
    const user = { id: 'comp-1' };

    const result = await controller.findAll(user, { status: 'applied' });

    expect(service.findAllForEmployer).toHaveBeenCalledWith('comp-1', { status: 'applied' });
    expect(result).toEqual({ applications: [], total: 0 });
  });

  it('should throw UnauthorizedException if user id is missing on findAll', async () => {
    await expect(controller.findAll(null as any, {})).rejects.toThrow(UnauthorizedException);
  });

  it('should call findOneForEmployer with id and company id', async () => {
    mockService.findOneForEmployer.mockResolvedValue({ id: 'app-1' });
    const user = { id: 'comp-1' };

    const result = await controller.findOne(user, 'app-1');

    expect(service.findOneForEmployer).toHaveBeenCalledWith('app-1', 'comp-1');
    expect(result).toEqual({ id: 'app-1' });
  });

  it('should call updateStatusForEmployer with status and notes', async () => {
    mockService.updateStatusForEmployer.mockResolvedValue({ success: true });
    const user = { id: 'comp-1' };

    const result = await controller.updateStatus(user, 'app-1', {
      status: 'shortlisted',
      notes: 'Good candidate',
    });

    expect(service.updateStatusForEmployer).toHaveBeenCalledWith(
      'app-1',
      'comp-1',
      'shortlisted',
      'Good candidate',
    );
    expect(result).toEqual({ success: true });
  });
});
