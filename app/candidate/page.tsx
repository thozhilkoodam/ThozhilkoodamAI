'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  User, Mail, Phone, MapPin, Calendar, GraduationCap, Briefcase, Wrench,
  Globe, Linkedin, Github, FileText, Edit, Loader2, BookOpen,
  Building2, Award, Download, ExternalLink, Star, Camera
} from 'lucide-react'
import { api } from '@/lib/api'
import { getNoticePeriodLabel } from '@/lib/notice-period'

type ProfileData = {
  user: { id: string; name: string; email: string; phone: string; photo?: string }
  photo?: string
  profilePhoto?: string
  gender?: string; dob?: string; nationality?: string
  address?: string; state?: string; district?: string; city?: string; pincode?: string
  linkedin?: string; github?: string; portfolio?: string; portfolioUrl?: string
  currentCompany?: string; designation?: string; experienceYears?: string
  noticePeriod?: string; employmentType?: string; resumeUrl?: string
  jobRoles?: { jobRole: { id: number; name: string } }[]
  industries?: { industry: { id: number; name: string } }[]
  locations?: { location: { id: number; name: string } }[]
  skills?: { skill: { id: number; name: string; category: string }; level?: string }[]
  certificates?: { id: string; fileName: string; fileUrl: string }[]
  education?: {
    id: string; qualification?: string; degree?: string; specialization?: string
    college?: string; university?: string; passingYear?: string
    percentage?: string; gradingType?: string; modeOfStudy?: string
    educationStatus?: string; currentSemester?: string; backlogs?: string
  }[]
  experience?: {
    id: string; company?: string; role?: string; duration?: string
    startDate?: string; endDate?: string; description?: string
  }[]
  certifications?: {
    id: string; name?: string; issuer?: string; fileUrl?: string; url?: string; status?: string
  }[]
  documents?: {
    id: string; name: string; type: string; url: string; size?: string
  }[]
}

