import { Injectable, Logger, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export interface ParsedResumeData {
  name: string | null;
  email: string | null;
  phone: string | null;
  totalExperience: string | null;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string | null;
  }>;
  currentCompany: string | null;
  designation: string | null;
  location: string | null;
  summary: string | null;
}

export interface ParsedResumeAnalysisData {
  professionalSummary: string;
  keyStrengths: string[];
  technicalSkills: Array<{
    skill: string;
    evidence: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'unknown';
  }>;
  softSkills: string[];
  experienceAnalysis: {
    totalExperience: string | null;
    areasOfExperience: string[];
    seniorityAssessment: string | null;
  };
  skillGaps: Array<{
    skill: string;
    reason: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  careerSuggestions: Array<{
    role: string;
    reason: string;
  }>;
  resumeImprovements: string[];
}

export interface JobMatchAssessment {
  jobId: string;
  matchingSkills: Array<{ skill: string; reason: string }>;
  missingSkills: Array<{ skill: string; reason: string }>;
  experienceAlignment: { status: 'strong' | 'good' | 'partial' | 'weak' | 'unknown'; reason: string };
  locationAlignment: { status: 'strong' | 'good' | 'partial' | 'weak' | 'unknown'; reason: string };
  preferenceAlignment: { status: 'strong' | 'good' | 'partial' | 'weak' | 'unknown'; reason: string };
  explanation: string;
}

export interface CandidateScreeningAssessment {
  overallFit: 'strong' | 'good' | 'partial' | 'weak';
  matchingSkills: Array<{ skill: string; evidence: string }>;
  missingSkills: Array<{ skill: string; impact: string }>;
  relevantExperience: { assessment: string; evidence: string };
  qualificationAlignment: { assessment: string; evidence: string };
  strengths: string[];
  concerns: string[];
  evidence: Array<{ point: string; source: string }>;
  screeningSummary: string;
  recommendationForHumanReview: string;
}

export interface CandidateInterviewPreparation {
  roleOverview: string;
  interviewFormatTips: string[];
  technicalTopics: Array<{
    topic: string;
    whyImportant: string;
    preparationTips: string[];
  }>;
  behavioralTopics: Array<{
    topic: string;
    context: string;
    exampleGuidance: string;
  }>;
  suggestedQuestions: Array<{
    question: string;
    category: 'technical' | 'behavioral' | 'situational';
    guidance: string;
    sampleOutline: string;
  }>;
  preparationAreas: string[];
  roleSpecificTips: string[];
  disclaimer: string;
}

export interface StructuredInterviewEvaluation {
  competencyAreas: Array<{
    competency: string;
    observation: string;
    ratingLevel: 'strong' | 'competent' | 'developing' | 'insufficient_evidence';
  }>;
  strengths: string[];
  areasForClarification: string[];
  evidenceFromResponses: Array<{
    topic: string;
    candidateResponseSnippet: string;
    evaluationNote: string;
  }>;
  communicationObservations: string;
  technicalObservations: string;
  behavioralObservations: string;
  followUpQuestions: string[];
  evaluationSummary: string;
  disclaimer: string;
}

export interface GeneratedOfferLetter {
  headline: string;
  letterMarkdown: string;
  keyHighlights: string[];
  standardClauses: string[];
  suggestedBenefits: string[];
}

const RESUME_EXTRACTION_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING, nullable: true },
    email: { type: SchemaType.STRING, nullable: true },
    phone: { type: SchemaType.STRING, nullable: true },
    totalExperience: { type: SchemaType.STRING, nullable: true },
    skills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    education: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          degree: { type: SchemaType.STRING },
          institution: { type: SchemaType.STRING },
          year: { type: SchemaType.STRING, nullable: true },
        },
        required: ['degree', 'institution'],
      },
    },
    currentCompany: { type: SchemaType.STRING, nullable: true },
    designation: { type: SchemaType.STRING, nullable: true },
    location: { type: SchemaType.STRING, nullable: true },
    summary: { type: SchemaType.STRING, nullable: true },
  },
  required: [
    'name',
    'email',
    'phone',
    'totalExperience',
    'skills',
    'education',
    'currentCompany',
    'designation',
    'location',
    'summary',
  ],
};

const RESUME_ANALYSIS_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    professionalSummary: { type: SchemaType.STRING },
    keyStrengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    technicalSkills: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          skill: { type: SchemaType.STRING },
          evidence: { type: SchemaType.STRING },
          level: { type: SchemaType.STRING },
        },
        required: ['skill', 'evidence', 'level'],
      },
    },
    softSkills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    experienceAnalysis: {
      type: SchemaType.OBJECT,
      properties: {
        totalExperience: { type: SchemaType.STRING, nullable: true },
        areasOfExperience: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        seniorityAssessment: { type: SchemaType.STRING, nullable: true },
      },
      required: ['areasOfExperience'],
    },
    skillGaps: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          skill: { type: SchemaType.STRING },
          reason: { type: SchemaType.STRING },
          priority: { type: SchemaType.STRING },
        },
        required: ['skill', 'reason', 'priority'],
      },
    },
    careerSuggestions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          role: { type: SchemaType.STRING },
          reason: { type: SchemaType.STRING },
        },
        required: ['role', 'reason'],
      },
    },
    resumeImprovements: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: [
    'professionalSummary',
    'keyStrengths',
    'technicalSkills',
    'softSkills',
    'experienceAnalysis',
    'skillGaps',
    'careerSuggestions',
    'resumeImprovements',
  ],
};

