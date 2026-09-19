import { PrismaClient, SkillCategory } from '@prisma/client'

const prisma = new PrismaClient()

const skillsByCategory: Record<SkillCategory, string[]> = {
  programming_languages: [
    'Python', 'Java', 'C', 'C++', 'C#', 'JavaScript', 'TypeScript',
    'PHP', 'Go', 'Rust', 'R', 'Kotlin', 'Swift',
  ],
  technical_skills: [
    'Machine Learning', 'Data Science', 'Artificial Intelligence',
    'Computer Vision', 'REST API', 'Cloud Computing', 'DevOps',
    'Microservices', 'Networking', 'Cyber Security', 'SQL', 'NoSQL',
    'Image Processing',
  ],
  frameworks_libraries: [
    'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Express',
    'FastAPI', 'Django', 'Spring Boot', 'TensorFlow', 'PyTorch',
    'Scikit-learn', 'LangChain', 'Flutter',
  ],
  tools_platforms: [
    'Git', 'GitHub', 'GitLab', 'Docker', 'Kubernetes', 'VS Code',
    'Jupyter Notebook', 'Postman', 'Figma', 'Power BI', 'Tableau',
    'AWS', 'Azure', 'Google Cloud',
  ],
  soft_skills: [
    'Leadership', 'Communication', 'Problem Solving',
    'Time Management', 'Critical Thinking', 'Teamwork',
    'Decision Making', 'Adaptability',
  ],
  languages: [
    'Tamil', 'English', 'Hindi', 'Malayalam', 'Telugu',
    'Kannada', 'French', 'German', 'Japanese',
  ],
}

async function main() {
  for (const [category, names] of Object.entries(skillsByCategory)) {
    for (const name of names) {
      await prisma.skill.upsert({
        where: { name_category: { name, category: category as SkillCategory } },
        update: {},
        create: { name, category: category as SkillCategory },
      })
    }
  }

  const total = Object.values(skillsByCategory).flat().length
  console.log(`Seeded ${total} skills across ${Object.keys(skillsByCategory).length} categories`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
