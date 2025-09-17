import { Clock, Building2, Briefcase, GraduationCap, Users, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const getTypeColor = (type: string) => {
  switch (type) {
    case "company_registered":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
    case "job_posted":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
    case "application_received":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
    case "workshop_completed":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
    case "training_started":
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "company_registered":
      return Building2
    case "job_posted":
      return Briefcase
    case "application_received":
      return GraduationCap
    case "workshop_completed":
      return Users
    case "training_started":
      return BookOpen
    default:
      return Clock
  }
}

const formatTimeAgo = (timestamp: string) => {
  const now = new Date()
  const activityTime = new Date(timestamp)
  const diffInHours = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours} hours ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} days ago`
  return activityTime.toLocaleDateString()
}

export function RecentActivity() {
  const recentActivities: Array<{
    id: number
    type: string
    title: string
    description: string
    timestamp: string
  }> = []
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-4 md:pb-6">
        <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl text-foreground dark:text-white">
          <Clock className="h-5 w-5 md:h-6 md:w-6" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 md:space-y-5">
          {recentActivities.map((activity) => {
            const IconComponent = getTypeIcon(activity.type)
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg hover:bg-card-hover transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border"
              >
                <div className="p-2 md:p-3 rounded-full bg-muted/50 flex-shrink-0">
                  <IconComponent className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground dark:text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                    <p className="text-xs md:text-sm font-semibold text-foreground dark:text-white truncate">
                      {activity.title}
                    </p>
                    <Badge variant="secondary" className={`text-xs ${getTypeColor(activity.type)}`}>
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground dark:text-white/70 mb-2 leading-relaxed">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-white/50 font-medium">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}