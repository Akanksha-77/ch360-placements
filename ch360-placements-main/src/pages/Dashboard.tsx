import { 
  Building2, 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  Users,
  TrendingUp,
  Calendar,
  Target
} from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { SessionTracker } from "@/components/session-tracker"

export default function Dashboard() {
  const statsData = {
    totalCompanies: 0,
    activeCompanies: 0,
    totalJobs: 0,
    openJobs: 0,
    totalInternships: 0,
    openInternships: 0,
    totalTrainings: 0,
    ongoingTrainings: 0,
    totalWorkshops: 0,
    upcomingWorkshops: 0,
    totalApplications: 0,
  }
  
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
      description: "Active programs",
    },
    {
      title: "Trainings",
      value: statsData.ongoingTrainings,
      change: `${statsData.totalTrainings} total`,
      changeType: "neutral" as const,
      icon: BookOpen,
      description: "Skill development",
    },
    {
      title: "Workshops",
      value: statsData.upcomingWorkshops,
      change: `${statsData.totalWorkshops} total`,
      changeType: "positive" as const,
      icon: Users,
      description: "Upcoming sessions",
    },
    {
      title: "Total Applications",
      value: statsData.totalApplications,
      change: "This month",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Student applications",
    },
    {
      title: "Upcoming Events",
      value: statsData.upcomingWorkshops + statsData.ongoingTrainings,
      change: "Next 30 days",
      changeType: "neutral" as const,
      icon: Calendar,
      description: "Scheduled activities",
    },
    {
      title: "Placement Rate",
      value: "87%",
      change: "On track",
      changeType: "positive" as const,
      icon: Target,
      description: "Success metric",
    },
  ]

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