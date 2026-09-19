"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    const adminExists = await prisma.user.findUnique({ where: { email: 'admin@thozhilkoodam.com' } });
    if (adminExists) {
        console.log('Seed data already exists. Skipping.');
        return;
    }
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const supportHash = await bcrypt.hash('Support@123', 10);
    const agencyHash = await bcrypt.hash('Test@123', 10);
    await prisma.user.createMany({
        data: [
            { name: 'Super Admin', email: 'admin@thozhilkoodam.com', passwordHash: adminHash, role: 'super_admin' },
            { name: 'Support Admin', email: 'support@thozhilkoodam.com', passwordHash: supportHash, role: 'support' },
        ],
    });
    const agencies = [
        { companyId: 'KIKTK000001', agencyName: 'ABC Recruitment Solutions', contactPerson: 'Rajesh Kumar', position: 'Managing Director', employeeCount: '51-200', vacancyCount: '45', registrationNumber: 'REG-2024-001', phone: '+91 9876543210', email: 'hr@abcrecruitment.com', passwordHash: agencyHash, status: 'approved', approvedBy: 'Super Admin', approvedDate: new Date(Date.now() - 7 * 86400000) },
        { companyId: 'KIKTK000002', agencyName: 'XYZ Talent Hunt', contactPerson: 'Priya Sharma', position: 'CEO', employeeCount: '11-50', vacancyCount: '25', registrationNumber: 'REG-2024-002', phone: '+91 9876543211', email: 'info@xyztalent.com', passwordHash: agencyHash, status: 'pending' },
        { companyId: 'KIKTK000003', agencyName: 'Global Staffing Inc', contactPerson: 'Amit Verma', position: 'Director', employeeCount: '201-500', vacancyCount: '120', registrationNumber: 'REG-2024-003', phone: '+91 9876543212', email: 'contact@globalstaffing.com', passwordHash: agencyHash, status: 'approved', approvedBy: 'Super Admin', approvedDate: new Date(Date.now() - 30 * 86400000) },
        { companyId: 'KIKTK000004', agencyName: 'Talent Bridge HR', contactPerson: 'Sneha Patel', position: 'HR Head', employeeCount: '1-10', vacancyCount: '15', registrationNumber: 'REG-2024-004', phone: '+91 9876543213', email: 'info@talentbridge.com', passwordHash: agencyHash, status: 'rejected', rejectionReason: 'Incomplete documentation.' },
        { companyId: 'KIKTK000005', agencyName: 'Premier Recruiters', contactPerson: 'Vikram Singh', position: 'Managing Partner', employeeCount: '51-200', vacancyCount: '60', registrationNumber: 'REG-2024-005', phone: '+91 9876543214', email: 'hr@premierrecruit.com', passwordHash: agencyHash, status: 'suspended' },
    ];
    for (const agency of agencies) {
        await prisma.company.create({ data: agency });
    }
    await prisma.notification.createMany({
        data: [
            { type: 'agency_registration', title: 'New Agency Registration', message: 'XYZ Talent Hunt has registered and is pending approval.', read: false, createdAt: new Date(Date.now() - 2 * 86400000) },
            { type: 'subscription', title: 'Subscription Expiring', message: 'ABC Recruitment Solutions subscription expires in 7 days.', read: false, createdAt: new Date(Date.now() - 1 * 86400000) },
            { type: 'payment', title: 'Payment Received', message: '₹41,300 payment received from Global Staffing Inc.', read: false, createdAt: new Date(Date.now() - 3 * 86400000) },
        ],
    });
    await prisma.auditLog.createMany({
        data: [
            { userName: 'Super Admin', action: 'Login', details: 'Admin logged in', ip: '192.168.1.1' },
            { userName: 'Super Admin', action: 'Approval', details: 'Approved ABC Recruitment Solutions' },
            { userName: 'Super Admin', action: 'Rejection', details: 'Rejected Talent Bridge HR - Incomplete documentation' },
        ],
    });
    console.log('Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map