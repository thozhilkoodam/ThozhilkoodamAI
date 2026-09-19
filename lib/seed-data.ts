import { db, type DBCompany } from './db'

export async function seedAdminUser() {
  const existing = await db.users.getAll()
  if (existing.length > 0) return

  await db.users.create({
    name: 'Super Admin',
    email: 'admin@thozhilkoodam.com',
    password: 'Admin@123',
    role: 'super_admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  })

  await db.users.create({
    name: 'Support Admin',
    email: 'support@thozhilkoodam.com',
    password: 'Support@123',
    role: 'support',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  })
}

export async function seedTestAgencies() {
  const existing = await db.companies.getAll()
  if (existing.length > 0) return

  const agencies: Array<Omit<DBCompany, 'id'>> = [
    {
      companyId: 'KIKTK000001',
      agencyName: 'ABC Recruitment Solutions',
      contactPerson: 'Rajesh Kumar',
      position: 'Managing Director',
      employeeCount: '51-200',
      vacancyCount: '45',
      registrationNumber: 'REG-2024-001',
      phone: '+91 9876543210',
      email: 'hr@abcrecruitment.com',
      password: 'Test@123',
      category: 'recruitment-agencies',
      status: 'approved',
      approvedBy: 'Super Admin',
      approvedDate: new Date(Date.now() - 7 * 86400000).toISOString(),
      logo: '',
      documentUrl: '',
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      companyId: 'KIKTK000002',
      agencyName: 'XYZ Talent Hunt',
      contactPerson: 'Priya Sharma',
      position: 'CEO',
      employeeCount: '11-50',
      vacancyCount: '25',
      registrationNumber: 'REG-2024-002',
      phone: '+91 9876543211',
      email: 'info@xyztalent.com',
      password: 'Test@123',
      category: 'recruitment-agencies',
      status: 'pending',
      logo: '',
      documentUrl: '',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      companyId: 'KIKTK000003',
      agencyName: 'Global Staffing Inc',
      contactPerson: 'Amit Verma',
      position: 'Director',
      employeeCount: '201-500',
      vacancyCount: '120',
      registrationNumber: 'REG-2024-003',
      phone: '+91 9876543212',
      email: 'contact@globalstaffing.com',
      password: 'Test@123',
      category: 'recruitment-agencies',
      status: 'approved',
      approvedBy: 'Super Admin',
      approvedDate: new Date(Date.now() - 30 * 86400000).toISOString(),
      logo: '',
      documentUrl: '',
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
    {
      companyId: 'KIKTK000004',
      agencyName: 'Talent Bridge HR',
      contactPerson: 'Sneha Patel',
      position: 'HR Head',
      employeeCount: '1-10',
      vacancyCount: '15',
      registrationNumber: 'REG-2024-004',
      phone: '+91 9876543213',
      email: 'info@talentbridge.com',
      password: 'Test@123',
      category: 'recruitment-agencies',
      status: 'rejected',
      rejectionReason: 'Incomplete documentation. Please submit valid business registration certificate.',
      logo: '',
      documentUrl: '',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      companyId: 'KIKTK000005',
      agencyName: 'Premier Recruiters',
      contactPerson: 'Vikram Singh',
      position: 'Managing Partner',
      employeeCount: '51-200',
      vacancyCount: '60',
      registrationNumber: 'REG-2024-005',
      phone: '+91 9876543214',
      email: 'hr@premierrecruit.com',
      password: 'Test@123',
      category: 'recruitment-agencies',
      status: 'suspended',
      logo: '',
      documentUrl: '',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
  ]

  for (const agency of agencies) {
    await db.companies.create(agency)
  }
}

export async function seedNotifications() {
  const existing = await db.notifications.getAll()
  if (existing.length > 0) return

  await db.notifications.seed()
}

export async function seedAuditLogs() {
  const existing = await db.auditLogs.getAll()
  if (existing.length > 0) return

  await db.auditLogs.seed()
}

export async function seedAll() {
  if (typeof window === 'undefined') return
  await seedAdminUser()
  await seedTestAgencies()
  await seedNotifications()
  await seedAuditLogs()
}
