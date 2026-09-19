import { Test, TestingModule } from '@nestjs/testing';
import { ScreeningController } from './screening.controller';
import { ScreeningService } from './screening.service';
import { UnauthorizedException } from '@nestjs/common';

describe('ScreeningController', () => {
  let controller: ScreeningController;
  let service: ScreeningService;

  const mockService = {
    screenApplication: jest.fn(),
    getScreening: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScreeningController],
      providers: [
        { provide: ScreeningService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<ScreeningController>(ScreeningController);
    service = module.get<ScreeningService>(ScreeningService);
    jest.clearAllMocks();
  });

  it('should call screenApplication with user company ID', async () => {
    mockService.screenApplication.mockResolvedValue({ success: true });
    const user = { id: 'company-1' };

    const result = await controller.screenApplication(user, 'app-1', 'true');

    expect(service.screenApplication).toHaveBeenCalledWith('app-1', 'company-1', true);
    expect(result).toEqual({ success: true });
  });

  it('should throw UnauthorizedException if user context is missing', async () => {
    await expect(
      controller.screenApplication(null, 'app-1'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should call getScreening with user company ID', async () => {
    mockService.getScreening.mockResolvedValue({ success: true, exists: true });
    const user = { id: 'company-1' };

    const result = await controller.getScreening(user, 'app-1');

    expect(service.getScreening).toHaveBeenCalledWith('app-1', 'company-1');
    expect(result).toEqual({ success: true, exists: true });
  });
});
