import { 
  LayoutDashboard, 
  Building2, 
  Briefcase, 
  GraduationCap,
  BookOpen,
  Users,
  FileBarChart,
  Settings,
  Presentation,
  Moon,
  Sun,
  Bell,
  User,
  LogOut,
  FileText
} from "lucide-react"
import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/hooks/use-sidebar"
import { useTheme } from "@/hooks/use-theme"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Companies",
    url: "/companies",
    icon: Building2,
  },
  {
    title: "Jobs",
    url: "/jobs",
    icon: Briefcase,
  },
  {
    title: "Internships",
    url: "/internships",
    icon: GraduationCap,
  },
  {
    title: "Trainings",
    url: "/trainings",
    icon: BookOpen,
  },
  {
    title: "Workshops",
    url: "/workshops",
    icon: Users,
  },
  {
    title: "Applications",
    url: "/applications",
    icon: FileText,
  },
  {
    title: "Offers",
    url: "/offers",
    icon: Briefcase,
  },
  {
    title: "Statistics",
    url: "/statistics",
    icon: FileBarChart,
  },
  {
    title: "Feedbacks",
    url: "/feedbacks",
    icon: FileBarChart,
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FileBarChart,
  },
  {
    title: "Alumni",
    url: "/alumni",
    icon: Users,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: FileBarChart,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileBarChart,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const { setOpenMobile } = useSidebar()
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const [compactSidebar, setCompactSidebar] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  // Close mobile sidebar when route changes
  const handleNavClick = () => {
    setOpenMobile(false)
  }

  return (
    <Sidebar className="bg-sidebar border-0">
      <SidebarContent className="bg-sidebar">
        {/* Brand */}
        <div className="px-4 py-4 mb-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-sidebar-primary flex items-center justify-center">
              <Presentation className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h2 className="text-sidebar-foreground font-bold text-lg">CampusHub360</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <p className="text-sidebar-foreground/80 text-sm">Placement Dashboard</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-semibold px-4 mb-2 uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-3 py-2 mx-2 rounded-lg transition-all duration-200",
                          // Base color
                          "text-sidebar-foreground/80",
                          // Hover uses requested orange
                          "hover:text-[#e07404] hover:bg-[#e07404]/10",
                          // Pressed uses solid orange
                          "active:bg-[#e07404] active:text-white",
                          // Force active link to solid orange
                          isActive && "!bg-[#e07404] !text-white shadow-md"
                        )
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium text-base">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer Actions */}
        <div className="mt-auto border-t border-sidebar-border px-2 py-3 flex items-center justify-between gap-2">
          {/* Quick Settings */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="Quick settings"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </PopoverTrigger>
            <PopoverContent sideOffset={8} className="w-72">
              <div className="space-y-3">
                <div>
                  <p className="font-medium">Quick settings</p>
                  <p className="text-xs text-muted-foreground">Common placement portal preferences</p>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme">Dark mode</Label>
                  <Switch id="theme" checked={theme === 'dark'} onCheckedChange={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact">Compact sidebar</Label>
                  <Switch id="compact" checked={compactSidebar} onCheckedChange={setCompactSidebar} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif">Enable notifications</Label>
                  <Switch id="notif" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                </div>
                <div className="pt-1 text-xs text-muted-foreground">More in Settings →</div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Notifications">
                <div className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center bg-red-500 text-white">3</Badge>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent sideOffset={8} className="w-80">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Notifications</p>
                <Button variant="ghost" size="sm" className="h-7">Mark all read</Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-auto">
                <div className="p-2 rounded bg-muted/40">
                  <p className="text-sm font-medium">New drive announced</p>
                  <p className="text-xs text-muted-foreground">TCS Off-Campus 2025. Check eligibility and apply.</p>
                </div>
                <div className="p-2 rounded bg-muted/40">
                  <p className="text-sm font-medium">Interview schedule updated</p>
                  <p className="text-xs text-muted-foreground">Infosys System Engineer round on 20 Sep.</p>
                </div>
                <div className="p-2 rounded bg-muted/40">
                  <p className="text-sm font-medium">Offer accepted</p>
                  <p className="text-xs text-muted-foreground">Priya Sharma accepted offer from Wipro.</p>
                </div>
              </div>
              <div className="text-right mt-2">
                <NavLink to="/reports" className="text-xs text-[#e07404]">View all</NavLink>
              </div>
            </PopoverContent>
          </Popover>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="Profile menu"
              >
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Profile</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <NavLink to="/settings">Account settings</NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/documents">My documents</NavLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  localStorage.removeItem("access_token")
                  localStorage.removeItem("refresh_token")
                  localStorage.removeItem("auth_token")
                  window.location.href = "/login"
                }}
              >
                <LogOut className="h-4 w-4 mr-2" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}