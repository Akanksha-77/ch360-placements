import { authService } from './auth';

// Export the configured axios instance from auth service
export const api = authService.getAxiosInstance();

// Placements API base (relative to API_BASE_URL in auth service)
// Use only explicit env. If not set, we default to mock mode to avoid noisy 404s.
const PLACEMENTS_BASE = (import.meta as any)?.env?.VITE_PLACEMENTS_BASE || '';

// Fallback candidates to handle different backends without local env changes
const PLACEMENTS_BASE_CANDIDATES: string[] = Array.from(new Set([PLACEMENTS_BASE])).filter(Boolean) as string[];

// Cache resolved base to avoid repeated failing requests
let resolvedPlacementsBase: string | null = null;
let backendUnavailable = false;

async function ensureResolvedBase(): Promise<string | null> {
  if (resolvedPlacementsBase) return resolvedPlacementsBase;
  if (PLACEMENTS_BASE_CANDIDATES.length === 0) {
    backendUnavailable = true;
    return null;
  }
  resolvedPlacementsBase = PLACEMENTS_BASE_CANDIDATES[0].replace(/\/$/, '');
  return resolvedPlacementsBase;
}

// Mock data for when backend is unavailable
const MOCK_JOBS = [
  {
    id: 1,
    title: "Software Engineer",
    company: { id: 1, name: "Tech Corp" },
    location: "Bangalore",
    job_type: "FULL_TIME",
    salary_min: 800000,
    salary_max: 1200000,
    description: "Full-stack development role",
    is_active: true,
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    title: "Data Analyst",
    company: { id: 2, name: "Data Solutions" },
    location: "Mumbai",
    job_type: "FULL_TIME",
    salary_min: 600000,
    salary_max: 900000,
    description: "Data analysis and visualization",
    is_active: true,
    created_at: "2024-01-16T10:00:00Z"
  }
];

const MOCK_COMPANIES = [
  {
    id: 1,
    name: "Tech Corp",
    website: "https://techcorp.com",
    industry: "Technology",
    company_size: "LARGE",
    headquarters: "Bangalore",
    contact_email: "hr@techcorp.com",
    is_active: true,
    rating: 4.5,
    total_placements: 25,
    created_at: "2024-01-01T10:00:00Z"
  },
  {
    id: 2,
    name: "Data Solutions",
    website: "https://datasolutions.com",
    industry: "Data Analytics",
    company_size: "MEDIUM",
    headquarters: "Mumbai",
    contact_email: "careers@datasolutions.com",
    is_active: true,
    rating: 4.2,
    total_placements: 15,
    created_at: "2024-01-02T10:00:00Z"
  }
];

const MOCK_APPLICATIONS = [
  {
    id: 101,
    student_id: 1,
    job_id: 1,
    status: 'APPLIED',
    notes: 'Mock application',
    applied_at: '2024-01-20T10:00:00Z',
    student: { id: 1, name: 'John Doe', email: 'john@example.com' },
    job: MOCK_JOBS[0],
  },
  {
    id: 102,
    student_id: 2,
    job_id: 2,
    status: 'UNDER_REVIEW',
    notes: null,
    applied_at: '2024-01-21T10:00:00Z',
    student: { id: 2, name: 'Priya Sharma', email: 'priya@example.com' },
    job: MOCK_JOBS[1],
  },
];

const MOCK_OFFERS = [
  {
    id: 201,
    application: 101,
    offered_role: 'Software Engineer',
    package_annual_ctc: 1200000,
    joining_location: 'Bangalore',
    joining_date: '2024-08-01',
    status: 'PENDING',
    notes: 'Mock offer',
    offered_at: '2024-03-01T10:00:00Z',
  },
];

