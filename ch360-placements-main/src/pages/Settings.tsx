import { Settings as SettingsIcon, User, Bell, Shield, Database } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage system preferences and configurations
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Manage your account information and preferences
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="font-medium">Admin User</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="font-medium">admin@college.edu</span>
              </div>
              <div className="flex justify-between">
                <span>Role:</span>
                <span className="font-medium">Placement Coordinator</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Configure notification preferences
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Email Notifications:</span>
                <span className="text-success">Enabled</span>
              </div>
              <div className="flex justify-between">
                <span>Push Notifications:</span>
                <span className="text-success">Enabled</span>
              </div>
              <div className="flex justify-between">
                <span>Weekly Reports:</span>
                <span className="text-success">Enabled</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Manage security settings and permissions
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Two-Factor Auth:</span>
                <span className="text-warning">Disabled</span>
              </div>
              <div className="flex justify-between">
                <span>Session Timeout:</span>
                <span className="font-medium">2 hours</span>
              </div>
              <div className="flex justify-between">
                <span>Last Login:</span>
                <span className="font-medium">Today, 9:30 AM</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              System information and maintenance
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="font-medium">v2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="text-success">Connected</span>
              </div>
              <div className="flex justify-between">
                <span>Last Backup:</span>
                <span className="font-medium">Yesterday</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}