'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Upload, FileText, RefreshCw, Eye, Sparkles, Loader2,
  GraduationCap, Wrench, AlertCircle, CheckCircle2, Download, Link,
  Brain, Target, Lightbulb, TrendingUp, CheckSquare
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

type ParsedResume = {
  name: string | null
  email: string | null
  phone: string | null
  totalExperience: string | null
  skills: string[]
  education: { degree: string; institution?: string; year?: string }[] | null
  currentCompany: string | null
  designation: string | null
  location: string | null
  summary?: string | null
}

type ExtractionMeta = {
  documentId: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  model?: string
  completedAt?: string
  errorMessage?: string | null
}

type ParsedAnalysis = {
  professionalSummary: string
  keyStrengths: string[]
  technicalSkills: Array<{
    skill: string
    evidence: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'unknown'
  }>
  softSkills: string[]
  experienceAnalysis: {
    totalExperience: string | null
    areasOfExperience: string[]
    seniorityAssessment: string | null
  }
  skillGaps: Array<{
    skill: string
    reason: string
    priority: 'low' | 'medium' | 'high'
  }>
  careerSuggestions: Array<{
    role: string
    reason: string
  }>
  resumeImprovements: string[]
}

type AnalysisMeta = {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  model?: string
  completedAt?: string
  errorMessage?: string | null
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="font-medium text-gray-900 dark:text-white">{value || 'Not Found'}</p>
    </div>
  )
}

