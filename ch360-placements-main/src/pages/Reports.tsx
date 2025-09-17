import { useState } from "react"
import { Download, BarChart3, TrendingUp, Users, Building2, Calendar, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Reports() {
  const [reportType, setReportType] = useState("placement")
  const [timeRange, setTimeRange] = useState("month")

  const reportTypes = [
    { value: "placement", label: "Placement Report", icon: TrendingUp },
    { value: "companies", label: "Company Analysis", icon: Building2 },
    { value: "students", label: "Student Performance", icon: Users },
    { value: "internships", label: "Internship Report", icon: Calendar }
  ]

  const timeRanges = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white">Reports & Analytics</h1>
        <p className="text-sm md:text-base text-muted-foreground dark:text-white/80">
          Generate comprehensive reports and analyze placement data
        </p>
      </div>

      {/* Report Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((type) => (
          <Card 
            key={type.value} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              reportType === type.value ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setReportType(type.value)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  reportType === type.value 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <type.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base text-foreground dark:text-white">
                  {type.label}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground dark:text-white/60">
                Detailed analysis and insights
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground dark:text-white">
            {reportTypes.find(t => t.value === reportType)?.label} - {timeRanges.find(r => r.value === timeRange)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-foreground dark:text-white mb-1">87%</div>
                <div className="text-sm text-muted-foreground dark:text-white/60">Placement Rate</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-foreground dark:text-white mb-1">₹12.5L</div>
                <div className="text-sm text-muted-foreground dark:text-white/60">Average Package</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-foreground dark:text-white mb-1">156</div>
                <div className="text-sm text-muted-foreground dark:text-white/60">Students Placed</div>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground dark:text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">Chart Visualization</h3>
                <p className="text-sm text-muted-foreground dark:text-white/60">
                  Interactive charts and graphs will be displayed here
                </p>
              </div>
            </div>

            {/* Report Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground dark:text-white">Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Monthly Placement Summary", date: "2024-01-31", size: "2.3 MB" },
                { name: "Company Performance Analysis", date: "2024-01-28", size: "1.8 MB" },
                { name: "Student Placement Report", date: "2024-01-25", size: "3.1 MB" }
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="font-medium text-foreground dark:text-white">{report.name}</div>
                    <div className="text-sm text-muted-foreground dark:text-white/60">
                      Generated: {report.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground dark:text-white/60">{report.size}</span>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground dark:text-white">Scheduled Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Weekly Placement Update", schedule: "Every Monday", status: "Active" },
                { name: "Monthly Analytics", schedule: "1st of month", status: "Active" },
                { name: "Quarterly Summary", schedule: "Quarter end", status: "Paused" }
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="font-medium text-foreground dark:text-white">{report.name}</div>
                    <div className="text-sm text-muted-foreground dark:text-white/60">
                      {report.schedule}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      report.status === 'Active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}