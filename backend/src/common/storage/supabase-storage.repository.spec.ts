import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseStorageRepository } from './supabase-storage.repository';

describe('SupabaseStorageRepository', () => {
  let repository: SupabaseStorageRepository;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return false for isStorageEnabled when env variables are missing', () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_SERVICE_KEY;

    repository = new SupabaseStorageRepository();
    expect(repository.isStorageEnabled()).toBe(false);
  });

  it('should initialize client when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are present', () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

    repository = new SupabaseStorageRepository();
    expect(repository.isStorageEnabled()).toBe(true);
  });
});