export default function ResumePage() {
  const [uploading, setUploading] = useState(false)
  const [savingToProfile, setSavingToProfile] = useState(false)
  const [resume, setResume] = useState<{ name: string; size: string; url: string } | null>(null)
  const [parsing, setParsing] = useState(false)
  const [parsed, setParsed] = useState<ParsedResume | null>(null)
  const [extractionMeta, setExtractionMeta] = useState<ExtractionMeta | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [savedToProfile, setSavedToProfile] = useState(false)

  // AI Resume Analysis States
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ParsedAnalysis | null>(null)
  const [analysisMeta, setAnalysisMeta] = useState<AnalysisMeta | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF and DOCX files are accepted')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5 MB')
      return
    }

    setUploading(true)
    setParseError(null)
    setParsed(null)
    setExtractionMeta(null)
    setAnalysis(null)
    setAnalysisMeta(null)
    setAnalysisError(null)
    setSavedToProfile(false)

    try {
      const uploadResult = await api.files.resume(file)
      const fileUrl = uploadResult.downloadUrl || uploadResult.url || uploadResult.path || ''

      setResume({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        url: fileUrl,
      })

      setSavingToProfile(true)
      if (fileUrl) {
        await api.portal.profile.update({ resumeUrl: fileUrl })
      }
      setSavingToProfile(false)
      toast.success('Resume uploaded and saved to profile')

      const docId = uploadResult.documentId || uploadResult.id || fileUrl
      setParsing(true)
      try {
        const res = await api.resume.parse(docId)
        const ext = res.extraction ? res.extraction : res
        setParsed(ext.extractedData || ext)
        setExtractionMeta({
          documentId: ext.documentId || docId,
          status: ext.status || 'COMPLETED',
          model: ext.model,
          completedAt: ext.completedAt,
        })
        toast.success('Resume extracted with AI successfully')
      } catch (parseErr: any) {
        setParseError(parseErr.message || 'Failed to extract resume with AI')
        toast.error(parseErr.message || 'Failed to extract resume with AI')
      } finally {
        setParsing(false)
      }

    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleRefreshExtraction = async () => {
    if (!extractionMeta?.documentId) return
    try {
      setParsing(true)
      const res = await api.resume.getExtraction(extractionMeta.documentId)
      const ext = res.extraction ? res.extraction : res
      setParsed(ext.extractedData || ext)
      setExtractionMeta({
        documentId: ext.documentId,
        status: ext.status || 'COMPLETED',
        model: ext.model,
        completedAt: ext.completedAt,
        errorMessage: ext.errorMessage,
      })
      toast.success('AI extraction status refreshed')
    } catch (err: any) {
      toast.error(err.message || 'Failed to refresh extraction')
    } finally {
      setParsing(false)
    }
  }

  const handleGenerateAnalysis = async () => {
    if (!extractionMeta?.documentId) return
    setAnalyzing(true)
    setAnalysisError(null)
    try {
      const res = await api.resumeAnalysis.generate(extractionMeta.documentId)
      const ana = res.analysis ? res.analysis : res
      setAnalysis(ana.analysisData || ana)
      setAnalysisMeta({
        status: ana.status || 'COMPLETED',
        model: ana.model,
        completedAt: ana.completedAt,
        errorMessage: ana.errorMessage,
      })
      toast.success('AI Resume Analysis completed successfully')
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to generate AI Resume Analysis')
      toast.error(err.message || 'Failed to generate AI Resume Analysis')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleFetchSavedAnalysis = async () => {
    if (!extractionMeta?.documentId) return
    try {
      setAnalyzing(true)
      const res = await api.resumeAnalysis.get(extractionMeta.documentId)
      const ana = res.analysis ? res.analysis : res
      setAnalysis(ana.analysisData || ana)
      setAnalysisMeta({
        status: ana.status || 'COMPLETED',
        model: ana.model,
        completedAt: ana.completedAt,
        errorMessage: ana.errorMessage,
      })
    } catch (err: any) {
      // Non-blocking if analysis not generated yet
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSaveParsedToProfile = async () => {
    if (!parsed) return
    try {
      setSavingToProfile(true)
      const updateData: any = {}
      if (parsed.name) updateData.name = parsed.name
      if (parsed.currentCompany) updateData.currentCompany = parsed.currentCompany
      if (parsed.designation) updateData.designation = parsed.designation
      if (parsed.totalExperience) updateData.experienceYears = parsed.totalExperience
      if (parsed.location) updateData.city = parsed.location
      if (parsed.email) updateData.email = parsed.email
      if (parsed.phone) updateData.phone = parsed.phone
      await api.portal.profile.update(updateData)
      setSavedToProfile(true)
      toast.success('Parsed data saved to profile!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save parsed data')
    } finally {
      setSavingToProfile(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume</h1>
          <p className="text-gray-500 dark:text-gray-400">Upload your resume for AI extraction & career analysis</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Upload className="h-5 w-5 text-purple-500" /> Upload Resume</CardTitle>
        </CardHeader>
        <CardContent>
          {!resume ? (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all">
              <Upload className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">PDF or DOCX, max 5 MB</p>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUpload} disabled={uploading} />
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-purple-600 mt-3">
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                </div>
              )}
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{resume.name}</p>
                    <p className="text-xs text-gray-500">{resume.size}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.open(resume.url, '_blank')}>
                    <Eye className="h-4 w-4" /> Preview
                  </Button>
                  <label className="cursor-pointer">
                    <Button size="sm" variant="outline" className="gap-1.5" type="button">
                      <RefreshCw className="h-4 w-4" /> Replace
                    </Button>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
                  </label>
                </div>
              </div>

              {(savingToProfile || parsing) && (
                <div className="flex items-center gap-2 text-sm text-purple-600 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {savingToProfile ? 'Saving to profile...' : 'AI is extracting structured data from your resume...'}
                </div>
              )}

              {!savingToProfile && savedToProfile && (
                <div className="flex items-center gap-2 text-sm text-green-600 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                  Resume URL saved to profile — Dashboard will show the latest resume
                </div>
              )}

              {parseError && (
                <div className="flex items-start gap-2 text-sm text-red-600 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Parsing failed</p>
                    <p className="text-red-500 mt-0.5">{parseError}</p>
                  </div>
                </div>
              )}

              {parsed && (
                <div className="space-y-4">
                  <Separator />
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" /> AI Resume Extraction
                    </h4>
                    {extractionMeta && (
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className={
                          extractionMeta.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                          extractionMeta.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }>
                          {extractionMeta.status}
                        </Badge>
                        {extractionMeta.completedAt && (
                          <span className="text-gray-400">
                            {new Date(extractionMeta.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleRefreshExtraction} title="Refresh Extraction">
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                    <Field label="Full Name" value={parsed.name} />
                    <Field label="Email" value={parsed.email} />
                    <Field label="Phone" value={parsed.phone} />
                    <Field label="Total Experience" value={parsed.totalExperience} />
                    <Field label="Current Company" value={parsed.currentCompany} />
                    <Field label="Designation" value={parsed.designation} />
                    <Field label="Location" value={parsed.location} />
                  </div>

                  {parsed.summary && (
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-sm">
                      <p className="text-xs text-gray-500 mb-1">Professional Summary</p>
                      <p className="text-gray-800 dark:text-gray-200">{parsed.summary}</p>
                    </div>
                  )}

                  {parsed.skills && parsed.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                        <Wrench className="h-4 w-4 text-purple-500" /> Skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {parsed.skills.map(s => (
                          <Badge key={s} className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-0 text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsed.education && parsed.education.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-purple-500" /> Education
                      </p>
                      <div className="space-y-2">
                        {parsed.education.map((edu, i) => (
                          <div key={i} className="text-sm p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                            <p className="font-medium text-gray-900 dark:text-white">{edu.degree}</p>
                            {edu.institution && <p className="text-gray-500 text-xs">{edu.institution}{edu.year ? ` • ${edu.year}` : ''}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.open(resume.url, '_blank')}>
                      <Download className="h-4 w-4" /> Download
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5 bg-purple-600 hover:bg-purple-700"
                      onClick={handleSaveParsedToProfile}
                      disabled={savingToProfile || savedToProfile}
                    >
                      {savingToProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4" />}
                      {savedToProfile ? 'Saved to Profile' : 'Save to Profile'}
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-950 dark:text-indigo-300"
                      onClick={handleGenerateAnalysis}
                      disabled={analyzing}
                    >
                      {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                      {analysis ? 'Re-analyze Resume' : 'Analyze Resume'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI RESUME ANALYSIS SECTION */}
      {(analyzing || analysis || analysisError) && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
              <Brain className="h-5 w-5 text-indigo-600" /> AI Resume Analysis & Career Feedback
            </CardTitle>
            {analysisMeta && (
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className={
                  analysisMeta.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-300' :
                  analysisMeta.status === 'FAILED' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                }>
                  {analysisMeta.status}
                </Badge>
                {analysisMeta.completedAt && (
                  <span className="text-gray-400">
                    {new Date(analysisMeta.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {analyzing && (
              <div className="flex items-center gap-2 text-sm text-indigo-600 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                Gemini AI is analyzing your skills, experience, and career insights...
              </div>
            )}

            {analysisError && (
              <div className="flex items-start gap-2 text-sm text-red-600 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Analysis failed</p>
                  <p className="text-red-500 mt-0.5">{analysisError}</p>
                </div>
              </div>
            )}

            {analysis && !analyzing && (
              <div className="space-y-6">
                {/* Executive Summary */}
                <div className="p-4 rounded-xl bg-white dark:bg-gray-800/80 shadow-sm border border-indigo-100 dark:border-gray-700">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-indigo-500" /> Executive Career Summary
                  </h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.professionalSummary}</p>
                </div>

                {/* Strengths & Soft Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-gray-800/80 shadow-sm border border-indigo-100 dark:border-gray-700">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-green-500" /> Key Strengths
                    </h5>
                    <ul className="space-y-2 text-sm">
                      {analysis.keyStrengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <span className="text-green-500 font-bold">•</span> {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-gray-800/80 shadow-sm border border-indigo-100 dark:border-gray-700">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                      <Wrench className="h-4 w-4 text-blue-500" /> Soft Skills
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {analysis.softSkills.map((ss, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {ss}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Technical Skills Assessment */}
                {analysis.technicalSkills && analysis.technicalSkills.length > 0 && (
                  <div className="p-4 rounded-xl bg-white dark:bg-gray-800/80 shadow-sm border border-indigo-100 dark:border-gray-700">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                      <Wrench className="h-4 w-4 text-indigo-500" /> Technical Skills & Evidence
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {analysis.technicalSkills.map((ts, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{ts.skill}</p>
                            <p className="text-xs text-gray-500 mt-1">Evidence: {ts.evidence}</p>
                          </div>
                          <Badge variant="outline" className={
                            ts.level === 'expert' || ts.level === 'advanced' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            ts.level === 'intermediate' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                          }>
                            {ts.level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skill Gaps & Career Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.skillGaps && analysis.skillGaps.length > 0 && (
                    <div className="p-4 rounded-xl bg-white dark:bg-gray-800/80 shadow-sm border border-amber-100 dark:border-gray-700">
                      <h5 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                        <TrendingUp className="h-4 w-4 text-amber-500" /> Recommended Skill Growth
                      </h5>
                      <div className="space-y-2 text-sm">
                        {analysis.skillGaps.map((sg, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">{sg.skill}</span>
                              <Badge className={
                                sg.priority === 'high' ? 'bg-red-100 text-red-700 border-0' :
                                sg.priority === 'medium' ? 'bg-amber-100 text-amber-800 border-0' : 'bg-gray-100 text-gray-700 border-0'
                              } text-xs>
                                {sg.priority} priority
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{sg.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.careerSuggestions && analysis.careerSuggestions.length > 0 && (
                    <div className="p-4 rounded-xl bg-white dark:bg-gray-800/80 shadow-sm border border-indigo-100 dark:border-gray-700">
                      <h5 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                        <Lightbulb className="h-4 w-4 text-indigo-500" /> Suggested Career Paths
                      </h5>
                      <div className="space-y-2 text-sm">
                        {analysis.careerSuggestions.map((cs, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-indigo-50/40 dark:bg-indigo-950/20">
                            <p className="font-medium text-indigo-900 dark:text-indigo-200">{cs.role}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{cs.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Resume Improvements */}
                {analysis.resumeImprovements && analysis.resumeImprovements.length > 0 && (
                  <div className="p-4 rounded-xl bg-white dark:bg-gray-800/80 shadow-sm border border-indigo-100 dark:border-gray-700">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                      <CheckSquare className="h-4 w-4 text-emerald-500" /> Actionable Resume Improvements
                    </h5>
                    <ul className="space-y-2 text-sm">
                      {analysis.resumeImprovements.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