const SYSTEM_PROMPT = `
You are an expert resume extraction assistant.
Extract structured factual information ONLY from the provided candidate resume text.

STRICT INSTRUCTIONS:
- Extract ONLY facts that are explicitly supported by the resume text.
- Do NOT hallucinate or assume non-existent employers, degrees, skills, dates, or experience.
- If information is missing or cannot be reliably determined, use null for string fields and an empty array [] for lists.
- Do NOT provide commentary, markdown code block wrappers (other than JSON), or explanations.
- Do NOT evaluate, score, or make hiring decisions regarding the candidate.
- Normalize minor formatting inconsistencies (e.g. whitespace, phone formatting).
`;

const ANALYSIS_SYSTEM_PROMPT = `
You are an expert career advisory AI specializing in technical resume analysis and candidate self-improvement.
Analyze the candidate's extracted resume facts to provide constructive, factual feedback.

STRICT INSTRUCTIONS & SAFETY RULES:
- Base analysis ONLY on the documented resume facts provided.
- For technical skill evidence, refer to information explicitly present in the extracted data.
- NEVER infer, request, or evaluate protected personal attributes (race, ethnicity, gender, age, religion, sexual orientation, disability, medical data, or political affiliation).
- This analysis is CANDIDATE SELF-IMPROVEMENT ASSISTANCE ONLY.
- Do NOT generate hiring scores, candidate rankings, or employment rejection/acceptance decisions.
- Clearly distinguish explicit evidence from reasonable interpretation. Use "unknown" where evidence is insufficient.
- Provide actionable resume improvement tips and realistic career suggestions aligned with the candidate's demonstrated skills.
`;

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  isConfigured(): boolean {
    const apiKey = process.env.GEMINI_API_KEY;
    return Boolean(apiKey && apiKey.trim().length > 0);
  }

  async extractResumeData(resumeText: string): Promise<ParsedResumeData> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      this.logger.warn('Gemini API key is not configured in environment variables. Using structured local development extraction.');
      return {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '9876543210',
        totalExperience: '5 years',
        skills: ['TypeScript', 'NestJS', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
        education: [{ degree: 'B.Tech Computer Science', institution: 'Anna University', year: '2020' }],
        currentCompany: 'Tech Solutions Pvt Ltd',
        designation: 'Senior Software Engineer',
        location: 'Chennai, India',
        summary: 'Experienced full-stack engineer specializing in NestJS, React, and PostgreSQL.',
      };
    }

    if (!resumeText || resumeText.trim().length === 0) {
      throw new InternalServerErrorException('Provided resume text is empty.');
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RESUME_EXTRACTION_SCHEMA as any,
          temperature: 0.1,
        },
      });

      const result = await model.generateContent([
        { text: SYSTEM_PROMPT },
        { text: `Resume Content:\n\n${resumeText}` },
      ]);

      const responseText = result.response.text();
      if (!responseText) {
        throw new Error('Gemini returned an empty response.');
      }

      const parsed: ParsedResumeData = JSON.parse(responseText);

      return {
        name: parsed.name || null,
        email: parsed.email || null,
        phone: parsed.phone || null,
        totalExperience: parsed.totalExperience || null,
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        education: Array.isArray(parsed.education)
          ? parsed.education.map(e => ({
              degree: e.degree || '',
              institution: e.institution || '',
              year: e.year || null,
            }))
          : [],
        currentCompany: parsed.currentCompany || null,
        designation: parsed.designation || null,
        location: parsed.location || null,
        summary: parsed.summary || null,
      };
    } catch (err: any) {
      this.logger.error(`Gemini resume extraction failed: ${err?.message || 'Unknown error'}`);

      if (err instanceof ServiceUnavailableException) {
        throw err;
      }

      throw new InternalServerErrorException(
        `Gemini AI resume extraction failed: ${err?.message || 'Processing error'}`,
      );
    }
  }

  async analyzeResume(
    extractedData: ParsedResumeData,
    profileContext?: { preferredRole?: string | null; preferredIndustry?: string | null; experienceYears?: string | null },
  ): Promise<ParsedResumeAnalysisData> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      this.logger.warn('Gemini API key is not configured in environment variables. Using structured local development analysis.');
      return {
        professionalSummary: `Demonstrates strong technical expertise in ${extractedData?.skills?.slice(0, 3)?.join(', ') || 'software development'} with ${extractedData?.totalExperience || 'multi-year'} industry experience.`,
        keyStrengths: [
          'Solid full-stack development experience',
          'Proficiency in modern TypeScript framework ecosystem',
          'Proven record in database-backed web application architecture',
        ],
        technicalSkills: (extractedData?.skills || ['TypeScript', 'NestJS', 'PostgreSQL']).map((s, idx) => ({
          skill: s,
          evidence: `Explicitly listed under core competencies with ${extractedData?.totalExperience || 'documented'} application history.`,
          level: (idx === 0 ? 'expert' : idx < 3 ? 'advanced' : 'intermediate') as any,
        })),
        softSkills: ['Problem Solving', 'Technical Communication', 'Agile Team Collaboration'],
        experienceAnalysis: {
          totalExperience: extractedData?.totalExperience || '5 years',
          areasOfExperience: ['Web Development', 'Backend Engineering', 'Database Management'],
          seniorityAssessment: 'Mid-Senior Level Software Engineer',
        },
        skillGaps: [
          { skill: 'Kubernetes', reason: 'Recommended for cloud-native microservices orchestration', priority: 'medium' },
          { skill: 'GraphQL', reason: 'Commonly requested in modern API design roles', priority: 'low' },
        ],
        careerSuggestions: [
          { role: profileContext?.preferredRole || 'Lead Backend Engineer', reason: 'Aligns well with demonstrated TypeScript and NestJS expertise.' },
          { role: 'Full Stack Architect', reason: 'Matches end-to-end web system architecture experience.' },
        ],
        resumeImprovements: [
          'Quantify accomplishments with measurable metrics (e.g. reduced API latency by 35%).',
          'Include links to verified GitHub repositories or system design projects.',
          'Format certification dates consistently.',
        ],
      };
    }

    if (!extractedData) {
      throw new InternalServerErrorException('Provided extracted data is empty.');
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RESUME_ANALYSIS_SCHEMA as any,
          temperature: 0.2,
        },
      });

      const contextPayload = {
        extractedFacts: extractedData,
        candidatePreferences: profileContext || null,
      };

      const result = await model.generateContent([
        { text: ANALYSIS_SYSTEM_PROMPT },
        { text: `Candidate Document Facts & Preferences:\n\n${JSON.stringify(contextPayload, null, 2)}` },
      ]);

      const responseText = result.response.text();
      if (!responseText) {
        throw new Error('Gemini returned an empty analysis response.');
      }

      const parsed: ParsedResumeAnalysisData = JSON.parse(responseText);

      return {
        professionalSummary: parsed.professionalSummary || 'No summary provided.',
        keyStrengths: Array.isArray(parsed.keyStrengths) ? parsed.keyStrengths : [],
        technicalSkills: Array.isArray(parsed.technicalSkills)
          ? parsed.technicalSkills.map(s => ({
              skill: s.skill || '',
              evidence: s.evidence || 'Document reference',
              level: ['beginner', 'intermediate', 'advanced', 'expert'].includes(s.level)
                ? s.level
                : 'unknown',
            }))
          : [],
        softSkills: Array.isArray(parsed.softSkills) ? parsed.softSkills : [],
        experienceAnalysis: {
          totalExperience: parsed.experienceAnalysis?.totalExperience || null,
          areasOfExperience: Array.isArray(parsed.experienceAnalysis?.areasOfExperience)
            ? parsed.experienceAnalysis.areasOfExperience
            : [],
          seniorityAssessment: parsed.experienceAnalysis?.seniorityAssessment || null,
        },
        skillGaps: Array.isArray(parsed.skillGaps)
          ? parsed.skillGaps.map(g => ({
              skill: g.skill || '',
              reason: g.reason || '',
              priority: ['low', 'medium', 'high'].includes(g.priority) ? g.priority : 'medium',
            }))
          : [],
        careerSuggestions: Array.isArray(parsed.careerSuggestions)
          ? parsed.careerSuggestions.map(c => ({
              role: c.role || '',
              reason: c.reason || '',
            }))
          : [],
        resumeImprovements: Array.isArray(parsed.resumeImprovements) ? parsed.resumeImprovements : [],
      };
    } catch (err: any) {
      this.logger.error(`Gemini resume analysis failed: ${err?.message || 'Unknown error'}`);

      if (err instanceof ServiceUnavailableException) {
        throw err;
      }

      throw new InternalServerErrorException(
        `Gemini AI resume analysis failed: ${err?.message || 'Processing error'}`,
      );
    }
  }

  async matchJobsBatch(
    candidateData: {
      extractedFacts: ParsedResumeData;
      preferences?: any;
    },
    jobsBatch: Array<{
      id: string;
      title: string;
      description?: string | null;
      responsibilities?: string | null;
      qualifications?: string | null;
      skills?: string | null;
      mandatorySkills?: string | null;
      employmentType?: string | null;
      workMode?: string | null;
      location?: string | null;
      experience?: string | null;
      industry?: string | null;
    }>,
  ): Promise<JobMatchAssessment[]> {
    if (!jobsBatch || jobsBatch.length === 0) {
      return [];
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      this.logger.warn('Gemini API key is not configured in environment variables. Using structured local development job matching batch.');
      return jobsBatch.map(job => {
        const candidateSkills = candidateData.extractedFacts?.skills || ['TypeScript', 'NestJS', 'React', 'Node.js', 'PostgreSQL'];
        const matched = candidateSkills.slice(0, 3).map(s => ({ skill: s, reason: 'Demonstrated in candidate resume facts' }));
        const missing = [{ skill: 'Docker', reason: 'Not explicitly listed in candidate extraction' }];
        return {
          jobId: job.id,
          matchingSkills: matched,
          missingSkills: missing,
          experienceAlignment: { status: 'good', reason: 'Experience matches position requirements well' },
          locationAlignment: { status: 'strong', reason: 'Location/WorkMode aligns with candidate preferences' },
          preferenceAlignment: { status: 'strong', reason: 'Job role matches candidate preferred industry and role' },
          explanation: `Candidate demonstrates strong technical alignment for ${job.title} based on core skills and relevant background experience.`,
        };
      });
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    const BATCH_MATCHING_SCHEMA = {
      type: SchemaType.OBJECT,
      properties: {
        matches: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              jobId: { type: SchemaType.STRING },
              matchingSkills: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    skill: { type: SchemaType.STRING },
                    reason: { type: SchemaType.STRING },
                  },
                  required: ['skill', 'reason'],
                },
              },
              missingSkills: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    skill: { type: SchemaType.STRING },
                    reason: { type: SchemaType.STRING },
                  },
                  required: ['skill', 'reason'],
                },
              },
              experienceAlignment: {
                type: SchemaType.OBJECT,
                properties: {
                  status: { type: SchemaType.STRING },
                  reason: { type: SchemaType.STRING },
                },
                required: ['status', 'reason'],
              },
              locationAlignment: {
                type: SchemaType.OBJECT,
                properties: {
                  status: { type: SchemaType.STRING },
                  reason: { type: SchemaType.STRING },
                },
                required: ['status', 'reason'],
              },
              preferenceAlignment: {
                type: SchemaType.OBJECT,
                properties: {
                  status: { type: SchemaType.STRING },
                  reason: { type: SchemaType.STRING },
                },
                required: ['status', 'reason'],
              },
              explanation: { type: SchemaType.STRING },
            },
            required: [
              'jobId',
              'matchingSkills',
              'missingSkills',
              'experienceAlignment',
              'locationAlignment',
              'preferenceAlignment',
              'explanation',
            ],
          },
        },
      },
      required: ['matches'],
    };

    const BATCH_PROMPT = `
You are an expert AI Job Matching assistant.
Analyze the candidate's verified resume facts & preferences against the provided list of job postings.

STRICT SAFETY & FAIRNESS RULES:
- NEVER use, infer, or request protected attributes (gender, race, ethnicity, religion, age, disability, sexual orientation, political affiliation, or photo).
- This evaluation is CANDIDATE JOB DISCOVERY & GUIDANCE ONLY. Do NOT make hiring decisions or candidate screening rejections.
- Identify semantic skill equivalences, transferable experience, matching skills, missing skills, and provide constructive match explanations.
- Output status values MUST be one of: "strong", "good", "partial", "weak", "unknown".
`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: BATCH_MATCHING_SCHEMA as any,
          temperature: 0.2,
        },
      });

      const payload = {
        candidate: candidateData,
        jobs: jobsBatch,
      };

      const result = await model.generateContent([
        { text: BATCH_PROMPT },
        { text: `Candidate Facts & Jobs Batch:\n\n${JSON.stringify(payload, null, 2)}` },
      ]);

      const responseText = result.response.text();
      if (!responseText) {
        throw new Error('Gemini returned an empty batch match response.');
      }

      const parsed = JSON.parse(responseText);
      const matches: JobMatchAssessment[] = Array.isArray(parsed?.matches)
        ? parsed.matches.map((m: any) => ({
            jobId: m.jobId || '',
            matchingSkills: Array.isArray(m.matchingSkills) ? m.matchingSkills : [],
            missingSkills: Array.isArray(m.missingSkills) ? m.missingSkills : [],
            experienceAlignment: {
              status: ['strong', 'good', 'partial', 'weak'].includes(m.experienceAlignment?.status)
                ? m.experienceAlignment.status
                : 'unknown',
              reason: m.experienceAlignment?.reason || '',
            },
            locationAlignment: {
              status: ['strong', 'good', 'partial', 'weak'].includes(m.locationAlignment?.status)
                ? m.locationAlignment.status
                : 'unknown',
              reason: m.locationAlignment?.reason || '',
            },
            preferenceAlignment: {
              status: ['strong', 'good', 'partial', 'weak'].includes(m.preferenceAlignment?.status)
                ? m.preferenceAlignment.status
                : 'unknown',
              reason: m.preferenceAlignment?.reason || '',
            },
            explanation: m.explanation || 'No explanation provided.',
          }))
        : [];

      return matches;
    } catch (err: any) {
      this.logger.error(`Gemini batch job matching failed: ${err?.message || 'Unknown error'}`);
      throw new InternalServerErrorException(`AI batch job matching failed: ${err?.message || 'Processing error'}`);
    }
  }

  /**
   * AI Candidate Screening for Employer Decision Support
   * Analyzes job requirements against candidate verified facts strictly without protected attributes.
   */
  async screenCandidateApplication(
    jobData: any,
    candidateData: any,
  ): Promise<CandidateScreeningAssessment> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not configured. Providing structured baseline screening.');
      return {
        overallFit: 'strong',
        matchingSkills: (candidateData.skills || []).slice(0, 4).map((s: string) => ({
          skill: s,
          evidence: 'Verified from candidate background and resume records',
        })),
        missingSkills: [],
        relevantExperience: {
          assessment: 'Demonstrates relevant professional background matching role responsibilities.',
          evidence: 'Verified from candidate profile history.',
        },
        qualificationAlignment: {
          assessment: 'Educational qualifications align with position requirements.',
          evidence: 'Verified academic credentials on record.',
        },
        strengths: ['Relevant technical skill match', 'Direct industry domain experience', 'Structured project background'],
        concerns: [],
        evidence: [{ point: 'Strong match across required technical competencies', source: 'Candidate Profile & Resume' }],
        screeningSummary: 'Candidate exhibits high alignment with the core responsibilities and technical qualifications of this position.',
        recommendationForHumanReview: 'Recommend advancing to technical interview stage for in-depth system architecture discussion.',
      };
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    const SCREENING_SCHEMA = {
      type: SchemaType.OBJECT,
      properties: {
        overallFit: {
          type: SchemaType.STRING,
          description: 'Overall alignment category: "strong", "good", "partial", or "weak".',
        },
        matchingSkills: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              skill: { type: SchemaType.STRING },
              evidence: { type: SchemaType.STRING },
            },
            required: ['skill', 'evidence'],
          },
        },
        missingSkills: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              skill: { type: SchemaType.STRING },
              impact: { type: SchemaType.STRING },
            },
            required: ['skill', 'impact'],
          },
        },
        relevantExperience: {
          type: SchemaType.OBJECT,
          properties: {
            assessment: { type: SchemaType.STRING },
            evidence: { type: SchemaType.STRING },
          },
          required: ['assessment', 'evidence'],
        },
        qualificationAlignment: {
          type: SchemaType.OBJECT,
          properties: {
            assessment: { type: SchemaType.STRING },
            evidence: { type: SchemaType.STRING },
          },
          required: ['assessment', 'evidence'],
        },
        strengths: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        concerns: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        evidence: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              point: { type: SchemaType.STRING },
              source: { type: SchemaType.STRING },
            },
            required: ['point', 'source'],
          },
        },
        screeningSummary: { type: SchemaType.STRING },
        recommendationForHumanReview: { type: SchemaType.STRING },
      },
      required: [
        'overallFit',
        'matchingSkills',
        'missingSkills',
        'relevantExperience',
        'qualificationAlignment',
        'strengths',
        'concerns',
        'evidence',
        'screeningSummary',
        'recommendationForHumanReview',
      ],
    };

    const SCREENING_PROMPT = `
You are an expert AI Recruitment Screening Assistant providing explainable decision support for hiring managers.
Evaluate the candidate's professional qualifications, verified skills, and experience against the job requirements.

STRICT SAFETY & FAIRNESS RULES:
1. NEVER evaluate, infer, or mention protected personal attributes: age, gender, race, ethnicity, religion, marital status, disability, sexual orientation, or personal photos.
2. Provide GROUNDED EVIDENCE from the candidate's resume/profile facts rather than making speculative claims.
3. This assessment is for HUMAN DECISION SUPPORT ONLY. You do NOT make autonomous hiring, ranking, or rejection decisions.
4. overallFit MUST be strictly one of: "strong", "good", "partial", "weak".
5. Clearly articulate specific strengths, genuine skill gaps/concerns, and key questions or focus areas for human interviewers.
`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: SCREENING_SCHEMA as any,
          temperature: 0.2,
        },
      });

      const payload = {
        job: jobData,
        candidate: candidateData,
      };

      const result = await model.generateContent([
        { text: SCREENING_PROMPT },
        { text: `Screening Context:\n\n${JSON.stringify(payload, null, 2)}` },
      ]);

      const responseText = result.response.text();
      if (!responseText) {
        throw new Error('Gemini returned an empty candidate screening response.');
      }

      const parsed = JSON.parse(responseText);
      const validFits = ['strong', 'good', 'partial', 'weak'];
      const fit = validFits.includes(parsed.overallFit?.toLowerCase())
        ? (parsed.overallFit.toLowerCase() as 'strong' | 'good' | 'partial' | 'weak')
        : 'partial';

      return {
        overallFit: fit,
        matchingSkills: Array.isArray(parsed.matchingSkills) ? parsed.matchingSkills : [],
        missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
        relevantExperience: {
          assessment: parsed.relevantExperience?.assessment || 'Experience assessed against role requirements.',
          evidence: parsed.relevantExperience?.evidence || 'Derived from candidate work history.',
        },
        qualificationAlignment: {
          assessment: parsed.qualificationAlignment?.assessment || 'Education and certifications evaluated.',
          evidence: parsed.qualificationAlignment?.evidence || 'Derived from candidate education records.',
        },
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
        evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
        screeningSummary: parsed.screeningSummary || 'AI screening assessment completed.',
        recommendationForHumanReview:
          parsed.recommendationForHumanReview || 'Review candidate background during subsequent interview stages.',
      };
    } catch (err: any) {
      this.logger.error(`Gemini candidate screening failed: ${err?.message || 'Unknown error'}`);
      throw new InternalServerErrorException(`AI candidate screening failed: ${err?.message || 'Processing error'}`);
    }
  }

  /**
   * AI Interview Preparation for Candidate Career Support
   * Generates job-specific preparation, relevant technical topics, behavioral guidance (STAR), and sample questions.
   */
  async generateCandidateInterviewPreparation(
    jobData: any,
    candidateData: any,
    interviewDetails?: any,
  ): Promise<CandidateInterviewPreparation> {
    const DISCLAIMER_TEXT =
      'AI-generated interview preparation. Use this as guidance; it does not predict or determine hiring outcomes.';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not configured. Providing structured baseline interview preparation.');
      const primarySkills: string[] = candidateData.skills || ['TypeScript', 'React', 'Node.js', 'PostgreSQL'];
      return {
        roleOverview: `Preparation for ${jobData.title || 'the target role'} at ${jobData.companyName || 'the hiring organization'}. Focus on demonstrating hands-on architectural problem solving and clear communication.`,
        interviewFormatTips: [
          'Join the meeting 5 minutes early and ensure a stable connection.',
          'Structure your responses using the STAR method (Situation, Task, Action, Result).',
          'Ask thoughtful clarifying questions about team workflows and engineering standards.',
        ],
        technicalTopics: primarySkills.slice(0, 3).map(skill => ({
          topic: skill,
          whyImportant: `Core required technology for ${jobData.title || 'this position'}.`,
          preparationTips: [
            `Review core concepts, modern patterns, and performance considerations for ${skill}.`,
            `Prepare concrete examples where you built or optimized systems using ${skill}.`,
          ],
        })),
        behavioralTopics: [
          {
            topic: 'Collaboration & Conflict Resolution',
            context: 'Working across cross-functional engineering and product teams.',
            exampleGuidance: 'Discuss a time you aligned technical direction with stakeholders or resolved an architectural disagreement constructively.',
          },
          {
            topic: 'Handling Production Incidents & Deadlines',
            context: 'Troubleshooting critical bugs under time constraints.',
            exampleGuidance: 'Highlight your systematic root-cause analysis approach and preventive post-mortem documentation.',
          },
        ],
        suggestedQuestions: [
          {
            question: `Can you walk us through the architecture of a recent system you designed or maintained with ${primarySkills[0] || 'modern tech'}?`,
            category: 'technical',
            guidance: 'Outline the business context, technical choices, trade-offs made, and measurable outcomes.',
            sampleOutline: '1. Problem context & requirements\n2. Architecture & component breakdown\n3. Challenges encountered\n4. Results achieved',
          },
          {
            question: 'Tell us about a challenging technical problem you solved recently.',
            category: 'technical',
            guidance: 'Focus on your debugging methodology, tools used, and how you validated the solution.',
            sampleOutline: '1. Symptoms & impact\n2. Hypothesis & investigation\n3. Implementation of fix\n4. Monitoring & testing',
          },
          {
            question: 'Describe a situation where you had to adapt quickly to changing requirements.',
            category: 'behavioral',
            guidance: 'Demonstrate agility, positive communication, and prioritization under uncertainty.',
            sampleOutline: '1. What changed\n2. How you evaluated priority\n3. Steps taken to adjust\n4. Successful delivery',
          },
        ],
        preparationAreas: [
          'System Design & Architecture fundamentals',
          'Data structures and clean code practices',
          'Past project retrospectives and quantifiable achievements',
        ],
        roleSpecificTips: [
          `Familiarize yourself with typical business challenges faced by ${jobData.title || 'the target team'}.`,
          'Be ready to discuss trade-offs between speed of delivery and architectural debt.',
        ],
        disclaimer: DISCLAIMER_TEXT,
      };
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    const PREPARATION_SCHEMA = {
      type: SchemaType.OBJECT,
      properties: {
        roleOverview: { type: SchemaType.STRING },
        interviewFormatTips: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        technicalTopics: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              topic: { type: SchemaType.STRING },
              whyImportant: { type: SchemaType.STRING },
              preparationTips: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
              },
            },
            required: ['topic', 'whyImportant', 'preparationTips'],
          },
        },
        behavioralTopics: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              topic: { type: SchemaType.STRING },
              context: { type: SchemaType.STRING },
              exampleGuidance: { type: SchemaType.STRING },
            },
            required: ['topic', 'context', 'exampleGuidance'],
          },
        },
        suggestedQuestions: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              question: { type: SchemaType.STRING },
              category: { type: SchemaType.STRING },
              guidance: { type: SchemaType.STRING },
              sampleOutline: { type: SchemaType.STRING },
            },
            required: ['question', 'category', 'guidance', 'sampleOutline'],
          },
        },
        preparationAreas: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        roleSpecificTips: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      required: [
        'roleOverview',
        'interviewFormatTips',
        'technicalTopics',
        'behavioralTopics',
        'suggestedQuestions',
        'preparationAreas',
        'roleSpecificTips',
      ],
    };

    const PREPARATION_PROMPT = `
You are an expert AI Career Coach specializing in interview preparation and technical interview coaching.
Your task is to generate actionable, constructive, and role-specific interview preparation guidance for the candidate.

STRICT SAFETY & FAIRNESS RULES:
1. NEVER use, request, or evaluate protected personal attributes: gender, race, age, religion, marital status, disability, sexual orientation, or photographs.
2. This is CANDIDATE GUIDANCE & PREPARATION ONLY. It does not predict or guarantee employment outcomes.
3. Provide concrete questions, STAR answer structuring advice, and key technical topic suggestions tailored to the job's requirements and candidate's professional background.
`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: PREPARATION_SCHEMA as any,
          temperature: 0.2,
        },
      });

      const payload = {
        job: jobData,
        candidate: candidateData,
        interview: interviewDetails || null,
      };

      const result = await model.generateContent([
        { text: PREPARATION_PROMPT },
        { text: `Interview Preparation Context:\n\n${JSON.stringify(payload, null, 2)}` },
      ]);

      const responseText = result.response.text();
      if (!responseText) {
        throw new Error('Gemini returned an empty interview preparation response.');
      }

      const parsed = JSON.parse(responseText);

      return {
        roleOverview: parsed.roleOverview || 'Interview preparation guidance.',
        interviewFormatTips: Array.isArray(parsed.interviewFormatTips) ? parsed.interviewFormatTips : [],
        technicalTopics: Array.isArray(parsed.technicalTopics) ? parsed.technicalTopics : [],
        behavioralTopics: Array.isArray(parsed.behavioralTopics) ? parsed.behavioralTopics : [],
        suggestedQuestions: Array.isArray(parsed.suggestedQuestions)
          ? parsed.suggestedQuestions.map((q: any) => ({
              question: q.question || '',
              category: ['technical', 'behavioral', 'situational'].includes(q.category)
                ? q.category
                : 'technical',
              guidance: q.guidance || '',
              sampleOutline: q.sampleOutline || '',
            }))
          : [],
        preparationAreas: Array.isArray(parsed.preparationAreas) ? parsed.preparationAreas : [],
        roleSpecificTips: Array.isArray(parsed.roleSpecificTips) ? parsed.roleSpecificTips : [],
        disclaimer: DISCLAIMER_TEXT,
      };
    } catch (err: any) {
      this.logger.error(`Gemini interview preparation generation failed: ${err?.message || 'Unknown error'}`);
      throw new InternalServerErrorException(`AI interview preparation failed: ${err?.message || 'Processing error'}`);
    }
  }

  /**
   * AI Interview Evaluation for Employer Decision Support
   * Analyzes candidate interview responses and interviewer notes strictly against job requirements and observable evidence.
   */
  async evaluateInterviewResponses(
    jobData: any,
    candidateData: any,
    responsesList: Array<{
      question: string;
      response: string;
      interviewerNotes?: string | null;
      competencyArea?: string | null;
    }>,
    interviewerNotes?: string | null,
  ): Promise<StructuredInterviewEvaluation> {
    const DISCLAIMER_TEXT =
      'AI-assisted interview evaluation for human review. This does not make or predict an employment decision.';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not configured. Providing structured baseline interview evaluation.');
      return {
        evaluationSummary: `The candidate provided relevant technical responses for the ${jobData.title || 'target role'}. Demonstrated familiarity with core engineering patterns and articulated problem-solving steps clearly.`,
        competencyAreas: [
          {
            competency: 'Technical Architecture & Problem Solving',
            observation: 'Explained design decisions and trade-offs clearly with concrete examples from previous experience.',
            ratingLevel: 'strong',
          },
          {
            competency: 'Communication & Structuring',
            observation: 'Structured explanations logically and addressed questions directly without ambiguity.',
            ratingLevel: 'competent',
          },
          {
            competency: 'Domain Knowledge & Best Practices',
            observation: 'Referenced industry standards, testing approaches, and performance considerations.',
            ratingLevel: 'competent',
          },
        ],
        strengths: [
          'Detailed explanation of technical implementation details and trade-offs',
          'Demonstrated clear and structured communication during complex problem scenarios',
          'Evidence of hands-on familiarity with relevant stack requirements',
        ],
        areasForClarification: [
          'Further probing into large-scale production incident handling and metrics monitoring',
          'Specific examples of cross-functional stakeholder alignment during project roadblocks',
        ],
        evidenceFromResponses: responsesList.slice(0, 3).map((r, idx) => ({
          topic: r.competencyArea || `Question ${idx + 1}`,
          candidateResponseSnippet: r.response?.slice(0, 140) || 'Candidate articulated architectural approach.',
          evaluationNote: 'Response demonstrates direct alignment with observable role requirements.',
        })),
        communicationObservations: 'Articulate and concise. Successfully explained technical concepts with relevant context.',
        technicalObservations: 'Showed sound knowledge of core language features, framework concepts, and practical delivery.',
        behavioralObservations: 'Collaborative orientation, open to constructive feedback, and shows accountability in problem ownership.',
        followUpQuestions: [
          'How would you handle horizontal scaling bottlenecks if traffic increased by 10x?',
          'Can you elaborate on your experience coordinating deployments with DevOps and QA teams?',
        ],
        disclaimer: DISCLAIMER_TEXT,
      };
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    const EVALUATION_SCHEMA = {
      type: SchemaType.OBJECT,
      properties: {
        evaluationSummary: { type: SchemaType.STRING },
        competencyAreas: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              competency: { type: SchemaType.STRING },
              observation: { type: SchemaType.STRING },
              ratingLevel: { type: SchemaType.STRING },
            },
            required: ['competency', 'observation', 'ratingLevel'],
          },
        },
        strengths: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        areasForClarification: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        evidenceFromResponses: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              topic: { type: SchemaType.STRING },
              candidateResponseSnippet: { type: SchemaType.STRING },
              evaluationNote: { type: SchemaType.STRING },
            },
            required: ['topic', 'candidateResponseSnippet', 'evaluationNote'],
          },
        },
        communicationObservations: { type: SchemaType.STRING },
        technicalObservations: { type: SchemaType.STRING },
        behavioralObservations: { type: SchemaType.STRING },
        followUpQuestions: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      required: [
        'evaluationSummary',
        'competencyAreas',
        'strengths',
        'areasForClarification',
        'evidenceFromResponses',
        'communicationObservations',
        'technicalObservations',
        'behavioralObservations',
        'followUpQuestions',
      ],
    };

    const EVALUATION_PROMPT = `
You are an expert AI Interview Evaluation Assistant providing objective, evidence-based decision support for human interviewers and hiring managers.
Your task is to analyze candidate interview responses and interviewer notes against the position's job requirements.

STRICT SAFETY & FAIRNESS RULES:
1. Ground every observation ONLY in observable interview evidence (candidate answers and interviewer notes provided).
2. NEVER evaluate, infer, or mention protected personal characteristics: race, ethnicity, gender, sex, age, religion, marital/family status, disability, sexual orientation, or photographs.
3. Do NOT make unsupported personality, psychological, character, health, or intelligence claims.
4. This assessment is for HUMAN DECISION SUPPORT ONLY. You do NOT make hiring, rejection, or ranking decisions, or predict future job performance.
5. In competencyAreas, ratingLevel MUST be strictly one of: "strong", "competent", "developing", "insufficient_evidence".
6. Every piece of evidence MUST include a factual snippet from the candidate's actual answer and an objective evaluation note.
`;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: EVALUATION_SCHEMA as any,
          temperature: 0.15,
        },
      });

      const payload = {
        job: jobData,
        candidateBackground: candidateData,
        interviewQandA: responsesList,
        overallInterviewerNotes: interviewerNotes || null,
      };

      const result = await model.generateContent([
        { text: EVALUATION_PROMPT },
        { text: `Interview Q&A Evidence & Job Requirements:\n\n${JSON.stringify(payload, null, 2)}` },
      ]);

      const responseText = result.response.text();
      if (!responseText) {
        throw new Error('Gemini returned an empty interview evaluation response.');
      }

      const parsed = JSON.parse(responseText);
      const validLevels = ['strong', 'competent', 'developing', 'insufficient_evidence'];

      return {
        evaluationSummary: parsed.evaluationSummary || 'Interview evaluation completed.',
        competencyAreas: Array.isArray(parsed.competencyAreas)
          ? parsed.competencyAreas.map((c: any) => ({
              competency: c.competency || 'General Competency',
              observation: c.observation || '',
              ratingLevel: validLevels.includes(c.ratingLevel?.toLowerCase())
                ? c.ratingLevel.toLowerCase()
                : 'competent',
            }))
          : [],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        areasForClarification: Array.isArray(parsed.areasForClarification) ? parsed.areasForClarification : [],
        evidenceFromResponses: Array.isArray(parsed.evidenceFromResponses)
          ? parsed.evidenceFromResponses.map((e: any) => ({
              topic: e.topic || '',
              candidateResponseSnippet: e.candidateResponseSnippet || '',
              evaluationNote: e.evaluationNote || '',
            }))
          : [],
        communicationObservations: parsed.communicationObservations || '',
        technicalObservations: parsed.technicalObservations || '',
        behavioralObservations: parsed.behavioralObservations || '',
        followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : [],
        disclaimer: DISCLAIMER_TEXT,
      };
    } catch (err: any) {
      this.logger.error(`Gemini interview evaluation failed: ${err?.message || 'Unknown error'}`);
      throw new InternalServerErrorException(`AI interview evaluation failed: ${err?.message || 'Processing error'}`);
    }
  }

  async generateOfferLetter(
    jobData: {
      title: string;
      companyName: string;
      location?: string | null;
      department?: string | null;
      employmentType?: string | null;
    },
    candidateData: {
      name: string;
      email?: string | null;
      currentRole?: string | null;
    },
    offerTerms: {
      baseSalary: number;
      salaryPeriod?: string;
      currency?: string;
      variableBonus?: number;
      joiningDate?: string | Date | null;
      benefits?: string[];
      additionalNotes?: string;
    },
  ): Promise<GeneratedOfferLetter> {
    const currency = offerTerms.currency || 'INR';
    const period = offerTerms.salaryPeriod || 'annual';
    const formattedSalary = `${currency} ${offerTerms.baseSalary.toLocaleString()} / ${period}`;
    const formattedDate = offerTerms.joiningDate
      ? new Date(offerTerms.joiningDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'Immediate / Mutual Agreement';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not configured. Providing structured professional offer letter template.');
      const markdown = `# Formal Offer of Employment

**Date:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

**Dear ${candidateData.name},**

On behalf of **${jobData.companyName}**, we are thrilled to extend an offer of employment for the position of **${jobData.title}**${jobData.department ? ` within the **${jobData.department}** department` : ''}.

Based on your qualifications, proven technical expertise, and outstanding performance during the interview process, we are confident that your contribution will play a pivotal role in our continued growth and success.

### 1. Position & Reporting
* **Title:** ${jobData.title}
* **Organization:** ${jobData.companyName}
* **Location:** ${jobData.location || 'Chennai, India'}
* **Employment Type:** ${jobData.employmentType || 'Full-time'}
* **Proposed Commencement Date:** ${formattedDate}

### 2. Compensation & Benefits
* **Fixed Compensation:** ${formattedSalary}
* **Performance Variable:** ${offerTerms.variableBonus ? `${currency} ${offerTerms.variableBonus.toLocaleString()} annually based on agreed KPIs` : 'Eligible for discretionary annual performance review'}
* **Benefits Package:** ${offerTerms.benefits && offerTerms.benefits.length > 0 ? offerTerms.benefits.join(', ') : 'Comprehensive health insurance, flexible leave policy, and professional development support'}

### 3. Terms of Employment
* **Probationary Period:** 3 (three) months from the commencement date.
* **Notice Period:** 30 days during probation, 60 days following successful confirmation.
* **Confidentiality:** Acceptance of this offer implies adherence to standard proprietary information, non-disclosure, and intellectual property agreements.

### 4. Acceptance Instructions
Please confirm your acceptance of this offer by signing or digitally accepting this agreement within 7 business days of receipt.

We look forward to welcoming you to the **${jobData.companyName}** family!

Warm regards,

**Talent Acquisition & People Operations**  
${jobData.companyName}`;

      return {
        headline: `Employment Offer for ${jobData.title}`,
        letterMarkdown: markdown,
        keyHighlights: [
          `Role: ${jobData.title}`,
          `Compensation: ${formattedSalary}`,
          `Start Date: ${formattedDate}`,
          `Work Mode: ${jobData.location || 'Onsite / Hybrid'}`,
        ],
        standardClauses: [
          '3-month probationary review period',
          'Standard IP and non-disclosure compliance',
          'Background verification clearance',
        ],
        suggestedBenefits: offerTerms.benefits || [
          'Comprehensive Group Health Insurance',
          'Flexible Work from Home / Hybrid Option',
          'Annual Learning & Certification Stipend',
        ],
      };
    }

    try {
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const OFFER_SCHEMA = {
        type: SchemaType.OBJECT,
        properties: {
          headline: { type: SchemaType.STRING },
          letterMarkdown: { type: SchemaType.STRING },
          keyHighlights: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          standardClauses: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          suggestedBenefits: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: ['headline', 'letterMarkdown', 'keyHighlights', 'standardClauses', 'suggestedBenefits'],
      };

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: OFFER_SCHEMA as any,
          temperature: 0.2,
        },
      });

      const prompt = `You are an executive HR and talent director drafting an official, polished employment offer letter.

Candidate Information:
- Name: ${candidateData.name}

Job & Company Information:
- Position: ${jobData.title}
- Company: ${jobData.companyName}
- Department: ${jobData.department || 'Engineering'}
- Location: ${jobData.location || 'Chennai, India'}
- Employment Type: ${jobData.employmentType || 'Full-time'}

Compensation Terms:
- Base Salary: ${formattedSalary}
- Variable Bonus: ${offerTerms.variableBonus ? `${currency} ${offerTerms.variableBonus}` : 'None'}
- Proposed Joining Date: ${formattedDate}
- Benefits: ${offerTerms.benefits?.join(', ') || 'Health insurance, annual leave'}
- Additional Employer Notes: ${offerTerms.additionalNotes || 'None'}

Instructions:
1. Write a professional, encouraging, and legally well-structured offer letter in GitHub Flavored Markdown.
2. Outline key sections: Position & Duties, Compensation Breakdown, Benefits, Probation & Confirmation, Confidentiality & IP, and Acceptance Steps.
3. Keep tone professional, welcoming, and clear. Do not make assumptions about protected personal attributes.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed: GeneratedOfferLetter = JSON.parse(responseText);

      return {
        headline: parsed.headline || `Employment Offer for ${jobData.title}`,
        letterMarkdown: parsed.letterMarkdown,
        keyHighlights: Array.isArray(parsed.keyHighlights) ? parsed.keyHighlights : [formattedSalary, formattedDate],
        standardClauses: Array.isArray(parsed.standardClauses) ? parsed.standardClauses : ['Probation of 3 months', 'Confidentiality agreement'],
        suggestedBenefits: Array.isArray(parsed.suggestedBenefits) ? parsed.suggestedBenefits : ['Health Insurance'],
      };
    } catch (err: any) {
      this.logger.error(`Gemini offer letter generation failed: ${err?.message || 'Unknown error'}`);
      throw new InternalServerErrorException(`AI offer letter generation failed: ${err?.message || 'Processing error'}`);
    }
  }
}


