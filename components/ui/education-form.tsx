'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchableInstitutionSelect } from '@/components/ui/searchable-institution-select'
import { api } from '@/lib/api-client'

const QUALIFICATIONS = ['10th', '12th', 'Diploma', 'Bachelor', 'Master', 'PhD']
const QUALIFICATION_TYPES = ['Regular/Full Time', 'Part Time', 'Distance Education', 'Online', 'Other']
const DEGREES: Record<string, string[]> = {
  '10th': ['SSC', 'ICSE', 'CBSE', 'State Board', 'Other'],
  '12th': ['HSC', 'Intermediate', 'PUC', 'CBSE', 'ICSE', 'State Board', 'Other'],
  Diploma: ['Diploma in Engineering', 'Diploma in Computer Science', 'Diploma in Commerce', 'Diploma in Arts', 'Other'],
  Bachelor: ['B.E.', 'B.Tech', 'B.Sc', 'B.A.', 'B.Com', 'BBA', 'BCA', 'B.Ed', 'B.Pharm', 'LL.B', 'B.Des', 'B.Arch', 'B.Voc', 'B.S.W', 'Other'],
  Master: ['M.E.', 'M.Tech', 'M.Sc', 'M.A.', 'M.Com', 'MBA', 'MCA', 'M.Ed', 'M.Pharm', 'LL.M', 'M.Des', 'M.Arch', 'M.Voc', 'M.S.W', 'Other'],
  PhD: ['PhD', 'Doctorate', 'Other'],
}
const MODES_OF_STUDY = ['Full Time', 'Part Time', 'Distance', 'Online']
const GRADING_TYPES = ['Percentage', 'CGPA (4.0)', 'CGPA (10.0)', 'Other']
const PASSING_YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i))

export interface EducationValues {
  qualification: string
  qualificationType: string
  degree: string
  specialization: string
  college: string
  collegeId: number | null
  university: string
  universityId: number | null
  modeOfStudy: string
  passingYear: string
  percentage: string
  gradingType: string
  educationStatus: string
  currentSemester: string
  backlogs: string
  backlogCount: string
}

interface ValidationErrors {
  [key: string]: string
}

interface EducationFormProps {
  values: EducationValues
  onChange: (values: Partial<EducationValues>) => void
  errors: ValidationErrors
}

export function validateEducation(values: EducationValues): ValidationErrors {
  const errors: ValidationErrors = {}

  if (!values.qualification) errors.qualification = 'Highest Qualification is required'
  if (!values.qualificationType) errors.qualificationType = 'Qualification Type is required'
  if (!values.degree) errors.degree = 'Degree/Course is required'
  if (!values.specialization) errors.specialization = 'Specialization is required'
  if (!values.collegeId && !values.college) errors.college = 'College is required'
  if (!values.universityId && !values.university) errors.university = 'University is required'
  if (!values.modeOfStudy) errors.modeOfStudy = 'Mode of Study is required'
  if (!values.passingYear) errors.passingYear = 'Passing Year is required'
  if (!values.percentage) errors.percentage = 'Percentage/CGPA is required'
  if (!values.gradingType) errors.gradingType = 'Grading Type is required'
  if (!values.educationStatus) errors.educationStatus = 'Education Status is required'
  if (!values.backlogs) errors.backlogs = 'Please select Yes or No'

  if (values.educationStatus === 'Pursuing' && !values.currentSemester) {
    errors.currentSemester = 'Current Semester is required'
  }
  if (values.backlogs === 'Yes' && !values.backlogCount) {
    errors.backlogCount = 'Number of Backlogs is required'
  }

  return errors
}

const inputClass = 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
const labelClass = 'text-gray-700 dark:text-gray-300'

