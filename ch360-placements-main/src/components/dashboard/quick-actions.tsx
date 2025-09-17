import { Plus, Building2, Briefcase, GraduationCap, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const quickActions = [
  {
    title: "Add Company",
    description: "Register a new company",
    icon: Building2,
    href: "/companies/new",
    variant: "default" as const,
  },
  {
    title: "Post Job",
    description: "Create job opening",
    icon: Briefcase,
    href: "/jobs/new",
    variant: "secondary" as const,
  },
  {
    title: "Add Internship",
    description: "Create internship",
    icon: GraduationCap,
    href: "/internships/new",
    variant: "outline" as const,
  },
  {
    title: "Schedule Workshop",
    description: "Plan new workshop",
    icon: Users,
    href: "/workshops/new",
    variant: "ghost" as const,
  },
]

export function QuickActions() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4 md:pb-6">
        <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl text-foreground dark:text-white">
          <Plus className="h-5 w-5 md:h-6 md:w-6" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant={action.variant}
              className="h-auto flex-col items-start p-3 md:p-5 text-left space-y-2 md:space-y-3 w-full hover:scale-105 transition-transform duration-200"
              asChild
            >
              <a href={action.href}>
                <div className="flex items-center gap-2 md:gap-3 w-full">
                  <action.icon className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="font-semibold text-xs md:text-sm text-foreground dark:text-white">{action.title}</span>
                </div>
                <p className="text-xs text-muted-foreground dark:text-white/70 leading-relaxed">
                  {action.description}
                </p>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}