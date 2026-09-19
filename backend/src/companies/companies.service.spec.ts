import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

const mockPrismaService = {
  company: {
    findMany: jest.fn().mockResolvedValue([
      { id: 'comp-1', agencyName: 'Acme Corp', logo: null },
    ]),
    findUnique: jest.fn().mockResolvedValue({
      id: 'comp-1',
      agencyName: 'Acme Corp',
      logo: null,
      documents: [],
      teamMembers: [],
    }),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn().mockResolvedValue(1),
  },
  teamMember: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  auditLog: { create: jest.fn() },
  notification: { create: jest.fn() },
};

describe('CompaniesService', () => {
  let service: CompaniesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: MailService, useValue: { sendApprovalEmail: jest.fn(), sendRejectionEmail: jest.fn() } },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return default company logo placeholder SVG data URI when logo is null', async () => {
    const company = await service.findOne('comp-1');
    expect(company).toBeDefined();
    expect(company.defaultLogoUrl).toContain('data:image/svg+xml');
  });

  it('should complete company onboarding successfully', async () => {
    mockPrismaService.company.update.mockResolvedValue({
      id: 'comp-1',
      agencyName: 'Acme Agency',
      contactPerson: 'Jane Manager',
    });

    const result = await service.completeOnboarding('comp-1', {
      agencyName: 'Acme Agency',
      contactPerson: 'Jane Manager',
    });

    expect(result.message).toContain('onboarding completed');
    expect(result.company).toBeDefined();
  });
});
