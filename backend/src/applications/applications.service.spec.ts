import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService, VALID_APPLICATION_STATUSES } from './applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let prisma: PrismaService;

  const mockPrisma = {
    job: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    candidateApplication: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    candidateNotification: {
      create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('findAllForEmployer', () => {
    it('should return empty list if company has no jobs', async () => {
      mockPrisma.job.findMany.mockResolvedValue([]);

      const result = await service.findAllForEmployer('comp-1');

      expect(result.applications).toEqual([]);
      expect(result.total).toBe(0);
      expect(mockPrisma.candidateApplication.findMany).not.toHaveBeenCalled();
    });

    it('should return applications for company jobs', async () => {
      mockPrisma.job.findMany.mockResolvedValue([
        { id: 'job-1', title: 'React Developer', department: 'Engineering' },
        { id: 'job-2', title: 'Node Developer', department: 'Engineering' },
      ]);

      const mockApplications = [
        {
          id: 'app-1',
          jobId: 'job-1',
          company: 'ABC Corp',
          position: 'React Developer',
          appliedAt: new Date(),
          stage: 'applied',
          status: 'applied',
          resumeUrl: 'https://example.com/resume.pdf',
          coverNote: 'Hello',
          user: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+91 9999999999',
            photo: null,
            candidateProfile: {
              experienceYears: 4,
              designation: 'Senior Developer',
              city: 'Chennai',
              state: 'Tamil Nadu',
              skills: [{ skill: { name: 'React' } }, { skill: { name: 'TypeScript' } }],
            },
          },
        },
      ];

      mockPrisma.candidateApplication.findMany.mockResolvedValue(mockApplications);
      mockPrisma.candidateApplication.count.mockResolvedValue(1);

      const result = await service.findAllForEmployer('comp-1');

      expect(result.applications.length).toBe(1);
      expect(result.applications[0].id).toBe('app-1');
      expect(result.applications[0].jobTitle).toBe('React Developer');
      expect(result.applications[0].candidate.name).toBe('John Doe');
      expect(result.applications[0].candidate.skills).toEqual(['React', 'TypeScript']);
      expect(result.total).toBe(1);
    });

    it('should throw ForbiddenException if employer attempts to filter by a job they do not own', async () => {
      mockPrisma.job.findMany.mockResolvedValue([
        { id: 'job-1', title: 'React Developer' },
      ]);

      await expect(
        service.findAllForEmployer('comp-1', { jobId: 'unowned-job-999' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should filter by status and search term', async () => {
      mockPrisma.job.findMany.mockResolvedValue([{ id: 'job-1', title: 'React Developer' }]);
      mockPrisma.candidateApplication.findMany.mockResolvedValue([]);
      mockPrisma.candidateApplication.count.mockResolvedValue(0);

      await service.findAllForEmployer('comp-1', {
        status: 'shortlisted',
        search: 'John',
        page: 2,
        limit: 10,
      });

      expect(mockPrisma.candidateApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            jobId: { in: ['job-1'] },
            status: 'shortlisted',
            OR: expect.any(Array),
          }),
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findOneForEmployer', () => {
    it('should return application detail if job belongs to company', async () => {
      mockPrisma.candidateApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        jobId: 'job-1',
        stage: 'applied',
        status: 'applied',
        appliedAt: new Date(),
        resumeUrl: 'https://example.com/resume.pdf',
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+91 9999999999',
          candidateProfile: { bio: 'Developer' },
          candidateEducation: [],
          candidateExperience: [],
          candidateSkills: [],
          candidateCertifications: [],
        },
      });

      mockPrisma.job.findUnique.mockResolvedValue({
        id: 'job-1',
        companyId: 'comp-1',
        title: 'React Developer',
        department: 'Engineering',
      });

      const result = await service.findOneForEmployer('app-1', 'comp-1');

      expect(result.id).toBe('app-1');
      expect(result.candidate.name).toBe('John Doe');
      expect(result.job.title).toBe('React Developer');
    });

    it('should throw NotFoundException if application does not exist', async () => {
      mockPrisma.candidateApplication.findUnique.mockResolvedValue(null);

      await expect(service.findOneForEmployer('non-existent', 'comp-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if job belongs to another company', async () => {
      mockPrisma.candidateApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        jobId: 'job-belonging-to-comp-2',
        user: { id: 'user-1' },
      });

      mockPrisma.job.findUnique.mockResolvedValue({
        id: 'job-belonging-to-comp-2',
        companyId: 'comp-2',
        title: 'Confidential Role',
      });

      await expect(service.findOneForEmployer('app-1', 'comp-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateStatusForEmployer', () => {
    it('should update status and stage when authorized', async () => {
      mockPrisma.candidateApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        jobId: 'job-1',
        userId: 'user-1',
        position: 'React Developer',
        company: 'ABC Corp',
      });

      mockPrisma.job.findUnique.mockResolvedValue({
        id: 'job-1',
        companyId: 'comp-1',
      });

      mockPrisma.candidateApplication.update.mockResolvedValue({
        id: 'app-1',
        status: 'shortlisted',
        stage: 'shortlisted',
      });

      const result = await service.updateStatusForEmployer('app-1', 'comp-1', 'shortlisted');

      expect(result.success).toBe(true);
      expect(mockPrisma.candidateApplication.update).toHaveBeenCalledWith({
        where: { id: 'app-1' },
        data: { status: 'shortlisted', stage: 'shortlisted' },
      });
      expect(mockPrisma.candidateNotification.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid status', async () => {
      await expect(
        service.updateStatusForEmployer('app-1', 'comp-1', 'invalid_status_xyz'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if trying to update an application of another company', async () => {
      mockPrisma.candidateApplication.findUnique.mockResolvedValue({
        id: 'app-1',
        jobId: 'job-2',
      });

      mockPrisma.job.findUnique.mockResolvedValue({
        id: 'job-2',
        companyId: 'comp-2',
      });

      await expect(
        service.updateStatusForEmployer('app-1', 'comp-1', 'rejected'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