export default function CandidateDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ProfileData | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const data = await api.portal.profile.get()
        setProfile(data)
      } catch {
        console.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const groupSkills = (skills: ProfileData['skills']) => {
    const groups: Record<string, { id: number; name: string; category: string; level?: string }[]> = {}
    for (const s of skills || []) {
      const cat = s.skill.category.replace(/_/g, ' ')
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(s.skill)
    }
    return groups
  }

  const profilePhotoUrl = profile?.profilePhoto || profile?.photo || profile?.user?.photo

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500">Could not load profile data.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  const u = profile.user
  const skillsByCategory = groupSkills(profile.skills)

  const resumeDoc = profile.documents?.find(d => d.type === 'resume')
  const photoIdDoc = profile.documents?.find(d => d.type === 'photo_id' || d.type === 'photo')
  const certDocs = profile.documents?.filter(d => d.type === 'certificate')
  const portfolioDoc = profile.documents?.find(d => d.type === 'portfolio')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {profilePhotoUrl ? (
            <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-purple-200 shrink-0">
              <Image src={profilePhotoUrl} alt={u.name || ''} fill className="object-cover" />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
              <Camera className="h-6 w-6 text-purple-500" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {u.name || 'Candidate'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Your profile overview</p>
          </div>
        </div>
        <Link href="/candidate/profile">
          <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
            <Edit className="h-4 w-4" /> Edit Profile
          </Button>
        </Link>
      </div>

      {/* Basic Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5 text-purple-500" /> Basic Information</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div><p className="text-xs text-gray-500">Full Name</p><p className="font-medium text-gray-900 dark:text-white">{u.name}</p></div>
            <div><p className="text-xs text-gray-500">Email</p><p className="font-medium text-gray-900 dark:text-white">{u.email}</p></div>
            <div><p className="text-xs text-gray-500">Phone</p><p className="font-medium text-gray-900 dark:text-white">{u.phone}</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Details */}
      {(profile.gender || profile.dob || profile.nationality || profile.address) && (
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-purple-500" /> Personal Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.gender && <div><p className="text-xs text-gray-500">Gender</p><p className="font-medium text-gray-900 dark:text-white">{profile.gender}</p></div>}
              {profile.dob && <div><p className="text-xs text-gray-500">Date of Birth</p><p className="font-medium text-gray-900 dark:text-white">{new Date(profile.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>}
              {profile.nationality && <div><p className="text-xs text-gray-500">Nationality</p><p className="font-medium text-gray-900 dark:text-white">{profile.nationality}</p></div>}
              {profile.address && <div className="sm:col-span-2 lg:col-span-3"><p className="text-xs text-gray-500">Address</p><p className="font-medium text-gray-900 dark:text-white">{profile.address}{profile.city ? `, ${profile.city}` : ''}{profile.district ? `, ${profile.district}` : ''}{profile.state ? `, ${profile.state}` : ''}</p></div>}
              {profile.pincode && <div><p className="text-xs text-gray-500">Pincode</p><p className="font-medium text-gray-900 dark:text-white">{profile.pincode}</p></div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {profile.education && profile.education.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><GraduationCap className="h-5 w-5 text-purple-500" /> Education</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {profile.education.map((edu, i) => (
              <div key={edu.id || i}>
                {i > 0 && <Separator className="mb-4" />}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {edu.qualification && <div><p className="text-xs text-gray-500">Qualification</p><p className="font-medium text-gray-900 dark:text-white">{edu.qualification}</p></div>}
                  {edu.degree && <div><p className="text-xs text-gray-500">Degree</p><p className="font-medium text-gray-900 dark:text-white">{edu.degree}</p></div>}
                  {edu.specialization && <div><p className="text-xs text-gray-500">Specialization</p><p className="font-medium text-gray-900 dark:text-white">{edu.specialization}</p></div>}
                  {edu.college && <div><p className="text-xs text-gray-500">College</p><p className="font-medium text-gray-900 dark:text-white">{edu.college}</p></div>}
                  {edu.university && <div><p className="text-xs text-gray-500">University</p><p className="font-medium text-gray-900 dark:text-white">{edu.university}</p></div>}
                  {edu.passingYear && <div><p className="text-xs text-gray-500">Passing Year</p><p className="font-medium text-gray-900 dark:text-white">{edu.passingYear}</p></div>}
                  {edu.percentage && <div><p className="text-xs text-gray-500">{edu.gradingType || 'Percentage'}</p><p className="font-medium text-gray-900 dark:text-white">{edu.percentage}</p></div>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Experience */}
      {(profile.currentCompany || (profile.experience && profile.experience.length > 0)) && (
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Briefcase className="h-5 w-5 text-purple-500" /> Experience</CardTitle></CardHeader>
          <CardContent>
            {profile.experience && profile.experience.length > 0 ? (
              <div className="space-y-4">
                {profile.experience.map((exp, i) => (
                  <div key={exp.id || i}>
                    {i > 0 && <Separator className="mb-4" />}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {exp.company && <div><p className="text-xs text-gray-500">Company</p><p className="font-medium text-gray-900 dark:text-white">{exp.company}</p></div>}
                      {exp.role && <div><p className="text-xs text-gray-500">Designation</p><p className="font-medium text-gray-900 dark:text-white">{exp.role}</p></div>}
                      {exp.duration && <div><p className="text-xs text-gray-500">Duration</p><p className="font-medium text-gray-900 dark:text-white">{exp.duration}</p></div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {profile.currentCompany && <div><p className="text-xs text-gray-500">Company</p><p className="font-medium text-gray-900 dark:text-white">{profile.currentCompany}</p></div>}
                {profile.designation && <div><p className="text-xs text-gray-500">Designation</p><p className="font-medium text-gray-900 dark:text-white">{profile.designation}</p></div>}
                {profile.experienceYears && <div><p className="text-xs text-gray-500">Years of Experience</p><p className="font-medium text-gray-900 dark:text-white">{profile.experienceYears}</p></div>}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {Object.keys(skillsByCategory).length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Wrench className="h-5 w-5 text-purple-500" /> Skills</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(skillsByCategory).map(([category, skills]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map(s => (
                    <Badge key={s.id} className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-0">
                      {s.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Job Preferences */}
      {(profile.jobRoles && profile.jobRoles.length > 0) ||
       (profile.industries && profile.industries.length > 0) ||
       (profile.locations && profile.locations.length > 0) ||
       profile.noticePeriod ? (
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Star className="h-5 w-5 text-purple-500" /> Job Preferences</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.jobRoles && profile.jobRoles.length > 0 && (
                <div><p className="text-xs text-gray-500">Preferred Job Roles</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.jobRoles.map(jr => (
                      <Badge key={jr.jobRole.id} variant="outline" className="text-xs border-purple-200 text-purple-600">{jr.jobRole.name}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.industries && profile.industries.length > 0 && (
                <div><p className="text-xs text-gray-500">Preferred Industries</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.industries.map(ind => (
                      <Badge key={ind.industry.id} variant="outline" className="text-xs border-blue-200 text-blue-600">{ind.industry.name}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.locations && profile.locations.length > 0 && (
                <div><p className="text-xs text-gray-500">Preferred Locations</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.locations.map(loc => (
                      <Badge key={loc.location.id} variant="outline" className="text-xs border-green-200 text-green-600">{loc.location.name}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.noticePeriod && <div><p className="text-xs text-gray-500">Notice Period</p><p className="font-medium text-gray-900 dark:text-white">{getNoticePeriodLabel(profile.noticePeriod)}</p></div>}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Documents & Links */}
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-purple-500" /> Documents &amp; Links</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Resume from profile field */}
            {profile.resumeUrl && !resumeDoc && (
              <div>
                <p className="text-xs text-gray-500">Resume</p>
                <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-purple-600 hover:underline mt-1">
                  <FileText className="h-4 w-4" /> View Resume
                </a>
              </div>
            )}
            {/* Resume from documents table */}
            {resumeDoc && (
              <div>
                <p className="text-xs text-gray-500">Resume</p>
                <a href={resumeDoc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-purple-600 hover:underline mt-1">
                  <FileText className="h-4 w-4" /> {resumeDoc.name}
                </a>
              </div>
            )}

            {/* Certificates from profile certificates */}
            {profile.certificates && profile.certificates.length > 0 && (
              <div>
                <p className="text-xs text-gray-500">Certificates</p>
                <div className="flex flex-col gap-1 mt-1">
                  {profile.certificates.map(cert => (
                    <a key={cert.id} href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-purple-600 hover:underline">
                      <Download className="h-3 w-3" /> {cert.fileName}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {/* Certificates from documents table */}
            {certDocs && certDocs.length > 0 && (
              <div>
                <p className="text-xs text-gray-500">Certificates</p>
                <div className="flex flex-col gap-1 mt-1">
                  {certDocs.map(doc => (
                    <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-purple-600 hover:underline">
                      <Download className="h-3 w-3" /> {doc.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {profile.certifications && profile.certifications.length > 0 && (
              <div>
                <p className="text-xs text-gray-500">Certifications</p>
                <div className="flex flex-col gap-1 mt-1">
                  {profile.certifications.map(cert => (
                    <div key={cert.id} className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                      <Award className="h-3 w-3 text-amber-500" /> {cert.name}
                      {cert.fileUrl && <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline ml-1"><Download className="h-3 w-3 inline" /></a>}
                      {cert.url && <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline ml-1"><ExternalLink className="h-3 w-3 inline" /></a>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio from profile field */}
            {(profile.portfolioUrl || portfolioDoc) && (
              <div>
                <p className="text-xs text-gray-500">Portfolio</p>
                <a href={portfolioDoc?.url || profile.portfolioUrl || ''} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-purple-600 hover:underline mt-1">
                  <Globe className="h-4 w-4" /> View Portfolio
                </a>
              </div>
            )}

            {/* Photo ID from documents */}
            {photoIdDoc && (
              <div>
                <p className="text-xs text-gray-500">Photo ID</p>
                <a href={photoIdDoc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-purple-600 hover:underline mt-1">
                  <Download className="h-4 w-4" /> {photoIdDoc.name}
                </a>
              </div>
            )}

            {/* Documents from documents table - other types */}
            {profile.documents && profile.documents
              .filter(d => !['resume', 'certificate', 'portfolio', 'photo_id', 'photo'].includes(d.type))
              .map(doc => (
                <div key={doc.id}>
                  <p className="text-xs text-gray-500 capitalize">{doc.type}</p>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-purple-600 hover:underline mt-1">
                    <Download className="h-4 w-4" /> {doc.name}
                  </a>
                </div>
              ))}

            {profile.linkedin && (
              <div>
                <p className="text-xs text-gray-500">LinkedIn</p>
                <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline mt-1">
                  <Linkedin className="h-4 w-4" /> {profile.linkedin.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              </div>
            )}
            {profile.github && (
              <div>
                <p className="text-xs text-gray-500">GitHub</p>
                <a href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:underline mt-1">
                  <Github className="h-4 w-4" /> {profile.github.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              </div>
            )}
            {profile.portfolio && (
              <div>
                <p className="text-xs text-gray-500">Website</p>
                <a href={profile.portfolio.startsWith('http') ? profile.portfolio : `https://${profile.portfolio}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-purple-600 hover:underline mt-1">
                  <Globe className="h-4 w-4" /> {profile.portfolio.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
