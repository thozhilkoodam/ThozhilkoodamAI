import { TeamRole } from '@prisma/client';

export class InviteTeamMemberDto {
  name: string;
  email: string;
  role: TeamRole;
}

export class UpdateTeamMemberDto {
  name?: string;
  role?: TeamRole;
  status?: string;
}
