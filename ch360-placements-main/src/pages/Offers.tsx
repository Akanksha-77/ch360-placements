import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { applicationsApi, offersApi, type ApplicationDto, type OfferDto } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function Offers() {
  const [applications, setApplications] = useState<ApplicationDto[]>([])
  const [offers, setOffers] = useState<OfferDto[]>([])
  const [loadingApps, setLoadingApps] = useState(false)
  const [loadingOffers, setLoadingOffers] = useState(false)
  const [appSearch, setAppSearch] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [open, setOpen] = useState(false)

  const [form, setForm] = useState<any>({
    application: "",
    offered_role: "",
    package_annual_ctc: "",
    joining_location: "",
    joining_date: "",
    status: "PENDING",
    notes: "",
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingApps(true)
        const data = await applicationsApi.getAll()
        setApplications(Array.isArray(data) ? data : (data as any)?.results ?? [])
      } catch (_) {
        setApplications([])
      } finally {
        setLoadingApps(false)
      }
    }
    const loadOffers = async () => {
      try {
        setLoadingOffers(true)
        const data = await offersApi.getAll()
        setOffers(Array.isArray(data) ? data : (data as any)?.results ?? [])
      } catch (_) {
        setOffers([])
      } finally {
        setLoadingOffers(false)
      }
    }
    load()
    loadOffers()
  }, [])

  const filteredApplications = useMemo(() => {
    const q = appSearch.trim().toLowerCase()
    if (!q) return applications
    return applications.filter((a: any) => {
      const student = (a.student?.name || a.student?.full_name || a.student?.email || "").toString().toLowerCase()
      const job = (a.job?.title || "").toString().toLowerCase()
      return student.includes(q) || job.includes(q) || String(a.id).includes(q)
    })
  }, [applications, appSearch])

  const formatINR = (v?: number | string) => {
    if (v === undefined || v === null || v === "") return "—"
    const n = typeof v === "string" ? Number(v) : v
    if (Number.isNaN(n)) return "—"
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
  }

  const createOffer = async () => {
    try {
      setSaving(true)
      setError("")
      const payload: Partial<OfferDto> = {
        application: Number(form.application) || form.application,
        offered_role: form.offered_role,
        package_annual_ctc: form.package_annual_ctc ? Number(form.package_annual_ctc) : 0,
        joining_location: form.joining_location || undefined,
        joining_date: form.joining_date || undefined,
        status: form.status || "PENDING",
        notes: form.notes || undefined,
      }
      const created = await offersApi.create(payload)
      setOffers(prev => [created as any, ...prev])
      setForm({
        application: "",
        offered_role: "",
        package_annual_ctc: "",
        joining_location: "",
        joining_date: "",
        status: "PENDING",
        notes: "",
      })
      setOpen(false)
    } catch (err: any) {
      const server = err?.response?.data
      const detail = server?.detail || server?.non_field_errors?.join?.("\n") || JSON.stringify(server)
      setError(detail || err?.message || "Failed to create offer")
    } finally {
      setSaving(false)
    }
  }

  const total = offers.length
  const accepted = offers.filter((o: any) => o.status === 'ACCEPTED').length
  const pending = offers.filter((o: any) => o.status === 'PENDING').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white">Offers</h1>
          <p className="text-sm md:text-base text-muted-foreground dark:text-white/80">Review and manage placement offers</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add offer</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[85vh] p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>Add Offer</DialogTitle>
              <DialogDescription>Create an offer for an application</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 px-6 pb-6 overflow-y-auto max-h-[calc(85vh-64px-60px)]">
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Application</Label>
                  <div className="space-y-2">
                    <Input value={appSearch} onChange={(e) => setAppSearch(e.target.value)} placeholder="Search by student, job or ID" />
                    <div className="max-h-48 overflow-auto border rounded">
                      {loadingApps ? (
                        <div className="p-2 text-sm text-muted-foreground">Loading applications…</div>
                      ) : (
                        filteredApplications.map((a: any) => {
                          const student = a.student?.name || a.student?.full_name || a.student?.email || `Student #${a.student?.id || ''}`
                          const job = a.job?.title || `Job #${a.job?.id || ''}`
                          const selected = String(form.application) === String(a.id)
                          return (
                            <button key={a.id} type="button" className={`w-full text-left px-3 py-2 text-sm hover:bg-accent ${selected ? 'bg-accent' : ''}`} onClick={() => setForm({ ...form, application: String(a.id) })}>
                              <div className="font-medium">{student}</div>
                              <div className="text-xs text-muted-foreground">{job} • ID: {a.id}</div>
                            </button>
                          )
                        })
                      )}
                      {!loadingApps && !filteredApplications.length && (
                        <div className="p-2 text-sm text-muted-foreground">No applications found</div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">Selected application ID: {form.application || '—'}</div>
                  </div>
                </div>
                <div>
                  <Label>Offered role</Label>
                  <Input value={form.offered_role} onChange={(e) => setForm({ ...form, offered_role: e.target.value })} />
                </div>
                <div>
                  <Label>Package annual CTC (₹)</Label>
                  <Input value={form.package_annual_ctc} onChange={(e) => setForm({ ...form, package_annual_ctc: e.target.value })} placeholder="Annual CTC" />
                </div>
                <div>
                  <Label>Joining location</Label>
                  <Input value={form.joining_location} onChange={(e) => setForm({ ...form, joining_location: e.target.value })} />
                </div>
                <div>
                  <Label>Joining date</Label>
                  <Input type="date" value={form.joining_date} onChange={(e) => setForm({ ...form, joining_date: e.target.value })} />
                  <p className="text-xs text-muted-foreground mt-1">Note: You are 5.5 hours ahead of server time.</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="ACCEPTED">Accepted</SelectItem>
                      <SelectItem value="DECLINED">Declined</SelectItem>
                      <SelectItem value="EXPIRED">Expired</SelectItem>
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
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={createOffer} disabled={saving || !form.application || !form.offered_role || !form.package_annual_ctc}>{saving ? "Saving..." : "Create offer"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pending</div>
            <div className="text-2xl font-bold">{pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Accepted</div>
            <div className="text-2xl font-bold">{accepted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Offers list */}
      <Card>
        <CardHeader>
          <CardTitle>Recent offers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Application</th>
                  <th className="py-2">Offered role</th>
                  <th className="py-2">Package</th>
                  <th className="py-2">Joining</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingOffers && (
                  <tr><td className="py-4" colSpan={5}>Loading…</td></tr>
                )}
                {!loadingOffers && offers.map((o: any) => (
                  <tr key={o.id} className="border-t">
                    <td className="py-2">#{o.application || '—'}</td>
                    <td className="py-2">{o.offered_role || '—'}</td>
                    <td className="py-2">{formatINR(o.package_annual_ctc)}</td>
                    <td className="py-2">{o.joining_date || '—'}</td>
                    <td className="py-2">
                      <Badge variant={o.status === 'ACCEPTED' ? 'default' : o.status === 'PENDING' ? 'secondary' : 'outline'}>{o.status || '—'}</Badge>
                    </td>
                  </tr>
                ))}
                {!loadingOffers && !offers.length && (
                  <tr><td className="py-6 text-muted-foreground" colSpan={5}>No offers yet. Click “Add offer” to create one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


