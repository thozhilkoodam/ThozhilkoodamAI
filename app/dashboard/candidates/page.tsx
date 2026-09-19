'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Mic, MapPin, Briefcase, Clock, SlidersHorizontal, X, Filter } from 'lucide-react'

const candidates = [
  { id: 1, name: 'Rahul Sharma', designation: 'Senior React Developer', company: 'TechCorp', experience: '4.5 years', skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'], location: 'Bangalore', lastActive: '2 days ago', ctc: '14 LPA', notice: '30 days', gender: 'Male' },
  { id: 2, name: 'Priya Patel', designation: 'Product Manager', company: 'InnovateAI', experience: '6 years', skills: ['Product Strategy', 'Agile', 'Analytics', 'UX'], location: 'Mumbai', lastActive: '1 week ago', ctc: '22 LPA', notice: '60 days', gender: 'Female' },
  { id: 3, name: 'Arun Kumar', designation: 'DevOps Engineer', company: 'CloudNative', experience: '5 years', skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'], location: 'Chennai', lastActive: '3 days ago', ctc: '18 LPA', notice: '45 days', gender: 'Male' },
  { id: 4, name: 'Sneha Reddy', designation: 'UX Designer', company: 'DesignStudio', experience: '3 years', skills: ['Figma', 'User Research', 'Prototyping'], location: 'Remote', lastActive: '1 day ago', ctc: '10 LPA', notice: '15 days', gender: 'Female' },
  { id: 5, name: 'Vikram Singh', designation: 'Data Scientist', company: 'DataMinds', experience: '4 years', skills: ['Python', 'ML', 'SQL', 'TensorFlow'], location: 'Hyderabad', lastActive: '5 days ago', ctc: '16 LPA', notice: '30 days', gender: 'Male' },
  { id: 6, name: 'Ananya Gupta', designation: 'Full Stack Developer', company: 'WebTech', experience: '3.5 years', skills: ['React', 'Python', 'PostgreSQL', 'Docker'], location: 'Delhi', lastActive: '4 days ago', ctc: '12 LPA', notice: '30 days', gender: 'Female' },
  { id: 7, name: 'Karthik Nair', designation: 'HR Manager', company: 'PeopleFirst', experience: '7 years', skills: ['HR Operations', 'Recruitment', 'Payroll', 'Compliance'], location: 'Kochi', lastActive: '1 week ago', ctc: '15 LPA', notice: '60 days', gender: 'Male' },
  { id: 8, name: 'Divya Menon', designation: 'Marketing Lead', company: 'BrandPro', experience: '5 years', skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'], location: 'Pune', lastActive: '2 days ago', ctc: '13 LPA', notice: '30 days', gender: 'Female' },
]

export default function CandidatesPage() {
  const [search, setSearch] = useState('')
  const [listening, setListening] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    location: '',
    minExp: '',
    maxExp: '',
    minCtc: '',
    maxCtc: '',
    noticePeriod: '',
    gender: '',
  })

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.onresult = (event: any) => {
        setSearch(event.results[0][0].transcript)
        setListening(false)
      }
      recognition.start()
      setListening(true)
    }
  }

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      c.designation.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidate Search</h1>
          <p className="text-muted-foreground">Find the best talent for your positions.</p>
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, skills, designation, or company..."
            className="pl-10 pr-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={startListening}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${listening ? 'text-red-500' : 'text-muted-foreground'}`}
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Advanced Filters</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select value={filters.location} onValueChange={(v) => setFilters({ ...filters, location: v })}>
                  <SelectTrigger><SelectValue placeholder="All locations" /></SelectTrigger>
                  <SelectContent>
                    {['Bangalore', 'Mumbai', 'Chennai', 'Hyderabad', 'Delhi', 'Pune', 'Kochi', 'Remote'].map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Experience</label>
                <Select value={filters.minExp} onValueChange={(v) => setFilters({ ...filters, minExp: v })}>
                  <SelectTrigger><SelectValue placeholder="Min years" /></SelectTrigger>
                  <SelectContent>
                    {['0', '1', '2', '3', '5', '8', '10'].map((e) => (
                      <SelectItem key={e} value={e}>{e}+ years</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Experience</label>
                <Select value={filters.maxExp} onValueChange={(v) => setFilters({ ...filters, maxExp: v })}>
                  <SelectTrigger><SelectValue placeholder="Max years" /></SelectTrigger>
                  <SelectContent>
                    {['2', '3', '5', '8', '10', '15', '20'].map((e) => (
                      <SelectItem key={e} value={e}>{e}+ years</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <Select value={filters.gender} onValueChange={(v) => setFilters({ ...filters, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="group transition-shadow hover:shadow-lg cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`} />
                  <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{candidate.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{candidate.designation}</p>
                  <p className="text-xs text-muted-foreground">{candidate.company}</p>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" /> {candidate.experience}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {candidate.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Active {candidate.lastActive}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {candidate.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {candidate.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">+{candidate.skills.length - 3}</Badge>
                )}
              </div>

              <Separator className="my-3" />

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{candidate.ctc}</span>
                <Badge variant="secondary" className="text-xs">{candidate.notice}</Badge>
              </div>

              <Button size="sm" className="mt-3 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                View Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
