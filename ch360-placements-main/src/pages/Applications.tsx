import { useState, useEffect, useCallback } from "react"
import { 
  FileText, 
  User, 
  Building2, 
  Calendar, 
  Clock, 
  Filter, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
// (deduped) Select imports
import { useToast } from "@/hooks/use-toast"
import { applicationsApi, studentsApi, jobsApi, drivesApi } from "@/lib/api"

// Application interface based on the API structure
interface Application {
  id: number;
  student_name: string;
  student_email: string;
  student_phone?: string;
  student_course: string;
  student_year: string;
  student_cgpa?: number;
  company_name: string;
  job_title: string;
  job_type: 'full-time' | 'part-time' | 'internship';
  application_date: string;
  status: 'pending' | 'under_review' | 'shortlisted' | 'rejected' | 'selected';
  resume_url?: string;
  cover_letter?: string;
  notes?: string;
  interview_date?: string;
  interview_feedback?: string;
}


export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [jobTypeFilter, setJobTypeFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  const { toast } = useToast()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Add form state
  const [form, setForm] = useState<any>({
    student_id: "",
    job_id: "",
    drive_id: "",
    resume: null as File | null,
    cover_letter: "",
    status: "APPLIED",
    notes: "",
  })
  const [studentQuery, setStudentQuery] = useState("")
  const [jobQuery, setJobQuery] = useState("")
  const [driveQuery, setDriveQuery] = useState("")
  const [studentOptions, setStudentOptions] = useState<any[]>([])
  const [jobOptions, setJobOptions] = useState<any[]>([])
  const [driveOptions, setDriveOptions] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [loadingDrives, setLoadingDrives] = useState(false)

  // Fetch applications from API
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await applicationsApi.getAll()
      const normalizeStatus = (raw: any): Application['status'] => {
        const s = String(raw || '').toUpperCase()
        if (s === 'APPLIED') return 'pending'
        if (s === 'UNDER_REVIEW') return 'under_review'
        if (s === 'INTERVIEW' || s === 'SHORTLISTED') return 'shortlisted'
        if (s === 'OFFERED' || s === 'HIRED' || s === 'SELECTED') return 'selected'
        if (s === 'REJECTED') return 'rejected'
        return 'under_review'
      }
      const mapped: Application[] = (response || []).map((a: any) => ({
        id: a.id ?? Math.random(),
        student_name: a.student?.name || a.student_name || 'Unknown',
        student_email: a.student?.email || a.student_email || '',
        student_phone: a.student?.phone || a.student_phone || '',
        student_course: a.student_course || a.student?.course || '',
        student_year: a.student_year || a.student?.year || '',
        student_cgpa: a.student_cgpa ?? a.student?.cgpa ?? undefined,
        company_name: a.company?.name || a.company_name || a.job?.company?.name || '',
        job_title: a.job?.title || a.job_title || '',
        job_type: (a.job_type || a.job?.job_type || 'internship') as Application['job_type'],
        application_date: a.application_date || a.applied_at || new Date().toISOString(),
        status: normalizeStatus(a.status),
        resume_url: a.resume_url,
        cover_letter: a.cover_letter,
        notes: a.notes,
        interview_date: a.interview_date,
        interview_feedback: a.interview_feedback,
      }))
      setApplications(mapped)
    } catch (error: any) {
      console.error('Error fetching applications:', error)
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to fetch applications"
      setError(errorMessage)
      toast({
        title: "Error",
        description: "Failed to fetch applications. Please check your connection and try again.",
        variant: "destructive"
      })
      // Set empty array on error to show proper empty state
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Search helpers (debounced)
  useEffect(() => {
    const h = setTimeout(async () => {
      try {
        setLoadingStudents(true)
        const res = await studentsApi.search(studentQuery)
        setStudentOptions(res as any[])
      } catch { setStudentOptions([]) } finally { setLoadingStudents(false) }
    }, 300)
    return () => clearTimeout(h)
  }, [studentQuery])

  useEffect(() => {
    const h = setTimeout(async () => {
      try {
        setLoadingJobs(true)
        const data = await jobsApi.getAll()
        const arr = Array.isArray(data) ? data : (data as any)?.results ?? []
        const filtered = jobQuery ? arr.filter((j: any) => String(j.title || "").toLowerCase().includes(jobQuery.toLowerCase())) : arr
        setJobOptions(filtered)
      } catch { setJobOptions([]) } finally { setLoadingJobs(false) }
    }, 300)
    return () => clearTimeout(h)
  }, [jobQuery])

  useEffect(() => {
    const h = setTimeout(async () => {
      try {
        setLoadingDrives(true)
        const data = await drivesApi.getAll()
        const arr = Array.isArray(data) ? data : (data as any)?.results ?? []
        const filtered = driveQuery ? arr.filter((d: any) => String(d.title || d.name || "").toLowerCase().includes(driveQuery.toLowerCase())) : arr
        setDriveOptions(filtered)
      } catch { setDriveOptions([]) } finally { setLoadingDrives(false) }
    }, 300)
    return () => clearTimeout(h)
  }, [driveQuery])

  const handleCreate = async () => {
    try {
      setSaving(true)
      if (!form.student_id || !form.job_id) {
        toast({ title: "Student and Job are required", variant: "destructive" })
        return
      }
      const payload: any = {
        student_id: Number(form.student_id) || form.student_id,
        job_id: Number(form.job_id) || form.job_id,
        drive_id: form.drive_id ? (Number(form.drive_id) || form.drive_id) : undefined,
        resume: form.resume || undefined,
        cover_letter: form.cover_letter || undefined,
        status: form.status || "APPLIED",
        notes: form.notes || undefined,
      }
      const created = await applicationsApi.create(payload)
      setApplications(prev => [created as any, ...prev])
      setIsAddOpen(false)
      setForm({ student_id: "", job_id: "", drive_id: "", resume: null, cover_letter: "", status: "APPLIED", notes: "" })
      toast({ title: "Application created" })
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "Failed to create application"
      toast({ title: "Error", description: msg, variant: "destructive" })
    } finally { setSaving(false) }
  }

  // Update application status
  const updateApplicationStatus = async (applicationId: number, newStatus: Application['status']) => {
    // Store original status for rollback
    const originalStatus = applications.find(app => app.id === applicationId)?.status
    
    setUpdatingStatus(applicationId)
    
    // Optimistically update UI
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus }
          : app
      )
    )
    
    try {
      await applicationsApi.updateStatus(applicationId, newStatus)
      
      toast({
        title: "Success",
        description: `Application status updated to ${newStatus.replace('_', ' ')}`,
      })
    } catch (error: any) {
      console.error('Error updating application status:', error)
      
      // Rollback to original status on error
      if (originalStatus) {
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: originalStatus }
              : app
          )
        )
      }
      
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update application status"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  // Refresh applications
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchApplications()
    setRefreshing(false)
  }

  // Filter applications
  useEffect(() => {
    const filtered = applications.filter(app => {
      const matchesSearch = 
        String(app.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(app.student_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(app.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(app.job_title || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || app.status === statusFilter
      const matchesJobType = jobTypeFilter === "all" || app.job_type === jobTypeFilter
      
      return matchesSearch && matchesStatus && matchesJobType
    })
    
    setFilteredApplications(filtered)
  }, [applications, searchTerm, statusFilter, jobTypeFilter])

  // Load applications on component mount
  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  // Get status badge variant
  const getStatusBadgeVariant = (status: Application['status']) => {
    switch (status) {
      case 'selected':
        return 'default'
      case 'shortlisted':
        return 'secondary'
      case 'under_review':
        return 'outline'
      case 'rejected':
        return 'destructive'
      case 'pending':
      default:
        return 'secondary'
    }
  }

  // Get status icon
  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'selected':
        return <CheckCircle className="h-4 w-4" />
      case 'shortlisted':
        return <AlertCircle className="h-4 w-4" />
      case 'under_review':
        return <Clock className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      case 'pending':
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading applications...</span>
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
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">Error Loading Applications</h3>
            <p className="text-muted-foreground dark:text-white/60 mb-4">{error}</p>
            <Button onClick={fetchApplications}>
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white">Applications</h1>
          <p className="text-sm md:text-base text-muted-foreground dark:text-white/80">
            Manage and track all student applications for placements
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>Add application</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[85vh] p-0 overflow-hidden">
              <DialogHeader className="px-6 pt-6">
                <DialogTitle>Add Application</DialogTitle>
                <DialogDescription>Create a new application. Resume upload is supported.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 px-6 pb-6 overflow-y-auto max-h-[calc(85vh-64px-60px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Student</Label>
                    <div className="space-y-2">
                      <Input value={studentQuery} onChange={(e) => setStudentQuery(e.target.value)} placeholder="Search by name/email/roll no" />
                      <div className="max-h-40 overflow-auto border rounded">
                        {loadingStudents ? (
                          <div className="p-2 text-sm text-muted-foreground">Searching…</div>
                        ) : (
                          (studentOptions.length ? studentOptions : []).map((st: any) => {
                            const label = st.full_name || st.name || st.email || `Student #${st.id}`
                            const meta = st.roll_no || st.registration_no || st.email || ''
                            return (
                              <button key={`${st.id}-${meta}`} type="button" className={`w-full text-left px-3 py-2 text-sm hover:bg-accent ${String(form.student_id) === String(st.id) ? 'bg-accent' : ''}`} onClick={() => setForm({ ...form, student_id: String(st.id) })}>
                                <div className="font-medium">{label}</div>
                                <div className="text-xs text-muted-foreground">{meta}</div>
                              </button>
                            )
                          })
                        )}
                        {!loadingStudents && !studentOptions.length && (
                          <div className="p-2 text-sm text-muted-foreground">No students found</div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">Selected ID: {form.student_id || '—'}</div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Job</Label>
                    <div className="space-y-2">
                      <Input value={jobQuery} onChange={(e) => setJobQuery(e.target.value)} placeholder="Search jobs" />
                      <div className="max-h-40 overflow-auto border rounded">
                        {loadingJobs ? (
                          <div className="p-2 text-sm text-muted-foreground">Loading…</div>
                        ) : (
                          (jobOptions.length ? jobOptions : []).map((j: any) => (
                            <button key={j.id} type="button" className={`w-full text-left px-3 py-2 text-sm hover:bg-accent ${String(form.job_id) === String(j.id) ? 'bg-accent' : ''}`} onClick={() => setForm({ ...form, job_id: String(j.id) })}>
                              <div className="font-medium">{j.title}</div>
                              <div className="text-xs text-muted-foreground">{j.company?.name || `Job #${j.id}`}</div>
                            </button>
                          ))
                        )}
                        {!loadingJobs && !jobOptions.length && (
                          <div className="p-2 text-sm text-muted-foreground">No jobs found</div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">Selected Job ID: {form.job_id || '—'}</div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Drive (optional)</Label>
                    <div className="space-y-2">
                      <Input value={driveQuery} onChange={(e) => setDriveQuery(e.target.value)} placeholder="Search drives" />
                      <div className="max-h-40 overflow-auto border rounded">
                        {loadingDrives ? (
                          <div className="p-2 text-sm text-muted-foreground">Loading…</div>
                        ) : (
                          (driveOptions.length ? driveOptions : []).map((d: any) => (
                            <button key={d.id} type="button" className={`w-full text-left px-3 py-2 text-sm hover:bg-accent ${String(form.drive_id) === String(d.id) ? 'bg-accent' : ''}`} onClick={() => setForm({ ...form, drive_id: String(d.id) })}>
                              <div className="font-medium">{d.title || d.name || `Drive #${d.id}`}</div>
                              <div className="text-xs text-muted-foreground">{d.company?.name || ''}</div>
                            </button>
                          ))
                        )}
                        {!loadingDrives && !driveOptions.length && (
                          <div className="p-2 text-sm text-muted-foreground">No drives found</div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">Selected Drive ID: {form.drive_id || '—'}</div>
                    </div>
                  </div>
                  <div>
                    <Label>Resume</Label>
                    <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setForm({ ...form, resume: e.target.files?.[0] || null })} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Cover letter</Label>
                    <Textarea rows={3} value={form.cover_letter} onChange={(e) => setForm({ ...form, cover_letter: e.target.value })} />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APPLIED">Applied</SelectItem>
                        <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                        <SelectItem value="INTERVIEW">Interview</SelectItem>
                        <SelectItem value="OFFERED">Offered</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                        <SelectItem value="HIRED">Hired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Notes</Label>
                    <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter className="px-6 py-4 border-t bg-background sticky bottom-0">
                <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={saving || !form.student_id || !form.job_id}>{saving ? "Saving..." : "Create"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {applications.filter(app => app.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold">
                  {applications.filter(app => app.status === 'under_review').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Selected</p>
                <p className="text-2xl font-bold">
                  {applications.filter(app => app.status === 'selected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">
                  {applications.filter(app => app.status === 'rejected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name, email, company, or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="selected">Selected</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Applications ({filteredApplications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Company & Position</TableHead>
                  <TableHead>Course & CGPA</TableHead>
                  <TableHead>Application Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{application.student_name}</div>
                        <div className="text-sm text-muted-foreground">{application.student_email}</div>
                        {application.student_phone && (
                          <div className="text-sm text-muted-foreground">{application.student_phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{application.job_title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {application.company_name}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {application.job_type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{application.student_course}</div>
                        <div className="text-sm text-muted-foreground">{application.student_year}</div>
                        {application.student_cgpa && (
                          <div className="text-sm font-medium">CGPA: {application.student_cgpa}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(application.application_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(application.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(application.status)}
                        {application.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {application.resume_url && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        )}
                        <Select
                          value={application.status}
                          onValueChange={(value: Application['status']) => 
                            updateApplicationStatus(application.id, value)
                          }
                          disabled={updatingStatus === application.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="under_review">Under Review</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            <SelectItem value="selected">Selected</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        {updatingStatus === application.id && (
                          <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground dark:text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">No applications found</h3>
              <p className="text-muted-foreground dark:text-white/60">
                {searchTerm || statusFilter !== "all" || jobTypeFilter !== "all"
                  ? "Try adjusting your search terms or filters"
                  : applications.length === 0 
                    ? "No applications have been submitted yet"
                    : "No applications match your current filters"
                }
              </p>
              {applications.length === 0 && (
                <Button 
                  onClick={fetchApplications} 
                  className="mt-4"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