// Try a list of URLs and return the first successful response's data
async function apiGetFirst<T>(paths: string[], tail: string, config?: any): Promise<T> {
  let lastErr: any = null;
  let hasBackend = false;

  // Resolve base once and use it
  const preferred = await ensureResolvedBase();
  if (!preferred) {
    // No backend detected: return mocks immediately to avoid any failing requests
    if (tail.includes('jobs')) {
      console.info('📊 Using mock jobs data (backend unavailable)');
      return MOCK_JOBS as T;
    }
    if (tail.includes('companies')) {
      console.info('🏢 Using mock companies data (backend unavailable)');
      return MOCK_COMPANIES as T;
    }
  }
  const tryList = preferred ? [preferred] : paths;

  for (const base of tryList) {
    try {
      const full = `${base.replace(/\/$/, '')}/${tail.replace(/^\//, '')}`;
      const data = await apiGet<T>(full, config);
      hasBackend = true;
      resolvedPlacementsBase = base.replace(/\/$/, '');
      return data;
    } catch (e: any) {
      lastErr = e;
      const status = e?.response?.status;
      if (status === 401) break;
      continue;
    }
  }
  
  // If all paths failed, return mock data for common endpoints
  if (tail.includes('jobs')) {
    if (!hasBackend) {
      console.info('📊 Using mock jobs data (backend unavailable)');
    }
    return MOCK_JOBS as T;
  }
  if (tail.includes('companies')) {
    if (!hasBackend) {
      console.info('🏢 Using mock companies data (backend unavailable)');
    }
    return MOCK_COMPANIES as T;
  }
  if (tail.includes('applications')) {
    if (!hasBackend) {
      console.info('📄 Using mock applications data (backend unavailable)');
    }
    return (Array.isArray(MOCK_APPLICATIONS) ? MOCK_APPLICATIONS : { results: MOCK_APPLICATIONS }) as T;
  }
  if (tail.includes('offers')) {
    if (!hasBackend) {
      console.info('🎯 Using mock offers data (backend unavailable)');
    }
    return (Array.isArray(MOCK_OFFERS) ? MOCK_OFFERS : { results: MOCK_OFFERS }) as T;
  }
  
  throw lastErr || new Error('All API base paths failed');
}

// Generic cursor pagination envelope
export interface CursorPage<T> {
  next: string | null;
  previous: string | null;
  results: T[];
}

// Helper: detect File/Blob for multipart
const isFileLike = (v: unknown) =>
  (typeof File !== 'undefined' && v instanceof File) ||
  (typeof Blob !== 'undefined' && v instanceof Blob);

