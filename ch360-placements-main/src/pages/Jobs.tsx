import { useEffect, useMemo, useState } from "react"
import { Plus, Briefcase, MapPin, Building2, Clock, DollarSign, Users, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { jobsApi, companiesApi, type JobDto, type CompanyDto } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth"

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterExperience, setFilterExperience] = useState("all")
  const [jobs, setJobs] = useState<JobDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<JobDto | null>(null)
  const { toast } = useToast()
  const [companies, setCompanies] = useState<CompanyDto[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false)

  const formatINR = (value?: number | string) => {
    if (value === undefined || value === null || value === '') return '-'
    const num = typeof value === 'string' ? Number(value) : value
    if (Number.isNaN(num)) return '-'
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num)
  }

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        setError("")
        const data = await jobsApi.getAll()
        const normalized = Array.isArray(data) ? data : (data as any)?.results ?? []
        setJobs(normalized)
      } catch (err: any) {
        const serverDetail = err?.response?.data?.detail || err?.response?.data?.message || err?.response?.data?.error
        const status = err?.response?.status
        const msg = serverDetail || (status ? `Failed to load jobs (HTTP ${status})` : err?.message) || "Failed to load jobs"
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true)
        const data = await companiesApi.getAll()
        const normalized = Array.isArray(data) ? data : (data as any)?.results ?? []
        setCompanies(normalized)
      } catch (_) {
        setCompanies([])
      } finally {
        setLoadingCompanies(false)
      }
    }
    fetchCompanies()
  }, [])

  const filteredJobs = useMemo(() => {
    return jobs.filter((job: any) => {
      const title = (job.title || "").toString()
      const company = (job.company?.name || job.company_name || job.company || "").toString()
      const location = (job.location || "").toString()
      const type = (job.type || job.employment_type || "").toString()
      const experience = (job.experience || job.level || "").toString()
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === "all" || type === filterType
      const matchesExperience = filterExperience === "all" || experience === filterExperience
      return matchesSearch && matchesType && matchesExperience
    })
  }, [jobs, searchTerm, filterType, filterExperience])

  const jobTypes = useMemo(() => {
    const list = jobs.map((j: any) => (j.type || j.employment_type || "").toString()).filter(Boolean)
    return ["all", ...Array.from(new Set(list))]
  }, [jobs])
  const experienceLevels = useMemo(() => {
    const list = jobs.map((j: any) => (j.experience || j.level || "").toString()).filter(Boolean)
    return ["all", ...Array.from(new Set(list))]
  }, [jobs])

  const [form, setForm] = useState<any>({
    company_id: "",
    title: "",
    description: "",
    location: "",
    work_mode: "ONSITE",
    job_type: "INTERNSHIP",
    stipend: "",
    salary_min: "",
    salary_max: "",
    currency: "INR",
    skills: "",
    eligibility_criteria: "",
    application_deadline: "",
    openings: "1",
    is_active: true,
  })

  const resetForm = () => setForm({
    company_id: "",
    title: "",
    description: "",
    location: "",
    work_mode: "ONSITE",
    job_type: "INTERNSHIP",
    stipend: "",
    salary_min: "",
    salary_max: "",
    currency: "INR",
    skills: "",
    eligibility_criteria: "",
    application_deadline: "",
    openings: "1",
    is_active: true,
  })

  const handleCreate = async () => {
    try {
      setSaving(true)
      if (!form.company_id) {
        toast({ title: "Please select a company", variant: "destructive" })
        return
      }
      const deadlineValue = (form.application_deadline || '').trim()
      const deadlineDateOnly = deadlineValue
        ? (/^\d{4}-\d{2}-\d{2}$/.test(deadlineValue)
          ? deadlineValue
          : new Date(deadlineValue).toISOString().slice(0, 10))
        : undefined
      const payload: any = {
        company_id: Number(form.company_id) || form.company_id,
        company: Number(form.company_id) || form.company_id, // compatibility if backend expects `company`
        title: form.title,
        description: form.description,
        location: form.location || undefined,
        work_mode: form.work_mode || undefined,
        job_type: form.job_type || undefined,
        stipend: form.stipend ? Number(form.stipend) : undefined,
        salary_min: form.salary_min ? Number(form.salary_min) : undefined,
        salary_max: form.salary_max ? Number(form.salary_max) : undefined,
        currency: form.currency || undefined,
        skills: form.skills ? form.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        eligibility_criteria: form.eligibility_criteria || undefined,
        application_deadline: deadlineDateOnly,
        openings: form.openings ? Number(form.openings) : undefined,
        is_active: !!form.is_active,
      }
      const created = await jobsApi.create(payload)
      setJobs((prev) => [created as any, ...prev])
      toast({ title: "Job created" })
      setIsAddOpen(false)
      resetForm()
    } catch (err: any) {
      const server = err?.response?.data
      console.error('Job create error:', server || err)
      const detail = server?.detail || server?.non_field_errors?.join?.("\n") || JSON.stringify(server)
      toast({ title: "Failed to create job", description: detail || err?.message || "Validation error", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editing) return
    try {
      setSaving(true)
      const deadlineValue = (form.application_deadline || '').trim()
      const deadlineDateOnly = deadlineValue
        ? (/^\d{4}-\d{2}-\d{2}$/.test(deadlineValue)
          ? deadlineValue
          : new Date(deadlineValue).toISOString().slice(0, 10))
        : undefined
      const payload: any = {
        title: form.title,
        description: form.description,
        location: form.location || undefined,
        work_mode: form.work_mode || undefined,
        job_type: form.job_type || undefined,
        stipend: form.stipend ? Number(form.stipend) : undefined,
        salary_min: form.salary_min ? Number(form.salary_min) : undefined,
        salary_max: form.salary_max ? Number(form.salary_max) : undefined,
        currency: form.currency || undefined,
        skills: form.skills ? form.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        eligibility_criteria: form.eligibility_criteria || undefined,
        application_deadline: deadlineDateOnly,
        openings: form.openings ? Number(form.openings) : undefined,
        is_active: !!form.is_active,
      }
      const updated = await jobsApi.update(editing.id, payload)
      setJobs((prev) => prev.map((j) => (j.id === editing.id ? (updated as any) : j)))
      toast({ title: "Job updated" })
      setIsEditOpen(false)
      setEditing(null)
      resetForm()
    } catch (err: any) {
      toast({ title: "Failed to update job", description: err?.message || "", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await jobsApi.delete(id)
      setJobs((prev) => prev.filter((j) => j.id !== id))
      toast({ title: "Job deleted" })
    } catch (err: any) {
      toast({ title: "Failed to delete job", description: err?.message || "", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white">Job Openings</h1>
        <p className="text-sm md:text-base text-muted-foreground dark:text-white/80">
          Browse and manage all available job positions for students
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground dark:text-white"
          >
            {jobTypes.map(type => (
              <option key={type} value={type}>
                {type === "all" ? "All Types" : type}
              </option>
            ))}
          </select>
          <select
            value={filterExperience}
            onChange={(e) => setFilterExperience(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground dark:text-white"
          >
            {experienceLevels.map(exp => (
              <option key={exp} value={exp}>
                {exp === "all" ? "All Experience" : exp}
              </option>
            ))}
          </select>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Post Job
          </Button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading && <div className="col-span-full">Loading...</div>}
        {error && <div className="col-span-full text-red-600">{error}</div>}
        {filteredJobs.map((job: any) => (
          <Card key={job.id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-foreground dark:text-white mb-2">
                    {job.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-white/60 mb-2">
                    <Building2 className="h-4 w-4" />
                    <span>{job.company?.name || job.company || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-white/60">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location || '-'}</span>
                  </div>
                </div>
                <Badge variant="outline" className="ml-2">
                  {job.job_type || job.type || '-'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Briefcase className="h-4 w-4" />
                  <span>{job.job_type || job.type || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Clock className="h-4 w-4" />
                  <span>{job.experience || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <DollarSign className="h-4 w-4" />
                  <span>
                    {job.stipend ? `Stipend: ${formatINR(job.stipend)}` : (job.salary_min || job.salary_max
                      ? `${formatINR(job.salary_min)}${job.salary_min && job.salary_max ? ' - ' : ''}${job.salary_max ? formatINR(job.salary_max) : ''}`
                      : '-')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Users className="h-4 w-4" />
                  <span>{job.applications ?? 0} applications</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground dark:text-white/70 line-clamp-2">
                {job.description || '-'}
              </p>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground dark:text-white/50">
                  Updated: {job.updated_at || '-'}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { 
                    setEditing(job);
                    setForm({
                      company_id: String(job.company?.id || job.company_id || ''),
                      title: job.title || "",
                      description: job.description || "",
                      location: job.location || "",
                      work_mode: job.work_mode || "",
                      job_type: job.job_type || "",
                      stipend: job.stipend != null ? String(job.stipend) : "",
                      salary_min: job.salary_min != null ? String(job.salary_min) : "",
                      salary_max: job.salary_max != null ? String(job.salary_max) : "",
                      currency: job.currency || "INR",
                      skills: Array.isArray(job.skills) ? job.skills.join(", ") : (job.skills || ""),
                      eligibility_criteria: job.eligibility_criteria || "",
                      application_deadline: job.application_deadline ? String(job.application_deadline).slice(0,10) : "",
                      openings: job.openings != null ? String(job.openings) : "1",
                      is_active: job.is_active !== undefined ? !!job.is_active : true,
                    }); 
                    setIsEditOpen(true); 
                  }}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(job.id)}>Delete</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!loading && !error && filteredJobs.length === 0) && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground dark:text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">No jobs found</h3>
          <p className="text-muted-foreground dark:text-white/60">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Add Job</DialogTitle>
            <DialogDescription>Create a new job posting</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 px-6 pb-6 overflow-y-auto max-h-[calc(85vh-64px-60px)]">
            {/* Primary details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block">Company</Label>
                <Select value={form.company_id} onValueChange={(v) => setForm({ ...form, company_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCompanies ? "Loading companies..." : "Select company"} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name || c.company_name || `Company #${c.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block">Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Add job posting" />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-1 block">Description</Label>
                <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Role responsibilities, tech stack, perks..." />
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block">Location</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country or Remote" />
              </div>
              <div>
                <Label className="mb-1 block">Work mode</Label>
                <Select value={form.work_mode} onValueChange={(v) => setForm({ ...form, work_mode: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONSITE">On-site</SelectItem>
                    <SelectItem value="REMOTE">Remote</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block">Job type</Label>
                <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                    <SelectItem value="FULL_TIME">Full-time</SelectItem>
                    <SelectItem value="PART_TIME">Part-time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="TEMPORARY">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block">Stipend</Label>
                <Input value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} placeholder="e.g., 25000 / month" />
              </div>
              <div>
                <Label className="mb-1 block">Salary min</Label>
                <Input value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} placeholder="e.g., 600000" />
              </div>
              <div>
                <Label className="mb-1 block">Salary max</Label>
                <Input value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} placeholder="e.g., 1200000" />
              </div>
              <div>
                <Label className="mb-1 block">Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="md:col-span-2">
                  <Label className="mb-1 block">Skills (comma-separated)</Label>
                  <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="e.g., React, Node.js, SQL" />
                </div>
              </div>
              <div className="md:col-span-2">
                <Label className="mb-1 block">Eligibility criteria</Label>
                <Textarea rows={2} value={form.eligibility_criteria} onChange={(e) => setForm({ ...form, eligibility_criteria: e.target.value })} placeholder="e.g., CGPA ≥ 7, 2025 batch" />
              </div>
              <div>
                <Label className="mb-1 block">Application deadline</Label>
                <Input type="date" value={form.application_deadline} onChange={(e) => setForm({ ...form, application_deadline: e.target.value })} />
                <p className="text-xs text-muted-foreground mt-1">Times are saved in your local timezone.</p>
              </div>
              <div>
                <Label className="mb-1 block">Openings</Label>
                <Input type="number" min={1} value={form.openings} onChange={(e) => setForm({ ...form, openings: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input id="isActive" type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <Label htmlFor="isActive">Is active</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t bg-background sticky bottom-0">
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? "Saving..." : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) setEditing(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>Update job posting</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 pb-6 overflow-y-auto max-h-[calc(85vh-64px-60px)]">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1 block">Work mode</Label>
              <Select value={form.work_mode} onValueChange={(v) => setForm({ ...form, work_mode: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONSITE">On-site</SelectItem>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Job type</Label>
              <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  <SelectItem value="FULL_TIME">Full-time</SelectItem>
                  <SelectItem value="PART_TIME">Part-time</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="TEMPORARY">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Stipend (₹)</Label>
              <Input value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} placeholder="e.g., 25000" />
            </div>
            <div>
              <Label className="mb-1 block">Salary min (₹)</Label>
              <Input value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} placeholder="e.g., 600000" />
            </div>
            <div>
              <Label className="mb-1 block">Salary max (₹)</Label>
              <Input value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} placeholder="e.g., 1200000" />
            </div>
            <div>
              <Label className="mb-1 block">Currency</Label>
              <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Skills (comma-separated)</Label>
              <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-1 block">Eligibility criteria</Label>
              <Textarea rows={2} value={form.eligibility_criteria} onChange={(e) => setForm({ ...form, eligibility_criteria: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1 block">Application deadline</Label>
              <Input type="date" value={form.application_deadline} onChange={(e) => setForm({ ...form, application_deadline: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1 block">Openings</Label>
              <Input type="number" min={1} value={form.openings} onChange={(e) => setForm({ ...form, openings: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input id="isActiveEdit" type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              <Label htmlFor="isActiveEdit">Is active</Label>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t bg-background sticky bottom-0">
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={saving}>{saving ? "Saving..." : "Update"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}