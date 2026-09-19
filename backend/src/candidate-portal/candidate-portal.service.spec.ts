import { Test, TestingModule } from '@nestjs/testing';
import { CandidatePortalService } from './candidate-portal.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  candidateProfile: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  candidateEducation: {
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'edu-1', ...args.data })),
  },
  candidateExperience: {
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'exp-1', ...args.data })),
  },
  candidateCertification: {
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'cert-1', ...args.data })),
  },
  candidateDocument: {
    findMany: jest.fn().mockResolvedValue([]),
  },
  candidateSkill: {
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    findFirst: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'skill-1', ...args.data })),
  },
  candidateJobRole: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  candidateIndustry: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  candidateLocation: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  candidateProfileSkill: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  user: {
    findUnique: jest.fn().mockResolvedValue({ id: 'user-1', name: 'John Doe', email: 'john@example.com', photo: null }),
  },
};

describe('CandidatePortalService', () => {
  let service: CandidatePortalService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidatePortalService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CandidatePortalService>(CandidatePortalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return default SVG avatar data URI when candidate profile photo is null', async () => {
    mockPrismaService.candidateProfile.findUnique.mockResolvedValue(null);
    const profile = await service.getProfile('user-1');
    expect(profile).toBeDefined();
    expect(profile.defaultAvatarUrl).toContain('data:image/svg+xml');
    expect(profile.defaultAvatarUrl).toContain('JD');
  });

  it('should calculate profile completion percentage accurately', async () => {
    mockPrismaService.candidateProfile.findUnique.mockResolvedValue({
      id: 'prof-1',
      userId: 'user-1',
      gender: 'Male',
      city: 'Chennai',
      preferredRole: 'Developer',
      jobRoles: [{ id: 1 }],
    });
    mockPrismaService.candidateEducation.count.mockResolvedValue(1);
    mockPrismaService.candidateExperience.count.mockResolvedValue(1);
    mockPrismaService.candidateSkill.count.mockResolvedValue(2);
    mockPrismaService.candidateCertification.count.mockResolvedValue(1);

    const completion = await service.getProfileCompletion('user-1');
    expect(completion.percentage).toBe(100);
    expect(completion.isComplete).toBe(true);
  });

  it('should complete candidate onboarding without requiring file uploads', async () => {
    mockPrismaService.candidateProfile.upsert.mockResolvedValue({
      id: 'prof-1',
      userId: 'user-1',
      gender: 'Female',
    });
    mockPrismaService.candidateProfile.findUnique.mockResolvedValue({
      id: 'prof-1',
      userId: 'user-1',
      gender: 'Female',
      jobRoles: [],
    });

    const result = await service.completeOnboarding('user-1', {
      gender: 'Female',
      city: 'Bengaluru',
      education: [{ qualification: 'B.Tech', degree: 'CSE', college: 'Anna University' }],
      skills: [{ name: 'JavaScript', type: 'technical' }],
    });

    expect(result.message).toContain('onboarding completed');
    expect(result.profile).toBeDefined();
  });
});
