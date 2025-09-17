import { useEffect, useMemo, useState } from "react"
import { Plus, Building2, MapPin, Users, Globe, Phone, Mail, ExternalLink, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

import { companiesApi, type CompanyDto } from "@/lib/api"
import { authService } from "@/lib/auth"

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterIndustry, setFilterIndustry] = useState("all")
  const [companies, setCompanies] = useState<CompanyDto[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    website: "",
    description: "",
    industry: "",
    headquarters: "",
    contact_email: "",
    contact_phone: "",
    company_size: "" as any,
    is_active: true,
  })

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true)
        setError("")
        // Ensure user is authenticated before calling protected endpoint
        if (!authService.isAuthenticated()) {
          setCompanies([])
          setError("Please log in to view companies.")
          return
        }

        // Pass conservative pagination params to reduce server load
        const data = await companiesApi.getAll()
        // Some backends wrap results: { results: [...] }
        const normalized = Array.isArray(data) ? data : (data as any)?.results ?? []
        setCompanies(normalized)
      } catch (err: any) {
        const serverDetail = err?.response?.data?.detail || err?.response?.data?.message || err?.response?.data?.error
        const status = err?.response?.status
        const msg = serverDetail || (status ? `Failed to load companies (HTTP ${status})` : err?.message) || "Failed to load companies"
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    fetchCompanies()
  }, [])

  const filteredCompanies = useMemo(() => {
    return companies.filter((company: any) => {
      const name = (company.name || company.company_name || "").toString()
      const location = (company.location || company.city || company.address || "").toString()
      const industry = (company.industry || company.sector || "").toString()
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesIndustry = filterIndustry === "all" || industry === filterIndustry
      return matchesSearch && matchesIndustry
    })
  }, [companies, searchTerm, filterIndustry])

  const industries = useMemo(() => {
    const list = companies.map((c: any) => (c.industry || c.sector || "").toString()).filter(Boolean)
    return ["all", ...Array.from(new Set(list))]
  }, [companies])

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).slice(0, 2)
    return parts.map(p => p[0]?.toUpperCase() || '').join('') || 'C'
  }

  const prettySize = (size?: string) => {
    if (!size) return '—'
    switch (size) {
      case 'STARTUP': return 'Startup'
      case 'SMALL': return 'Small'
      case 'MEDIUM': return 'Medium'
      case 'LARGE': return 'Large'
      case 'ENTERPRISE': return 'Enterprise'
      default: return size
    }
  }

  const hostnameFromUrl = (url?: string) => {
    if (!url) return '—'
    try {
      const href = url.startsWith('http') ? url : `https://${url}`
      const { hostname } = new URL(href)
      return hostname.replace(/^www\./, '')
    } catch {
      return url.replace('https://', '').replace('http://', '')
    }
  }

  const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white">Companies</h1>
        <p className="text-sm md:text-base text-muted-foreground dark:text-white/80">
          Manage and view all registered companies for campus recruitment
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search companies by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground dark:text-white"
          >
            {industries.map(industry => (
              <option key={industry} value={industry}>
                {industry === "all" ? "All Industries" : industry}
              </option>
            ))}
          </select>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Company</DialogTitle>
                <DialogDescription>Fill in the company details and click Save to add it.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="headquarters">Headquarters</Label>
                  <Input id="headquarters" value={form.headquarters} onChange={(e) => setForm({ ...form, headquarters: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Contact email</Label>
                  <Input id="email" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Contact phone</Label>
                  <Input id="phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company_size">Company size</Label>
                  <select id="company_size" className="px-3 py-2 border border-border rounded-md bg-background text-foreground dark:text-white" value={form.company_size}
                    onChange={(e) => setForm({ ...form, company_size: e.target.value as any })}>
                    <option value="">Select size</option>
                    <option value="STARTUP">STARTUP</option>
                    <option value="SMALL">SMALL</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LARGE">LARGE</option>
                    <option value="ENTERPRISE">ENTERPRISE</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button disabled={saving} onClick={async () => {
                  try {
                    setSaving(true)
                    setError("")
                    if (!authService.isAuthenticated()) {
                      setError("Please log in to add companies.")
                      return
                    }
                    // Map to backend fields
                    const payload: any = {
                      name: form.name,
                      website: form.website || undefined,
                      description: form.description || undefined,
                      industry: form.industry || undefined,
                      company_size: form.company_size || undefined,
                      headquarters: form.headquarters || undefined,
                      contact_email: form.contact_email || undefined,
                      contact_phone: form.contact_phone || undefined,
                      is_active: !!form.is_active,
                    }
                    const created = await companiesApi.create(payload)
                    // Optimistically prepend
                    setCompanies(prev => [created as any, ...prev])
                    setIsAddOpen(false)
                    setForm({ name: "", website: "", description: "", industry: "", headquarters: "", contact_email: "", contact_phone: "", company_size: "" as any, is_active: true })
                  } catch (err: any) {
                    const serverDetail = err?.response?.data?.detail || err?.response?.data?.message || JSON.stringify(err?.response?.data)
                    setError(serverDetail || err?.message || "Failed to create company")
                  } finally {
                    setSaving(false)
                  }
                }}>{saving ? "Saving..." : "Save"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Companies Grid */}
      {loading && (
        <div className="text-sm text-muted-foreground dark:text-white/80">Loading companies...</div>
      )}
      {error && !loading && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                      {getInitials(((company as any).name || (company as any).company_name || 'C') as string)}
                    </div>
                    <CardTitle className="text-lg text-foreground dark:text-white">
                      {(company as any).name || (company as any).company_name || "Unnamed Company"}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-white/60 mb-1">
                    <Building2 className="h-4 w-4" />
                    <span>{(company as any).industry || (company as any).sector || "—"}</span>
                    <span className="mx-1">•</span>
                    <span>{prettySize((company as any).company_size)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-white/60">
                    <MapPin className="h-4 w-4" />
                    <span>{(company as any).headquarters || (company as any).location || (company as any).city || (company as any).address || "—"}</span>
                  </div>
                </div>
                <Badge 
                  variant={(company as any).is_active === false ? "secondary" : "default"}
                  className="ml-2"
                >
                  {((company as any).is_active === false ? 'Inactive' : 'Active')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Users className="h-4 w-4" />
                  <span>{(company as any).total_placements != null ? `${(company as any).total_placements} placements` : '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Briefcase className="h-4 w-4" />
                  <span>{(company as any).total_drives != null ? `${(company as any).total_drives} drives` : `${((company as any).jobsPosted ?? (company as any).jobs_posted ?? 0)} jobs`}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Globe className="h-4 w-4" />
                  <a 
                    href={(company as any).website || (company as any).site || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-foreground dark:hover:text-white transition-colors"
                  >
                    {hostnameFromUrl(((company as any).website || (company as any).site) as string)}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Phone className="h-4 w-4" />
                  {((company as any).contact_phone || (company as any).phone) ? (
                    <a href={`tel:${(company as any).contact_phone || (company as any).phone}`} className="hover:text-foreground dark:hover:text-white transition-colors">
                      {(company as any).contact_phone || (company as any).phone}
                    </a>
                  ) : (
                    <span>—</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Mail className="h-4 w-4" />
                  {((company as any).contact_email || (company as any).email) ? (
                    <a href={`mailto:${(company as any).contact_email || (company as any).email}`} className="hover:text-foreground dark:hover:text-white transition-colors">
                      {(company as any).contact_email || (company as any).email}
                    </a>
                  ) : (
                    <span>—</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground dark:text-white/50">
                  Last visit: {formatDate((company as any).last_visit_date || (company as any).last_active)}
                </span>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && !error && filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground dark:text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">No companies found</h3>
          <p className="text-muted-foreground dark:text-white/60">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  )
}