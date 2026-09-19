'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Users, ArrowRight, Loader2 } from 'lucide-react'
import { api } from '@/lib/api-client'
import toast from 'react-hot-toast'

interface Candidate {
  id: string
  name: string
  role: string
  status: string
  initials: string
}

interface Stage {
  id: string
  title: string
  color: string
  candidates: Candidate[]
}

const defaultStages: Stage[] = [
  { id: 'applied', title: 'Applied', color: 'bg-blue-500', candidates: [] },
  { id: 'screening', title: 'Screening', color: 'bg-yellow-500', candidates: [] },
  { id: 'shortlisted', title: 'Shortlisted', color: 'bg-purple-500', candidates: [] },
  { id: 'interview', title: 'Interview Scheduled', color: 'bg-indigo-500', candidates: [] },
  { id: 'selected', title: 'Selected', color: 'bg-teal-500', candidates: [] },
  { id: 'offer', title: 'Offer Released', color: 'bg-cyan-500', candidates: [] },
  { id: 'joined', title: 'Joined', color: 'bg-green-500', candidates: [] },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-500', candidates: [] },
]

const statusBadgeColors: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  screening: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  shortlisted: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  interview: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
  selected: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100',
  offer: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100',
  joined: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
}

export default function PipelinePage() {
  const [stages, setStages] = useState<Stage[]>(defaultStages)
  const [loading, setLoading] = useState(true)
  const [moveCandidate, setMoveCandidate] = useState<{ id: string; name: string } | null>(null)
  const [targetStage, setTargetStage] = useState('')

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const res = await api.employerApplications.getAll()
      if (res && res.applications) {
        const stageMap: Record<string, Candidate[]> = {
          applied: [],
          screening: [],
          shortlisted: [],
          interview: [],
          selected: [],
          offer: [],
          joined: [],
          rejected: [],
        }

        res.applications.forEach((app: any) => {
          const st = (app.status || 'applied').toLowerCase()
          const cand: Candidate = {
            id: app.id,
            name: app.candidate?.name || 'Candidate',
            role: app.jobTitle || app.position || 'Applicant',
            status: st,
            initials: (app.candidate?.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
          }
          if (stageMap[st]) {
            stageMap[st].push(cand)
          } else {
            stageMap.applied.push(cand)
          }
        })

        setStages(defaultStages.map(s => ({
          ...s,
          candidates: stageMap[s.id] || [],
        })))
      }
    } catch (err: any) {
      toast.error('Failed to load recruitment pipeline')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const totalCandidates = stages.reduce((sum, s) => sum + s.candidates.length, 0)

  const handleMove = async () => {
    if (!moveCandidate || !targetStage) {
      toast.error('Please select a target stage')
      return
    }

    try {
      await api.employerApplications.updateStatus(moveCandidate.id, targetStage)
      toast.success(`${moveCandidate.name} moved to ${stages.find((s) => s.id === targetStage)?.title || targetStage}`)
      await fetchApplications()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update application stage')
    } finally {
      setMoveCandidate(null)
      setTargetStage('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <p className="text-muted-foreground">Track candidates through recruitment pipeline stages.</p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          <Users className="h-4 w-4 mr-1" /> {totalCandidates} candidates
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-2 mb-2">
        {stages.map((s) => (
          <div key={s.id} className="text-center p-2 rounded-lg bg-muted/50">
            <div className={`h-1.5 rounded-full mb-1 ${s.color}`} />
            <p className="text-xs font-medium truncate">{s.title}</p>
            <p className="text-lg font-bold">{s.candidates.length}</p>
          </div>
        ))}
      </div>

      <ScrollArea className="pb-4">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => (
            <div key={stage.id} className="w-[260px] flex-shrink-0">
              <Card className="h-full">
                <CardHeader className={`pb-3 rounded-t-lg ${stage.color}`}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-white">{stage.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs bg-white/90">{stage.candidates.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {stage.candidates.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-xs text-muted-foreground">No candidates</p>
                    </div>
                  ) : (
                    stage.candidates.map((candidate) => (
                      <div key={candidate.id} className="rounded-lg border p-3 transition-shadow hover:shadow-md cursor-pointer" onClick={() => setMoveCandidate({ id: candidate.id, name: candidate.name })}>
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{candidate.initials}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{candidate.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{candidate.role}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Badge className={`${statusBadgeColors[candidate.status] || ''} text-xs`} variant="outline">
                            {candidate.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      {moveCandidate && (
        <Card className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 shadow-2xl border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <p className="text-sm font-medium">Move <span className="text-primary">{moveCandidate.name}</span></p>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Select value={targetStage} onValueChange={setTargetStage}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select stage..." /></SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleMove}>Move</Button>
            <Button variant="ghost" size="sm" onClick={() => setMoveCandidate(null)}>Cancel</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
