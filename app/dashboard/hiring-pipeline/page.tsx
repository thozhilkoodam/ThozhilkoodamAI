'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Plus, ArrowRight } from 'lucide-react'

interface Candidate {
  id: string
  name: string
  designation: string
  experience: string
  skills: string[]
  avatar: string
}

interface Stage {
  id: string
  title: string
  color: string
  candidates: Candidate[]
}

const initialStages: Stage[] = [
  {
    id: 'applied',
    title: 'Applied',
    color: 'bg-blue-500',
    candidates: [
      { id: '1', name: 'Rahul Sharma', designation: 'Senior React Developer', experience: '4.5 yrs', skills: ['React', 'TypeScript', 'Node.js'], avatar: 'RS' },
      { id: '2', name: 'Ananya Gupta', designation: 'Full Stack Developer', experience: '3.5 yrs', skills: ['React', 'Python', 'PostgreSQL'], avatar: 'AG' },
      { id: '3', name: 'Vikram Singh', designation: 'Data Scientist', experience: '4 yrs', skills: ['Python', 'ML', 'SQL'], avatar: 'VS' },
    ],
  },
  {
    id: 'screening',
    title: 'Screening',
    color: 'bg-yellow-500',
    candidates: [
      { id: '4', name: 'Priya Patel', designation: 'Product Manager', experience: '6 yrs', skills: ['Strategy', 'Agile', 'Analytics'], avatar: 'PP' },
    ],
  },
  {
    id: 'shortlisted',
    title: 'Shortlisted',
    color: 'bg-purple-500',
    candidates: [
      { id: '5', name: 'Arun Kumar', designation: 'DevOps Engineer', experience: '5 yrs', skills: ['AWS', 'Docker', 'K8s'], avatar: 'AK' },
    ],
  },
  {
    id: 'interview',
    title: 'Interview',
    color: 'bg-orange-500',
    candidates: [
      { id: '6', name: 'Sneha Reddy', designation: 'UX Designer', experience: '3 yrs', skills: ['Figma', 'Research', 'Prototyping'], avatar: 'SR' },
    ],
  },
  {
    id: 'selected',
    title: 'Selected',
    color: 'bg-green-500',
    candidates: [],
  },
  {
    id: 'offer',
    title: 'Offer',
    color: 'bg-teal-500',
    candidates: [],
  },
  {
    id: 'joined',
    title: 'Joined',
    color: 'bg-emerald-500',
    candidates: [],
  },
]

export default function HiringPipelinePage() {
  const [stages, setStages] = useState<Stage[]>(initialStages)
  const [dragItem, setDragItem] = useState<{ candidate: Candidate; fromStage: string } | null>(null)

  const handleDragStart = (candidate: Candidate, fromStageId: string) => {
    setDragItem({ candidate, fromStage: fromStageId })
  }

  const handleDrop = (toStageId: string) => {
    if (!dragItem) return
    if (dragItem.fromStage === toStageId) {
      setDragItem(null)
      return
    }

    setStages((prev) => {
      const newStages = prev.map((stage) => {
        if (stage.id === dragItem.fromStage) {
          return { ...stage, candidates: stage.candidates.filter((c) => c.id !== dragItem.candidate.id) }
        }
        if (stage.id === toStageId) {
          return { ...stage, candidates: [...stage.candidates, dragItem.candidate] }
        }
        return stage
      })
      return newStages
    })
    setDragItem(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const moveForward = (candidate: Candidate, fromStageId: string) => {
    const currentIndex = stages.findIndex((s) => s.id === fromStageId)
    if (currentIndex < stages.length - 1) {
      setDragItem({ candidate, fromStage: fromStageId })
      handleDrop(stages[currentIndex + 1].id)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hiring Pipeline</h1>
        <p className="text-muted-foreground">Drag and drop candidates through the hiring stages.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="min-w-[280px] flex-shrink-0"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(stage.id)}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                    <CardTitle className="text-sm">{stage.title}</CardTitle>
                  </div>
                  <Badge variant="secondary">{stage.candidates.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {stage.candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="rounded-lg border p-3 transition-shadow hover:shadow-md cursor-grab active:cursor-grabbing"
                    draggable
                    onDragStart={() => handleDragStart(candidate, stage.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`} />
                        <AvatarFallback className="text-xs">{candidate.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{candidate.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{candidate.designation}</p>
                        <p className="text-xs text-muted-foreground">{candidate.experience}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {candidate.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-[10px]">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    {stages.findIndex((s) => s.id === stage.id) < stages.length - 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full text-xs"
                        onClick={() => moveForward(candidate, stage.id)}
                      >
                        Move Forward <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                  <Plus className="mr-1 h-3 w-3" /> Add Candidate
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
