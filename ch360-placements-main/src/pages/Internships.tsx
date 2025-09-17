import { useState, useEffect, useMemo } from "react"
import { Plus, GraduationCap, MapPin, Building2, Clock, DollarSign, Users, Calendar, Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { jobsApi, type JobDto } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function Internships() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDuration, setFilterDuration] = useState("all")
  const [filterLocation, setFilterLocation] = useState("all")
  const [internships, setInternships] = useState<JobDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const { toast } = useToast()

  // Fetch internships from jobs API
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true)
        setError("")
        const data = await jobsApi.getAll()
        const normalized = Array.isArray(data) ? data : (data as any)?.results ?? []
        // Filter for internship jobs
        const internshipJobs = normalized.filter((job: JobDto) => 
          job.job_type?.toLowerCase() === 'internship' || 
          job.title?.toLowerCase().includes('intern') ||
          job.description?.toLowerCase().includes('internship')
        )
        setInternships(internshipJobs)
      } catch (err: any) {
        const serverDetail = err?.response?.data?.detail || err?.response?.data?.message || err?.response?.data?.error
        const status = err?.response?.status
        const msg = serverDetail || (status ? `Failed to load internships (HTTP ${status})` : err?.message) || "Failed to load internships"
        setError(msg)
        toast({
          title: "Error",
          description: msg,
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInternships()
  }, [toast])

  const filteredInternships = useMemo(() => {
    return internships.filter(internship => {
      const matchesSearch = 
        String(internship.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(internship.company?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(internship.location || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesLocation = filterLocation === "all" || 
        String(internship.location || '').toLowerCase() === filterLocation.toLowerCase()
      
      // For duration, we'll use a simple mapping based on job type or description
      const duration = internship.job_type === 'INTERNSHIP' ? '3-6 months' : '6+ months'
      const matchesDuration = filterDuration === "all" || duration === filterDuration
      
      return matchesSearch && matchesDuration && matchesLocation
    })
  }, [internships, searchTerm, filterDuration, filterLocation])

  const durations = ["all", "3-6 months", "6+ months"]
  const locations = ["all", ...Array.from(new Set(internships.map(i => i.location).filter(Boolean)))]

  const formatINR = (value?: number | string) => {
    if (value === undefined || value === null || value === '') return '-'
    const num = typeof value === 'string' ? Number(value) : value
    if (Number.isNaN(num)) return '-'
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading internships...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">Error Loading Internships</h3>
            <p className="text-muted-foreground dark:text-white/60 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white">Internships</h1>
          <p className="text-sm md:text-base text-muted-foreground dark:text-white/80">
            Browse and apply for internship opportunities with leading companies
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search internships by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filterDuration} onValueChange={setFilterDuration}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              {durations.map(duration => (
                <SelectItem key={duration} value={duration}>
                  {duration === "all" ? "All Durations" : duration}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map(location => (
                <SelectItem key={location} value={location}>
                  {location === "all" ? "All Locations" : location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Post Internship
          </Button>
        </div>
      </div>

      {/* Internships Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInternships.map((internship) => (
          <Card key={internship.id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-foreground dark:text-white mb-2">
                    {internship.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-white/60 mb-2">
                    <Building2 className="h-4 w-4" />
                    <span>{internship.company?.name || 'Unknown Company'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-white/60">
                    <MapPin className="h-4 w-4" />
                    <span>{internship.location || 'Remote'}</span>
                  </div>
                </div>
                <Badge variant="outline" className="ml-2">
                  {internship.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Clock className="h-4 w-4" />
                  <span>{internship.job_type || 'Internship'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <DollarSign className="h-4 w-4" />
                  <span>{formatINR(internship.stipend || internship.salary_min)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Users className="h-4 w-4" />
                  <span>{internship.openings || 'Multiple'} positions</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Calendar className="h-4 w-4" />
                  <span>{internship.created_at ? new Date(internship.created_at).toLocaleDateString() : 'Recently'}</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground dark:text-white/70 line-clamp-2">
                {internship.description || 'No description available'}
              </p>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground dark:text-white/50">
                  {internship.work_mode || 'Hybrid'} work mode
                </span>
                <Button variant="outline" size="sm">
                  Apply Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInternships.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-muted-foreground dark:text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">No internships found</h3>
          <p className="text-muted-foreground dark:text-white/60">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  )
}