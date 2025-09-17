import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { alumniApi, studentsApi } from "@/lib/api";

export default function Alumni() {
	const { data: stats } = useQuery({
		queryKey: ["alumni-network"],
		queryFn: () => alumniApi.getAlumniNetwork(),
	});
	const { data: listData, refetch } = useQuery({
		queryKey: ["alumni-list"],
		queryFn: () => alumniApi.getAll(),
	});
	const s = (stats as any)?.statistics || {};
	const list = (listData as any[]) || [];

	const [isAddOpen, setIsAddOpen] = useState(false)
	const [saving, setSaving] = useState(false)
	const [form, setForm] = useState<any>({
		student_id: "",
		current_company: "",
		current_designation: "",
		current_salary: "",
		current_location: "",
		total_experience_years: "",
		job_changes: "",
		pursuing_higher_studies: false,
		higher_studies_institution: "",
		higher_studies_program: "",
		is_entrepreneur: false,
		startup_name: "",
		startup_description: "",
		linkedin_profile: "",
		email: "",
		phone: "",
		willing_to_mentor: false,
		willing_to_recruit: false,
	})

	const [studentSearch, setStudentSearch] = useState("")
	const [studentOptions, setStudentOptions] = useState<any[]>([])
	const [loadingStudents, setLoadingStudents] = useState(false)

	useEffect(() => {
		const handler = setTimeout(async () => {
			try {
				setLoadingStudents(true)
				const res = await studentsApi.search(studentSearch)
				setStudentOptions(res as any[])
			} catch (_) {
				setStudentOptions([])
			} finally {
				setLoadingStudents(false)
			}
		}, 300)
		return () => clearTimeout(handler)
	}, [studentSearch])

	const resetForm = () => setForm({
		student_id: "",
		current_company: "",
		current_designation: "",
		current_salary: "",
		current_location: "",
		total_experience_years: "",
		job_changes: "",
		pursuing_higher_studies: false,
		higher_studies_institution: "",
		higher_studies_program: "",
		is_entrepreneur: false,
		startup_name: "",
		startup_description: "",
		linkedin_profile: "",
		email: "",
		phone: "",
		willing_to_mentor: false,
		willing_to_recruit: false,
	})

	const handleCreate = async () => {
		try {
			setSaving(true)
			const payload: any = {
				student_id: Number(form.student_id) || form.student_id,
				current_company: form.current_company || undefined,
				current_designation: form.current_designation || undefined,
				current_salary: form.current_salary ? Number(form.current_salary) : undefined,
				current_location: form.current_location || undefined,
				total_experience_years: form.total_experience_years ? Number(form.total_experience_years) : undefined,
				job_changes: form.job_changes ? Number(form.job_changes) : undefined,
				pursuing_higher_studies: !!form.pursuing_higher_studies,
				higher_studies_institution: form.higher_studies_institution || undefined,
				higher_studies_program: form.higher_studies_program || undefined,
				is_entrepreneur: !!form.is_entrepreneur,
				startup_name: form.startup_name || undefined,
				startup_description: form.startup_description || undefined,
				linkedin_profile: form.linkedin_profile || undefined,
				email: form.email || undefined,
				phone: form.phone || undefined,
				willing_to_mentor: !!form.willing_to_mentor,
				willing_to_recruit: !!form.willing_to_recruit,
			}
			await alumniApi.create(payload)
			setIsAddOpen(false)
			resetForm()
			await refetch()
		} catch (err) {
			console.error('Failed to create alumni placement', err)
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Total Alumni</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-bold">{s.total_alumni ?? '-'}</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Willing Mentors</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-bold">{s.willing_mentors ?? '-'}</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Willing Recruiters</CardTitle>
					</CardHeader>
					<CardContent className="text-2xl font-bold">{s.willing_recruiters ?? '-'}</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Alumni Directory</CardTitle>
						<Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
							<DialogTrigger asChild>
								<Button>Add alumni placement</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-3xl max-h-[85vh] p-0 overflow-hidden">
								<DialogHeader className="px-6 pt-6">
									<DialogTitle>Add Alumni Placement</DialogTitle>
									<DialogDescription>Fill student and current placement details</DialogDescription>
								</DialogHeader>
								<div className="grid gap-6 px-6 pb-6 overflow-y-auto max-h-[calc(85vh-64px-60px)]">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="md:col-span-2">
											<Label>Student</Label>
											<div className="space-y-2">
												<Input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} placeholder="Search by name, email or roll no" />
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
										<div>
											<Label>Current company</Label>
											<Input value={form.current_company} onChange={(e) => setForm({ ...form, current_company: e.target.value })} />
										</div>
										<div>
											<Label>Current designation</Label>
											<Input value={form.current_designation} onChange={(e) => setForm({ ...form, current_designation: e.target.value })} />
										</div>
										<div>
											<Label>Current salary (₹)</Label>
											<Input value={form.current_salary} onChange={(e) => setForm({ ...form, current_salary: e.target.value })} placeholder="e.g., 1200000" />
										</div>
										<div>
											<Label>Current location</Label>
											<Input value={form.current_location} onChange={(e) => setForm({ ...form, current_location: e.target.value })} />
										</div>
										<div>
											<Label>Total experience years</Label>
											<Input type="number" step="0.1" value={form.total_experience_years} onChange={(e) => setForm({ ...form, total_experience_years: e.target.value })} placeholder="e.g., 2.5" />
										</div>
										<div>
											<Label>Job changes</Label>
											<Input type="number" value={form.job_changes} onChange={(e) => setForm({ ...form, job_changes: e.target.value })} placeholder="e.g., 1" />
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="flex items-center gap-2">
											<input id="pursuingHS" type="checkbox" checked={form.pursuing_higher_studies} onChange={(e) => setForm({ ...form, pursuing_higher_studies: e.target.checked })} />
											<Label htmlFor="pursuingHS">Pursuing higher studies</Label>
										</div>
										<div className="flex items-center gap-2">
											<input id="isEntrepreneur" type="checkbox" checked={form.is_entrepreneur} onChange={(e) => setForm({ ...form, is_entrepreneur: e.target.checked })} />
											<Label htmlFor="isEntrepreneur">Is entrepreneur</Label>
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label>Higher studies institution</Label>
											<Input value={form.higher_studies_institution} onChange={(e) => setForm({ ...form, higher_studies_institution: e.target.value })} />
										</div>
										<div>
											<Label>Higher studies program</Label>
											<Input value={form.higher_studies_program} onChange={(e) => setForm({ ...form, higher_studies_program: e.target.value })} />
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label>Startup name</Label>
											<Input value={form.startup_name} onChange={(e) => setForm({ ...form, startup_name: e.target.value })} />
										</div>
										<div>
											<Label>Linkedin profile</Label>
											<Input value={form.linkedin_profile} onChange={(e) => setForm({ ...form, linkedin_profile: e.target.value })} placeholder="https://linkedin.com/in/…" />
										</div>
										<div className="md:col-span-2">
											<Label>Startup description</Label>
											<Textarea rows={2} value={form.startup_description} onChange={(e) => setForm({ ...form, startup_description: e.target.value })} />
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label>Email</Label>
											<Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
										</div>
										<div>
											<Label>Phone</Label>
											<Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="flex items-center gap-2">
											<input id="willingMentor" type="checkbox" checked={form.willing_to_mentor} onChange={(e) => setForm({ ...form, willing_to_mentor: e.target.checked })} />
											<Label htmlFor="willingMentor">Willing to mentor</Label>
										</div>
										<div className="flex items-center gap-2">
											<input id="willingRecruit" type="checkbox" checked={form.willing_to_recruit} onChange={(e) => setForm({ ...form, willing_to_recruit: e.target.checked })} />
											<Label htmlFor="willingRecruit">Willing to recruit</Label>
										</div>
									</div>
								</div>
								<DialogFooter className="px-6 py-4 border-t bg-background sticky bottom-0">
									<Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
									<Button onClick={handleCreate} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{list.map((a: any) => (
							<div key={a.id} className="border rounded p-3 space-y-1">
								<div className="font-semibold">{a.name}</div>
								<div className="text-sm text-muted-foreground">{a.role || '-'} @ {a.company || '-'}</div>
								<div className="text-xs text-muted-foreground">Graduation: {a.year_of_graduation || '-'}</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}


