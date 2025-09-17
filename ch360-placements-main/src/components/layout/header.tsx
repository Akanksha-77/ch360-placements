import { Moon, Sun, Bell, User, Search, LogOut, AlertTriangle, Clock, Info } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/hooks/use-theme"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authService } from "@/lib/auth"

// Mock notification data
const notifications = [
  {
    id: 1,
    type: "emergency",
    title: "Job Application Deadline",
    message: "Software Engineer position at TechCorp closes in 2 hours",
    time: "2 hours ago",
    dueDate: "2024-01-15T18:00:00Z",
    icon: AlertTriangle,
    urgent: true
  },
  {
    id: 2,
    type: "due_date",
    title: "Internship Applications Due",
    message: "Summer 2024 internship applications close tomorrow",
    time: "1 day ago",
    dueDate: "2024-01-16T23:59:59Z",
    icon: Clock,
    urgent: true
  },
  {
    id: 3,
    type: "important",
    title: "Placement Drive Update",
    message: "New companies added for upcoming placement drive",
    time: "3 hours ago",
    dueDate: null,
    icon: Info,
    urgent: false
  },
  {
    id: 4,
    type: "reminder",
    title: "Workshop Registration",
    message: "AI/ML workshop registration closes in 3 days",
    time: "4 hours ago",
    dueDate: "2024-01-18T23:59:59Z",
    icon: Clock,
    urgent: false
  }
]

export function Header() {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    if (showSearch || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSearch, showNotifications])

  // Close search when performing actions
  const handleAction = (action: () => void) => {
    setShowSearch(false)
    setShowNotifications(false)
    action()
  }

  const handleLogout = () => {
    authService.logout()
    navigate("/login")
  }

  const handleThemeToggle = () => {
    setShowSearch(false)
    setShowNotifications(false)
    setTheme(theme === "light" ? "dark" : "light")
  }

  const urgentCount = notifications.filter(n => n.urgent).length

  return (
    <header className="h-16 border-b border-[hsl(var(--nav-primary-dark))] dark:border-gray-800 bg-[hsl(var(--nav-primary))] dark:bg-black backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-3 md:px-6 h-full gap-2">
        {/* Mobile sidebar trigger */}
        <div className="md:hidden flex-shrink-0">
          <SidebarTrigger />
        </div>

        {/* Search - Hidden on mobile by default, shown on larger screens */}
        <div className="hidden md:flex flex-1 max-w-md pl-2 md:pl-0">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search companies, jobs, students..."
              className="pl-10 bg-background/50 border-border/50 w-full"
            />
          </div>
        </div>

        {/* Mobile search toggle */}
        <div className="md:hidden flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className="h-9 w-9 p-0"
          >
            <Search className="h-4 w-4 text-white" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleThemeToggle}
            className="h-9 w-9 p-0"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-white" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-white" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 p-0 relative"
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowSearch(false)
              }}
            >
              <Bell className="h-4 w-4 text-white" />
              {urgentCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center bg-red-500 text-white">
                  {urgentCount}
                </Badge>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 md:w-96 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <Card className="border-0 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Notifications</span>
                      {urgentCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {urgentCount} Urgent
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {notifications.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">No notifications</p>
                    ) : (
                      notifications.map((notification) => {
                        const Icon = notification.icon
                        const isOverdue = notification.dueDate && new Date(notification.dueDate) < new Date()
                        
                        return (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border transition-all duration-200 ${
                              notification.urgent 
                                ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' 
                                : 'border-border bg-card hover:bg-muted/50'
                            } ${isOverdue ? 'border-red-500 bg-red-100 dark:bg-red-900/30' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${
                                notification.urgent 
                                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={`text-sm font-semibold ${
                                    notification.urgent ? 'text-red-900 dark:text-red-100' : 'text-foreground'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  {notification.urgent && (
                                    <Badge variant="destructive" className="text-xs">
                                      {isOverdue ? 'OVERDUE' : 'URGENT'}
                                    </Badge>
                                  )}
                                </div>
                                <p className={`text-sm mb-2 ${
                                  notification.urgent ? 'text-red-700 dark:text-red-200' : 'text-muted-foreground'
                                }`}>
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{notification.time}</span>
                                  {notification.dueDate && (
                                    <span className={`${
                                      isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''
                                    }`}>
                                      Due: {new Date(notification.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* User Menu */}
          <DropdownMenu onOpenChange={(open) => !open && setShowSearch(false)}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0"
                onClick={() => setShowSearch(false)}
              >
                <User className="h-4 w-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setShowSearch(false)}>
                <User className="mr-2 h-4 w-4 text-white" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSearch(false)}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAction(handleLogout)} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4 text-white" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile search bar - appears below header when toggled */}
      {showSearch && (
        <div ref={searchRef} className="md:hidden px-3 pb-3 border-t border-[hsl(var(--nav-primary-dark))] dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search companies, jobs, students..."
              className="pl-10 bg-background/50 border-border/50 w-full"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowSearch(false)
                }
              }}
            />
          </div>
        </div>
      )}
    </header>
  )
}