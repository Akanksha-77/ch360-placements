import { 
  Building2, 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  Users,
  TrendingUp,
  Calendar,
  Target,
  RefreshCw
} from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { SessionTracker } from "@/components/session-tracker"
import { useQuery } from "@tanstack/react-query"
import { companiesApi, jobsApi, applicationsApi, statisticsApi } from "@/lib/api"

export default function Dashboard() {
  // Fetch real data from APIs
  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ["dashboard-companies"],
    queryFn: () => companiesApi.getAll(),
  })

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ["dashboard-jobs"],
    queryFn: () => jobsApi.getAll(),
  })

  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ["dashboard-applications"],
    queryFn: () => applicationsApi.getAll(),
  })

  const { data: statisticsData, isLoading: statisticsLoading } = useQuery({
    queryKey: ["dashboard-statistics"],
    queryFn: () => statisticsApi.getOverview(),
  })

  // Process data
  const companies = Array.isArray(companiesData) ? companiesData : (companiesData as any)?.results || []
  const jobs = Array.isArray(jobsData) ? jobsData : (jobsData as any)?.results || []
  const applications = Array.isArray(applicationsData) ? applicationsData : (applicationsData as any)?.results || []
  
  const internships = jobs.filter((job: any) => 
    job.job_type?.toLowerCase() === 'internship' || 
    job.title?.toLowerCase().includes('intern')
  )

  const statsData = {
    totalCompanies: companies.length,
    activeCompanies: companies.filter((c: any) => c.is_active).length,
    totalJobs: jobs.length,
    openJobs: jobs.filter((j: any) => j.is_active).length,
    totalInternships: internships.length,
    openInternships: internships.filter((i: any) => i.is_active).length,
    totalTrainings: 4, // Mock data from Trainings page
    ongoingTrainings: 2,
    totalWorkshops: 4, // Mock data from Workshops page
    upcomingWorkshops: 2,
    totalApplications: applications.length,
    placedStudents: applications.filter((a: any) => a.status === 'selected' || a.status === 'HIRED').length,
    placementRate: statisticsData?.overview?.placement_percentage || 0,
    averageSalary: statisticsData?.overview?.average_salary || 0,
  }
  
  const isLoading = companiesLoading || jobsLoading || applicationsLoading || statisticsLoading

  const stats = [
    {
      title: "Total Companies",
      value: statsData.totalCompanies,
      change: `${statsData.activeCompanies} active`,
      changeType: "positive" as const,
      icon: Building2,
      description: "Registered companies",
    },
    {
      title: "Job Openings",
      value: statsData.openJobs,
      change: `${statsData.totalJobs} total`,
      changeType: "positive" as const,
      icon: Briefcase,
      description: "Available positions",
    },
    {
      title: "Internships",
      value: statsData.openInternships,
      change: `${statsData.totalInternships} total`,
      changeType: "positive" as const,
      icon: GraduationCap,
      description: "Available internships",
    },
    {
      title: "Placement Rate",
      value: `${statsData.placementRate}%`,
      change: `${statsData.placedStudents} placed`,
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Overall placement percentage",
    },
    {
      title: "Applications",
      value: statsData.totalApplications,
      change: "This month",
      changeType: "positive" as const,
      icon: Target,
      description: "Student applications",
    },
    {
      title: "Avg Salary",
      value: `₹${(statsData.averageSalary / 100000).toFixed(1)}L`,
      change: "Package offered",
      changeType: "positive" as const,
      icon: Calendar,
      description: "Average salary package",
    },
    {
      title: "Upcoming Events",
      value: statsData.upcomingWorkshops + statsData.ongoingTrainings,
      change: "Next 30 days",
      changeType: "neutral" as const,
      icon: Calendar,
      description: "Scheduled activities",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground dark:text-white/80">
            Welcome back! Here's what's happening with placements today.
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading dashboard data...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground dark:text-white/80">
          Welcome back! Here's what's happening with placements today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            description={stat.description}
          />
        ))}
      </div>

      {/* Session Tracker - Temporary for testing */}
      <div className="mb-6">
        <SessionTracker />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Quick Actions - Spanning 1 column */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <QuickActions />
        </div>

        {/* Recent Activity - Spanning 2 columns */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}