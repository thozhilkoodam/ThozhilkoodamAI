import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const jobRoles = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', '.NET Developer', 'Java Developer',
  'Python Developer', 'AI Engineer', 'Machine Learning Engineer',
  'Data Scientist', 'Data Analyst', 'DevOps Engineer',
  'Cloud Engineer', 'UI/UX Designer', 'Mobile App Developer',
  'Android Developer', 'iOS Developer', 'QA Engineer',
  'Automation Tester', 'Manual Tester', 'Business Analyst',
  'Project Manager', 'HR Recruiter', 'HR Executive',
  'Digital Marketing Executive', 'Sales Executive', 'Accountant',
  'Electrical Engineer', 'Mechanical Engineer', 'Civil Engineer',
  'Production Engineer', 'Network Engineer', 'Cyber Security Analyst',
  'Technical Support Engineer',
]

const industries = [
  'Information Technology (IT)', 'Software Development',
  'Artificial Intelligence', 'Machine Learning', 'Banking',
  'Financial Services', 'Insurance', 'Healthcare', 'Pharmaceutical',
  'Education', 'E-Commerce', 'Retail', 'Manufacturing', 'Automobile',
  'Construction', 'Telecommunication', 'Logistics', 'Transportation',
  'Hospitality', 'Hotel Management', 'Food & Beverage', 'Agriculture',
  'Energy', 'Power', 'Oil & Gas', 'Electronics', 'Textile', 'Media',
  'Advertising', 'Real Estate', 'Government', 'Consulting', 'BPO',
  'KPO', 'FMCG', 'Biotechnology',
]

const locations = [
  'Coimbatore', 'Chennai', 'Madurai', 'Salem', 'Erode', 'Tiruppur',
  'Trichy', 'Thanjavur', 'Vellore', 'Bengaluru', 'Hyderabad', 'Pune',
  'Mumbai', 'Delhi', 'Noida', 'Gurgaon', 'Kolkata', 'Ahmedabad',
  'Kochi', 'Visakhapatnam', 'Remote', 'Work From Home',
  'Anywhere in India',
]

async function main() {
  for (const name of jobRoles) {
    await prisma.jobRole.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  console.log(`Seeded ${jobRoles.length} job roles`)

  for (const name of industries) {
    await prisma.industry.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  console.log(`Seeded ${industries.length} industries`)

  for (const name of locations) {
    await prisma.location.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }
  console.log(`Seeded ${locations.length} locations`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
