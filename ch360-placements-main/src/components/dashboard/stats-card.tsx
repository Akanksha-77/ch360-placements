import { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  description?: string
  className?: string
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("hover:shadow-lg transition-all duration-200 hover:bg-card-hover h-full flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 md:pb-4">
        <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground dark:text-white/70">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 md:h-6 md:w-6 text-muted-foreground/60 dark:text-white/60" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="text-2xl md:text-3xl font-bold text-foreground dark:text-white mb-2 md:mb-3">{value}</div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs md:text-sm">
          {change && (
            <span
              className={cn(
                "font-medium px-2 py-1 rounded-full text-xs w-fit",
                changeType === "positive" && "text-success bg-success/10 dark:text-green-300 dark:bg-green-900/20",
                changeType === "negative" && "text-destructive bg-destructive/10 dark:text-red-300 dark:bg-red-900/20",
                changeType === "neutral" && "text-muted-foreground bg-muted dark:text-white/60 dark:bg-white/10"
              )}
            >
              {change}
            </span>
          )}
          {description && (
            <span className="text-muted-foreground dark:text-white/60 text-xs md:text-sm">{description}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}