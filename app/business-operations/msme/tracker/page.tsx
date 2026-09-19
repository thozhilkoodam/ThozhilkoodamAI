'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  Clock,
  FileText,
  FileCheck,
  ThumbsUp,
  UserCheck,
  Search,
  MessageCircle,
  Briefcase,
  UserPlus,
  CheckCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

const stages = [
  { id: 'submitted', label: 'Submitted', icon: FileText, completed: true, date: '15 Jun 2024', notes: 'Requirement submitted successfully.' },
  { id: 'admin_review', label: 'Review', icon: Clock, completed: true, date: '16 Jun 2024', notes: 'Admin reviewed and approved.' },
  { id: 'quotation_sent', label: 'Quotation Sent', icon: FileCheck, completed: true, date: '18 Jun 2024', notes: 'Quotation #QT-001 sent to client.' },
  { id: 'client_approved', label: 'Accepted', icon: ThumbsUp, completed: true, date: '20 Jun 2024', notes: 'Client approved the quotation.' },
  { id: 'agency_assigned', label: 'Agency Assigned', icon: UserCheck, completed: true, date: '21 Jun 2024', notes: 'Agency assigned to requirement.' },
  { id: 'consultant_assigned', label: 'Consultant Assigned', icon: UserCheck, completed: false, date: '', notes: 'HR consultant assigned for hiring.' },
  { id: 'candidate_search', label: 'Candidate Search', icon: Search, completed: false, date: '', notes: 'Searching for suitable candidates.' },
  { id: 'interview', label: 'Interview', icon: MessageCircle, completed: false, date: '', notes: '' },
  { id: 'offer', label: 'Offer Released', icon: Briefcase, completed: false, date: '', notes: '' },
  { id: 'joining', label: 'Joined', icon: UserPlus, completed: false, date: '', notes: '' },
  { id: 'completed', label: 'Completed', icon: CheckCheck, completed: false, date: '', notes: '' },
]

const requirements = [
  { id: 'REQ-001', position: 'Senior React Developer', department: 'Engineering', stage: 'candidate_search', progress: 60 },
  { id: 'REQ-002', position: 'Product Manager', department: 'Product', stage: 'quotation_sent', progress: 30 },
  { id: 'REQ-003', position: 'UX Designer', department: 'Design', stage: 'submitted', progress: 10 },
]

export default function MSMETrackerPage() {
  const [selectedReq, setSelectedReq] = useState(requirements[0].id)
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)

  const currentStages = stages
  const currentStageIndex = currentStages.findIndex((s) => s.id === requirements.find((r) => r.id === selectedReq)?.stage)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Requirement Tracker</h1>
        <p className="text-muted-foreground">Track the progress of your recruitment requirements.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {requirements.map((req) => (
          <Card
            key={req.id}
            className={cn(
              'cursor-pointer transition-all hover:border-primary/50',
              selectedReq === req.id && 'border-primary ring-1 ring-primary'
            )}
            onClick={() => setSelectedReq(req.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{req.id}</span>
                <Badge variant="outline" className="text-xs">{req.department}</Badge>
              </div>
              <p className="font-medium text-sm">{req.position}</p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{req.progress}%</span>
                </div>
                <Progress value={req.progress} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requirement Timeline</CardTitle>
          <CardDescription>
            {requirements.find((r) => r.id === selectedReq)?.position} — Current stage: {stages[currentStageIndex]?.label}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-muted-foreground/20" />

            <div className="space-y-0">
              {currentStages.map((stage, index) => {
                const isCompleted = stage.completed
                const isCurrent = index === currentStageIndex
                const isPast = index < currentStageIndex

                return (
                  <div key={stage.id} className="relative flex gap-4 pb-8 last:pb-0">
                    <div className="relative z-10 flex-shrink-0">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                          isCompleted && 'border-green-500 bg-green-50 dark:bg-green-900/20',
                          isCurrent && !isCompleted && 'border-primary bg-primary/10',
                          !isCompleted && !isCurrent && 'border-muted-foreground/30 bg-background'
                        )}
                      >
                        <stage.icon
                          className={cn(
                            'h-4 w-4',
                            isCompleted && 'text-green-500',
                            isCurrent && !isCompleted && 'text-primary',
                            !isCompleted && !isCurrent && 'text-muted-foreground/50'
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex-1 pt-1.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4
                            className={cn(
                              'font-medium text-sm',
                              isCompleted && 'text-green-600 dark:text-green-400',
                              isCurrent && !isCompleted && 'text-primary'
                            )}
                          >
                            {stage.label}
                            {isCurrent && !isCompleted && (
                              <span className="ml-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-primary" />
                            )}
                          </h4>
                          {stage.date && (
                            <p className="text-xs text-muted-foreground mt-0.5">{stage.date}</p>
                          )}
                        </div>
                        {isCompleted && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>

                      {stage.notes && (
                        <div className="mt-1">
                          <button
                            onClick={() => setExpandedNotes(expandedNotes === stage.id ? null : stage.id)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            {expandedNotes === stage.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            {expandedNotes === stage.id ? 'Hide notes' : 'Show notes'}
                          </button>
                          {expandedNotes === stage.id && (
                            <p className="mt-1 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                              {stage.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
