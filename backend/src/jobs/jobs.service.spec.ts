import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('JobsService', () => {
  let service: JobsService;
  let prisma: any;
  let mailService: any;

  const mockCompanyA = { id: 'comp-111', role: 'recruitment_agency', email: 'hr@compA.com' };
  const mockCompanyB = { id: 'comp-222', role: 'recruitment_agency', email: 'hr@compB.com' };
  const mockAdmin = { id: 'admin-1', role: 'super_admin', name: 'Super Admin' };

  const mockJobA = {
    id: 'job-1',
    companyId: 'comp-111',
    title: 'Senior Node Developer',
    status: 'draft',
    isPublished: false,
    salaryMin: 500000,
    salaryMax: 900000,
  };

  const mockJobB = {
    id: 'job-2',
    companyId: 'comp-222',
    title: 'Frontend React Lead',
    status: 'published',
    isPublished: true,
  };

  beforeEach(async () => {
    prisma = {
      job: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      subscription: {
        findFirst: jest.fn(),
      },
      notification: {
        create: jest.fn(),
      },
    };

    mailService = {
      sendJobApprovalEmail: jest.fn(),
      sendJobRejectionEmail: jest.fn(),
      sendJobChangesRequestedEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: PrismaService, useValue: prisma },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllPublished', () => {
    it('should only query published and active jobs for candidates', async () => {
      prisma.job.findMany.mockResolvedValue([mockJobB]);
      prisma.job.count.mockResolvedValue(1);

      const result = await service.findAllPublished({ search: 'React' });

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isPublished: true,
            status: 'published',
          }),
        })
      );
      expect(result.jobs).toHaveLength(1);
    });
  });

  describe('findAll (Employer Job List)', () => {
    it('should strictly isolate jobs by companyId for recruitment_agency role', async () => {
      prisma.job.findMany.mockResolvedValue([mockJobA]);

      await service.findAll('active', mockCompanyA);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: 'comp-111',
            status: { in: ['published', 'approved'] },
          }),
        })
      );
    });

    it('should allow admin to view all jobs or filter by optional companyId', async () => {
      prisma.job.findMany.mockResolvedValue([mockJobA, mockJobB]);

      await service.findAll(undefined, mockAdmin, 'comp-222');

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'comp-222' },
        })
      );
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if title is missing or too short', async () => {
      await expect(service.create({ title: '' }, mockCompanyA)).rejects.toThrow(BadRequestException);
      await expect(service.create({ title: 'a' }, mockCompanyA)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if salaryMin > salaryMax', async () => {
      await expect(
        service.create({ title: 'Valid Job', salaryMin: 100000, salaryMax: 50000 }, mockCompanyA)
      ).rejects.toThrow(BadRequestException);
    });

    it('should enforce companyId from authenticated user and create draft job', async () => {
      prisma.subscription.findFirst.mockResolvedValue(null);
      prisma.job.count.mockResolvedValue(0);
      prisma.job.create.mockImplementation((args: any) => Promise.resolve({ id: 'job-new', ...args.data }));

      const result = await service.create(
        { title: 'Full Stack Engineer', companyId: 'spoofed-id', skills: ['Node', 'React'] },
        mockCompanyA
      );

      expect(prisma.job.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Full Stack Engineer',
            companyId: 'comp-111',
            status: 'draft',
            isPublished: false,
            skills: JSON.stringify(['Node', 'React']),
          }),
        })
      );
      expect(result.companyId).toBe('comp-111');
    });

    it('should enforce free limit when creating directly published job without active subscription', async () => {
      prisma.subscription.findFirst.mockResolvedValue(null);
      prisma.job.count.mockResolvedValue(2);

      await expect(
        service.create({ title: 'Published Job', status: 'published' }, mockCompanyA)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if job does not exist', async () => {
      prisma.job.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', { title: 'New' }, mockCompanyA)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when Employer A tries to update Employer B job', async () => {
      prisma.job.findUnique.mockResolvedValue(mockJobB);

      await expect(service.update('job-2', { title: 'Hacked Title' }, mockCompanyA)).rejects.toThrow(ForbiddenException);
    });

    it('should allow owner to update their own job and ignore spoofed companyId', async () => {
      prisma.job.findUnique.mockResolvedValue(mockJobA);
      prisma.job.update.mockResolvedValue({ ...mockJobA, title: 'Updated Title' });

      const result = await service.update('job-1', { title: 'Updated Title', companyId: 'spoofed' }, mockCompanyA);

      expect(prisma.job.update).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        data: expect.not.objectContaining({ companyId: 'spoofed' }),
      });
      expect(result.title).toBe('Updated Title');
    });
  });

  describe('publishJob and closeJob lifecycle', () => {
    it('should allow company owner to publish their job', async () => {
      prisma.job.findUnique.mockResolvedValue(mockJobA);
      prisma.job.update.mockResolvedValue({ ...mockJobA, status: 'published', isPublished: true });

      const result = await service.publishJob('job-1', mockCompanyA);

      expect(prisma.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'job-1' },
          data: expect.objectContaining({ status: 'published', isPublished: true }),
        })
      );
      expect(result.status).toBe('published');
    });

    it('should prevent unauthorized company from publishing another company job', async () => {
      prisma.job.findUnique.mockResolvedValue(mockJobA);

      await expect(service.publishJob('job-1', mockCompanyB)).rejects.toThrow(ForbiddenException);
    });

    it('should allow company owner to close their own job and set isPublished to false', async () => {
      prisma.job.findUnique.mockResolvedValue(mockJobB);
      prisma.job.update.mockResolvedValue({ ...mockJobB, status: 'closed', isPublished: false });

      const result = await service.closeJob('job-2', mockCompanyB);

      expect(prisma.job.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'job-2' },
          data: expect.objectContaining({ status: 'closed', isPublished: false }),
        })
      );
      expect(result.status).toBe('closed');
      expect(result.isPublished).toBe(false);
    });

    it('should prevent unauthorized company from closing another company job', async () => {
      prisma.job.findUnique.mockResolvedValue(mockJobB);

      await expect(service.closeJob('job-2', mockCompanyA)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteJob', () => {
    it('should prevent deleting another company job', async () => {
      prisma.job.findUnique.mockResolvedValue(mockJobB);

      await expect(service.deleteJob('job-2', mockCompanyA)).rejects.toThrow(ForbiddenException);
    });

    it('should allow owner or admin to delete job', async () => {
      prisma.job.findUnique.mockResolvedValue(mockJobA);
      prisma.job.delete.mockResolvedValue(mockJobA);

      await service.deleteJob('job-1', mockCompanyA);

      expect(prisma.job.delete).toHaveBeenCalledWith({ where: { id: 'job-1' } });
    });
  });
});
