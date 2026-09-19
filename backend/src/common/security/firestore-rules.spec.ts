import * as fs from 'fs';
import * as path from 'path';

describe('Firestore Security Rules Validation', () => {
  let rulesContent: string;

  beforeAll(() => {
    const rulesPath = path.resolve(__dirname, '../../../../firestore.rules');
    rulesContent = fs.readFileSync(rulesPath, 'utf8');
  });

  it('should exist and define rules_version = "2"', () => {
    expect(rulesContent).toBeDefined();
    expect(rulesContent).toContain("rules_version = '2'");
  });

  it('should restrict candidate collection read/write to owner, employer, or admin', () => {
    expect(rulesContent).toContain('match /candidates/{candidateId}');
    expect(rulesContent).toContain('allow read: if isOwner(candidateId) || isEmployer() || isAdminOrSuperAdmin()');
    expect(rulesContent).toContain('allow create, update: if isOwner(candidateId) || isAdminOrSuperAdmin()');
  });

  it('should restrict candidate_profiles collection access strictly to profile owner or employer', () => {
    expect(rulesContent).toContain('match /candidate_profiles/{userId}');
    expect(rulesContent).toContain('allow read: if isOwner(userId) || isEmployer() || isAdminOrSuperAdmin()');
    expect(rulesContent).toContain('allow create, update: if isOwner(userId)');
  });

  it('should restrict company updates to company members or admins', () => {
    expect(rulesContent).toContain('match /companies/{companyId}');
    expect(rulesContent).toContain('allow update: if isCompanyMember(companyId) || isAdminOrSuperAdmin()');
  });

  it('should enforce company admin role for managing team member subcollections', () => {
    expect(rulesContent).toContain('match /team_members/{memberId}');
    expect(rulesContent).toContain('allow write: if isCompanyAdmin(companyId)');
  });

  it('should enforce company admin role for company_memberships writes', () => {
    expect(rulesContent).toContain('match /company_memberships/{membershipId}');
    expect(rulesContent).toContain('allow create, update, delete: if isCompanyAdmin(request.resource.data.companyId) || isAdminOrSuperAdmin()');
  });
});