// Helper function to make authenticated API calls
export const makeAuthenticatedRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: any,
  config?: any
): Promise<T> => {
  try {
    const response = await api.request({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Convenience methods
export const apiGet = <T>(url: string, config?: any) => 
  makeAuthenticatedRequest<T>('GET', url, undefined, config);

export const apiPost = <T>(url: string, data?: any, config?: any) => 
  makeAuthenticatedRequest<T>('POST', url, data, config);

export const apiPut = <T>(url: string, data?: any, config?: any) => 
  makeAuthenticatedRequest<T>('PUT', url, data, config);

export const apiDelete = <T>(url: string, config?: any) => 
  makeAuthenticatedRequest<T>('DELETE', url, undefined, config);

export const apiPatch = <T>(url: string, data?: any, config?: any) => 
  makeAuthenticatedRequest<T>('PATCH', url, data, config);

// =========
// Companies API
// =========
export type CompanySize = 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';
export interface CompanyDto {
  id: number;
  name: string;
  website?: string;
  description?: string;
  industry?: string;
  company_size?: CompanySize | null;
  headquarters?: string;
  contact_email?: string;
  contact_phone?: string;
  last_visit_date?: string | null;
  is_active?: boolean;
  rating?: number;
  total_placements?: number;
  total_drives?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export const companiesApi = {
  // Cursor-aware list
  list: (cursor?: string | null, params?: Record<string, any>) =>
    apiGetFirst<CursorPage<CompanyDto>>(PLACEMENTS_BASE_CANDIDATES, `companies/${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`, { params }),
  // Convenience: first page results array (keeps existing pages working)
  getAll: async (config?: any) => {
    const data = await apiGetFirst<any>(PLACEMENTS_BASE_CANDIDATES, 'companies/', config);
    if (Array.isArray(data)) return data as CompanyDto[];
    if (data && Array.isArray(data.results)) return data.results as CompanyDto[];
    return [] as CompanyDto[];
  },
  getById: (id: number | string) => apiGetFirst<CompanyDto>(PLACEMENTS_BASE_CANDIDATES, `companies/${id}/`),
  create: (data: Partial<CompanyDto>) => apiPost<CompanyDto>(`${PLACEMENTS_BASE}/companies/`, data),
  update: (id: number | string, data: Partial<CompanyDto>) => apiPatch<CompanyDto>(`${PLACEMENTS_BASE}/companies/${id}/`, data),
  delete: (id: number | string) => apiDelete<void>(`${PLACEMENTS_BASE}/companies/${id}/`),
  getStatistics: (id: number | string) => apiGetFirst<any>(PLACEMENTS_BASE_CANDIDATES, `companies/${id}/statistics/`),
};

// =========
// Jobs API
// =========
export type WorkMode = 'ONSITE' | 'REMOTE' | 'HYBRID';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' | 'TEMPORARY';
export interface JobDto {
  id: number;
  company_id?: number; // write
  company?: CompanyDto; // read
  title: string;
  description: string;
  location?: string;
  work_mode?: WorkMode | null;
  job_type?: JobType | null;
  stipend?: number | null;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string | null;
  skills?: string[];
  eligibility_criteria?: string | null;
  application_deadline?: string | null;
  openings?: number | null;
  is_active?: boolean;
  posted_by?: any;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export const jobsApi = {
  list: (cursor?: string | null, params?: Record<string, any>) =>
    apiGetFirst<CursorPage<JobDto>>(PLACEMENTS_BASE_CANDIDATES, `jobs/${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`, { params }),
  getAll: async (config?: any) => {
    const data = await apiGetFirst<any>(PLACEMENTS_BASE_CANDIDATES, 'jobs/', config);
    if (Array.isArray(data)) return data as JobDto[];
    if (data && Array.isArray(data.results)) return data.results as JobDto[];
    return [] as JobDto[];
  },
  getById: (id: number | string) => apiGetFirst<JobDto>(PLACEMENTS_BASE_CANDIDATES, `jobs/${id}/`),
  create: (data: Partial<JobDto>) => apiPost<JobDto>(`${PLACEMENTS_BASE}/jobs/`, data),
  update: (id: number | string, data: Partial<JobDto>) => apiPatch<JobDto>(`${PLACEMENTS_BASE}/jobs/${id}/`, data),
  delete: (id: number | string) => apiDelete<void>(`${PLACEMENTS_BASE}/jobs/${id}/`),
  getApplications: (id: number | string) => apiGet<any>(`${PLACEMENTS_BASE}/jobs/${id}/applications/`),
};

// =========
// Applications API
// =========
export type ApplicationStatus = 'APPLIED' | 'UNDER_REVIEW' | 'INTERVIEW' | 'OFFERED' | 'REJECTED' | 'WITHDRAWN' | 'HIRED';
export interface ApplicationDto {
  id: number;
  student_id: number;
  job_id: number;
  drive_id?: number | null;
  resume?: any;
  cover_letter?: string | null;
  status?: ApplicationStatus;
  notes?: string | null;
  student?: any; // read nested
  job?: JobDto; // read nested
  applied_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export const applicationsApi = {
  getAll: async (config?: any) => {
    const data = await apiGet<any>(`${PLACEMENTS_BASE}/applications/`, config);
    if (Array.isArray(data)) return data as ApplicationDto[];
    if (data && Array.isArray(data.results)) return data.results as ApplicationDto[];
    return [] as ApplicationDto[];
  },
  getById: (id: number | string) => apiGet<ApplicationDto>(`${PLACEMENTS_BASE}/applications/${id}/`),
  create: (data: Partial<ApplicationDto>) => {
    // If resume file present, send multipart/form-data
    if (data && data.resume && isFileLike(data.resume)) {
      const form = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (Array.isArray(v)) {
          v.forEach((vv) => form.append(`${k}[]`, String(vv)));
        } else {
          form.append(k, v as any);
        }
      });
      return apiPost<ApplicationDto>(`${PLACEMENTS_BASE}/applications/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return apiPost<ApplicationDto>(`${PLACEMENTS_BASE}/applications/`, data);
  },
  update: (id: number | string, data: Partial<ApplicationDto>) => apiPatch<ApplicationDto>(`${PLACEMENTS_BASE}/applications/${id}/`, data),
  delete: (id: number | string) => apiDelete<void>(`${PLACEMENTS_BASE}/applications/${id}/`),
  // Back-compat for existing Applications page: map UI statuses to API
  updateStatus: (id: number | string, uiStatus: string) => {
    const map: Record<string, ApplicationStatus> = {
      pending: 'APPLIED',
      under_review: 'UNDER_REVIEW',
      shortlisted: 'INTERVIEW',
      selected: 'HIRED',
      rejected: 'REJECTED',
    };
    const status = map[uiStatus] || 'UNDER_REVIEW';
    return apiPatch<ApplicationDto>(`${PLACEMENTS_BASE}/applications/${id}/`, { status });
  },
};

// =========
// Placement Drives API
// =========
export type DriveType = 'CAMPUS' | 'POOL' | 'VIRTUAL';
export interface DriveDto {
  id: number;
  company_id?: number; // write
  company?: CompanyDto; // read
  title: string;
  description?: string | null;
  drive_type?: DriveType | null;
  venue?: string | null;
  start_date: string;
  end_date?: string | null;
  min_cgpa?: number | null;
  max_backlogs_allowed?: number | null;
  batch_year?: number | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export const drivesApi = {
  getAll: async (config?: any) => {
    const data = await apiGet<any>(`${PLACEMENTS_BASE}/drives/`, config);
    if (Array.isArray(data)) return data as DriveDto[];
    if (data && Array.isArray(data.results)) return data.results as DriveDto[];
    return [] as DriveDto[];
  },
  getById: (id: number | string) => apiGet<DriveDto>(`${PLACEMENTS_BASE}/drives/${id}/`),
  create: (data: Partial<DriveDto>) => apiPost<DriveDto>(`${PLACEMENTS_BASE}/drives/`, data),
  update: (id: number | string, data: Partial<DriveDto>) => apiPatch<DriveDto>(`${PLACEMENTS_BASE}/drives/${id}/`, data),
  delete: (id: number | string) => apiDelete<void>(`${PLACEMENTS_BASE}/drives/${id}/`),
};

// =========
// Interview Rounds API
// =========
export type RoundType = 'APTITUDE' | 'TECH_TEST' | 'GD' | 'TECH_INTERVIEW' | 'HR_INTERVIEW' | 'OTHER';
export interface RoundDto {
  id: number;
  drive: number; // serializer expects numeric id field named drive
  name: string;
  round_type?: RoundType | null;
  scheduled_at?: string | null;
  location?: string | null;
  instructions?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export const roundsApi = {
  getAll: async (config?: any) => {
    const data = await apiGet<any>(`${PLACEMENTS_BASE}/rounds/`, config);
    if (Array.isArray(data)) return data as RoundDto[];
    if (data && Array.isArray(data.results)) return data.results as RoundDto[];
    return [] as RoundDto[];
  },
  getById: (id: number | string) => apiGet<RoundDto>(`${PLACEMENTS_BASE}/rounds/${id}/`),
  create: (data: Partial<RoundDto>) => apiPost<RoundDto>(`${PLACEMENTS_BASE}/rounds/`, data),
  update: (id: number | string, data: Partial<RoundDto>) => apiPatch<RoundDto>(`${PLACEMENTS_BASE}/rounds/${id}/`, data),
  delete: (id: number | string) => apiDelete<void>(`${PLACEMENTS_BASE}/rounds/${id}/`),
};

// =========
// Offers API
// =========
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
export interface OfferDto {
  id: number;
  application: number; // numeric id
  offered_role: string;
  package_annual_ctc: number;
  joining_location?: string | null;
  joining_date?: string | null;
  status?: OfferStatus;
  notes?: string | null;
  offered_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export const offersApi = {
  getAll: async (config?: any) => {
    const data = await apiGet<any>(`${PLACEMENTS_BASE}/offers/`, config);
    if (Array.isArray(data)) return data as OfferDto[];
    if (data && Array.isArray(data.results)) return data.results as OfferDto[];
    return [] as OfferDto[];
  },
  getById: (id: number | string) => apiGet<OfferDto>(`${PLACEMENTS_BASE}/offers/${id}/`),
  create: (data: Partial<OfferDto>) => apiPost<OfferDto>(`${PLACEMENTS_BASE}/offers/`, data),
  update: (id: number | string, data: Partial<OfferDto>) => apiPatch<OfferDto>(`${PLACEMENTS_BASE}/offers/${id}/`, data),
  delete: (id: number | string) => apiDelete<void>(`${PLACEMENTS_BASE}/offers/${id}/`),
};

// =========
// Statistics API (NEW)
// =========
export interface StatisticsDto {
  id: number;
  academic_year: string;
  department_id: number;
  program_id: number;
  total_students?: number;
  eligible_students?: number;
  placed_students?: number;
  average_salary?: number;
  highest_salary?: number;
  lowest_salary?: number;
  total_companies_visited?: number;
  total_job_offers?: number;
  students_higher_studies?: number;
  students_entrepreneurship?: number;
  placement_percentage?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export const statisticsApi = {
  getAll: async (config?: any) => {
    const data = await apiGet<any>(`${PLACEMENTS_BASE}/statistics/`, config);
    if (Array.isArray(data)) return data as StatisticsDto[];
    if (data && Array.isArray(data.results)) return data.results as StatisticsDto[];
    return [] as StatisticsDto[];
  },
  getById: (id: number | string) => apiGet<StatisticsDto>(`${PLACEMENTS_BASE}/statistics/${id}/`),
  create: (data: Partial<StatisticsDto>) => apiPost<StatisticsDto>(`${PLACEMENTS_BASE}/statistics/`, data),
  update: (id: number | string, data: Partial<StatisticsDto>) => apiPatch<StatisticsDto>(`${PLACEMENTS_BASE}/statistics/${id}/`, data),
  delete: (id: number | string) => apiDelete<void>(`${PLACEMENTS_BASE}/statistics/${id}/`),
  getOverview: () => apiGet<any>(`${PLACEMENTS_BASE}/statistics/overview/`),
};

// =========
// Company Feedback API (NEW)
// =========
export interface FeedbackDto {
  id: number;
  company_id: number; // write
  drive_id: number; // write
  overall_rating: number;
  student_quality_rating: number;
  process_rating?: number;
  infrastructure_rating?: number;
  positive_feedback?: string;
  areas_for_improvement?: string;
  suggestions?: string;
  would_visit_again?: boolean;
  feedback_by?: string;
  feedback_by_designation?: string;
  company?: CompanyDto; // read
  drive?: DriveDto; // read
  created_at?: string;
  [key: string]: any;
}

export const feedbacksApi = {
  getAll: async (config?: any) => {
    const data = await apiGet<any>(`${PLACEMENTS_BASE}/feedbacks/`, config);
    if (Array.isArray(data)) return data as FeedbackDto[];
    if (data && Array.isArray(data.results)) return data.results as FeedbackDto[];
    return [] as FeedbackDto[];
  },
  getById: (id: number | string) => apiGet<FeedbackDto>(`${PLACEMENTS_BASE}/feedbacks/${id}/`),
  create: (data: Partial<FeedbackDto>) => apiPost<FeedbackDto>(`${PLACEMENTS_BASE}/feedbacks/`, data),
  update: (id: number | string, data: Partial<FeedbackDto>) => apiPatch<FeedbackDto>(`${PLACEMENTS_BASE}/feedbacks/${id}/`, data),
  delete: (id: number | string) => apiDelete<void>(`${PLACEMENTS_BASE}/feedbacks/${id}/`),
};

// =========
// Document Management API (NEW)
// =========
export type DocumentType = 'MOU' | 'AGREEMENT' | 'OFFER_LETTER' | 'JOINING_LETTER' | 'VERIFICATION' | 'OTHER';
export interface DocumentDto {
  id: number;
  document_type: DocumentType;
  title: string;
  description?: string | null;
  file: any; // File upload
  company_id?: number | null;
  student_id?: number | null;
  drive_id?: number | null;
  document_date: string;
  expiry_date?: string | null;
  is_active?: boolean;
  created_by?: any;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export const documentsApi = {
  getAll: async (config?: any) => {
    const data = await apiGet<any>(`${PLACEMENTS_BASE}/documents/`, config);
    if (Array.isArray(data)) return data as DocumentDto[];
    if (data && Array.isArray(data.results)) return data.results as DocumentDto[];
    return [] as DocumentDto[];
  },
  getById: (id: number | string) => apiGet<DocumentDto>(`${PLACEMENTS_BASE}/documents/${id}/`),
  create: (data: Partial<DocumentDto>) => {
    const form = new FormData();
    Object.entries(data || {}).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      form.append(k, v as any);
    });
    return apiPost<DocumentDto>(`${PLACEMENTS_BASE}/documents/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id: number | string, data: Partial<DocumentDto>) => {
    const form = new FormData();
    Object.entries(data || {}).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      form.append(k, v as any);
    });
    return apiPatch<DocumentDto>(`${PLACEMENTS_BASE}/documents/${id}/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: number | string) => apiDelete<void>(`${PLACEMENTS_BASE}/documents/${id}/`),
};

// =========
// Alumni Network API (NEW)
// =========
export interface AlumniDto {
  id: number;
  student_id: number;
  current_company?: string | null;
  current_designation?: string | null;
  current_salary?: number | null;
  current_location?: string | null;
  total_experience_years?: number | null;
  job_changes?: number | null;
  pursuing_higher_studies?: boolean;
  is_entrepreneur?: boolean;
  higher_studies_institution?: string | null;
  higher_studies_program?: string | null;
  startup_name?: string | null;
  startup_description?: string | null;
  linkedin_profile?: string | null;
  email?: string | null;
  phone?: string | null;
  willing_to_mentor?: boolean;
  willing_to_recruit?: boolean;
  student?: any;
  last_updated?: string;
  created_at?: string;
  [key: string]: any;
}

export const alumniApi = {
  getAll: async (config?: any) => {
    const data = await apiGet<any>(`${PLACEMENTS_BASE}/alumni/`, config);
    if (Array.isArray(data)) return data as AlumniDto[];
    if (data && Array.isArray(data.results)) return data.results as AlumniDto[];
    return [] as AlumniDto[];
  },
  getById: (id: number | string) => apiGet<AlumniDto>(`${PLACEMENTS_BASE}/alumni/${id}/`),
  create: (data: Partial<AlumniDto>) => apiPost<AlumniDto>(`${PLACEMENTS_BASE}/alumni/`, data),
  update: (id: number | string, data: Partial<AlumniDto>) => apiPatch<AlumniDto>(`${PLACEMENTS_BASE}/alumni/${id}/`, data),
  delete: (id: number | string) => apiDelete<void>(`${PLACEMENTS_BASE}/alumni/${id}/`),
  getAlumniNetwork: () => apiGet<any>(`${PLACEMENTS_BASE}/alumni/alumni-network/`),
};

// =========
// Analytics & Reporting API (NEW)
// =========
export const analyticsApi = {
  getTrends: (years?: string[]) => apiGet<any>(`${PLACEMENTS_BASE}/analytics/trends/${
    years && years.length ? `?${years.map(y => `years=${encodeURIComponent(y)}`).join('&')}` : ''
  }`),
  getNirfReport: () => apiGet<any>(`${PLACEMENTS_BASE}/analytics/nirf-report/`),
};

// =========
// Students (search-only helper)
// =========
export interface StudentDto {
  id: number;
  name?: string;
  full_name?: string;
  email?: string;
  roll_no?: string;
  registration_no?: string;
  [key: string]: any;
}

export const studentsApi = {
  // Tries placements students first, then common users path as fallback
  search: async (query: string) => {
    const tryPaths = [
      `${PLACEMENTS_BASE}/students/`,
      `/api/v1/users/students/`,
      `/api/students/`,
    ];
    let lastErr: any = null;
    for (const path of tryPaths) {
      try {
        const data = await api.get(path, { params: query ? { search: query } : {} }).then(r => r.data);
        const arr = Array.isArray(data) ? data : (data?.results ?? []);
        return arr as StudentDto[];
      } catch (e: any) {
        lastErr = e;
        continue;
      }
    }
    if (lastErr) throw lastErr;
    return [] as StudentDto[];
  },
};