export function EducationForm({ values, onChange, errors }: EducationFormProps) {
  function set(field: keyof EducationValues, value: any) {
    onChange({ [field]: value })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Highest Qualification */}
      <div className="space-y-2">
        <Label className={labelClass}>Highest Qualification *</Label>
        <Select value={values.qualification} onValueChange={(v) => { set('qualification', v); if (v !== values.qualification) set('degree', '') }}>
          <SelectTrigger className={`${inputClass} ${errors.qualification ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {QUALIFICATIONS.map((q) => (
              <SelectItem key={q} value={q}>{q}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.qualification && <p className="text-xs text-red-500">{errors.qualification}</p>}
      </div>

      {/* Qualification Type */}
      <div className="space-y-2">
        <Label className={labelClass}>Qualification Type *</Label>
        <Select value={values.qualificationType} onValueChange={(v) => set('qualificationType', v)}>
          <SelectTrigger className={`${inputClass} ${errors.qualificationType ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {QUALIFICATION_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.qualificationType && <p className="text-xs text-red-500">{errors.qualificationType}</p>}
      </div>

      {/* Degree/Course */}
      <div className="space-y-2">
        <Label className={labelClass}>Degree/Course *</Label>
        <Select value={values.degree} onValueChange={(v) => set('degree', v)}>
          <SelectTrigger className={`${inputClass} ${errors.degree ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {(DEGREES[values.qualification] || DEGREES['Bachelor']).map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.degree && <p className="text-xs text-red-500">{errors.degree}</p>}
      </div>

      {/* Specialization */}
      <div className="space-y-2">
        <Label className={labelClass}>Specialization *</Label>
        <Input
          className={`${inputClass} ${errors.specialization ? 'border-red-500' : ''}`}
          value={values.specialization}
          onChange={(e) => set('specialization', e.target.value)}
          placeholder="e.g. Computer Science"
        />
        {errors.specialization && <p className="text-xs text-red-500">{errors.specialization}</p>}
      </div>

      {/* College */}
      <div className="space-y-2">
        <SearchableInstitutionSelect
          value={values.collegeId}
          onChange={(id, name) => onChange({ collegeId: id, college: name })}
          label="College *"
          placeholder="Search college..."
          fetchItems={(s) => api.institutions.getColleges(s)}
          createItem={(n) => api.institutions.createCollege(n)}
        />
        {errors.college && <p className="text-xs text-red-500">{errors.college}</p>}
      </div>

      {/* University */}
      <div className="space-y-2">
        <SearchableInstitutionSelect
          value={values.universityId}
          onChange={(id, name) => onChange({ universityId: id, university: name })}
          label="University *"
          placeholder="Search university..."
          fetchItems={(s) => api.institutions.getUniversities(s)}
          createItem={(n) => api.institutions.createUniversity(n)}
        />
        {errors.university && <p className="text-xs text-red-500">{errors.university}</p>}
      </div>

      {/* Mode of Study */}
      <div className="space-y-2">
        <Label className={labelClass}>Mode of Study *</Label>
        <Select value={values.modeOfStudy} onValueChange={(v) => set('modeOfStudy', v)}>
          <SelectTrigger className={`${inputClass} ${errors.modeOfStudy ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {MODES_OF_STUDY.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.modeOfStudy && <p className="text-xs text-red-500">{errors.modeOfStudy}</p>}
      </div>

      {/* Education Status */}
      <div className="space-y-2">
        <Label className={labelClass}>Education Status *</Label>
        <Select value={values.educationStatus} onValueChange={(v) => { set('educationStatus', v); if (v !== 'Pursuing') set('currentSemester', '') }}>
          <SelectTrigger className={`${inputClass} ${errors.educationStatus ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pursuing">Pursuing</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        {errors.educationStatus && <p className="text-xs text-red-500">{errors.educationStatus}</p>}
      </div>

      {/* Current Semester (conditional) */}
      {values.educationStatus === 'Pursuing' && (
        <div className="space-y-2">
          <Label className={labelClass}>Current Semester *</Label>
          <Select value={values.currentSemester} onValueChange={(v) => set('currentSemester', v)}>
            <SelectTrigger className={`${inputClass} ${errors.currentSemester ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => `Semester ${i + 1}`).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.currentSemester && <p className="text-xs text-red-500">{errors.currentSemester}</p>}
        </div>
      )}

      {/* Passing Year */}
      <div className="space-y-2">
        <Label className={labelClass}>Passing Year *</Label>
        <Select value={values.passingYear} onValueChange={(v) => set('passingYear', v)}>
          <SelectTrigger className={`${inputClass} ${errors.passingYear ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {PASSING_YEARS.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.passingYear && <p className="text-xs text-red-500">{errors.passingYear}</p>}
      </div>

      {/* Percentage/CGPA */}
      <div className="space-y-2">
        <Label className={labelClass}>Percentage/CGPA *</Label>
        <Input
          className={`${inputClass} ${errors.percentage ? 'border-red-500' : ''}`}
          value={values.percentage}
          onChange={(e) => set('percentage', e.target.value)}
          placeholder="e.g. 85% or 8.5"
          type="text"
        />
        {errors.percentage && <p className="text-xs text-red-500">{errors.percentage}</p>}
      </div>

      {/* Grading Type */}
      <div className="space-y-2">
        <Label className={labelClass}>Grading Type *</Label>
        <Select value={values.gradingType} onValueChange={(v) => set('gradingType', v)}>
          <SelectTrigger className={`${inputClass} ${errors.gradingType ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {GRADING_TYPES.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.gradingType && <p className="text-xs text-red-500">{errors.gradingType}</p>}
      </div>

      {/* Backlogs */}
      <div className="space-y-2">
        <Label className={labelClass}>Backlogs *</Label>
        <Select value={values.backlogs} onValueChange={(v) => { set('backlogs', v); if (v !== 'Yes') set('backlogCount', '') }}>
          <SelectTrigger className={`${inputClass} ${errors.backlogs ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="No">No</SelectItem>
            <SelectItem value="Yes">Yes</SelectItem>
          </SelectContent>
        </Select>
        {errors.backlogs && <p className="text-xs text-red-500">{errors.backlogs}</p>}
      </div>

      {/* Number of Backlogs (conditional) */}
      {values.backlogs === 'Yes' && (
        <div className="space-y-2">
          <Label className={labelClass}>Number of Backlogs *</Label>
          <Input
            className={`${inputClass} ${errors.backlogCount ? 'border-red-500' : ''}`}
            value={values.backlogCount}
            onChange={(e) => set('backlogCount', e.target.value)}
            placeholder="e.g. 2"
            type="number"
            min="1"
          />
          {errors.backlogCount && <p className="text-xs text-red-500">{errors.backlogCount}</p>}
        </div>
      )}
    </div>
  )
}
