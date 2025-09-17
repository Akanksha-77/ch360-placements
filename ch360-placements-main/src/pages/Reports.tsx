import { useState, useEffect } from "react"
import { Download, BarChart3, TrendingUp, Users, Building2, Calendar, FileText, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { statisticsApi, analyticsApi, companiesApi, jobsApi, applicationsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function Reports() {
  const [reportType, setReportType] = useState("placement")
  const [timeRange, setTimeRange] = useState("month")
  const { toast } = useToast()

  // Fetch data based on report type
  const { data: statisticsData, isLoading: statsLoading } = useQuery({
    queryKey: ["statistics-overview"],
    queryFn: () => statisticsApi.getOverview(),
    enabled: reportType === "placement"
  })

  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ["companies-report"],
    queryFn: () => companiesApi.getAll(),
    enabled: reportType === "companies"
  })

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ["jobs-report"],
    queryFn: () => jobsApi.getAll(),
    enabled: reportType === "internships"
  })

  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ["applications-report"],
    queryFn: () => applicationsApi.getAll(),
    enabled: reportType === "students"
  })

  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ["analytics-trends"],
    queryFn: () => analyticsApi.getTrends(),
    enabled: reportType === "placement"
  })

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

  // Generate report data based on type
  const generateReportData = () => {
    switch (reportType) {
      case "placement":
        return {
          title: "Placement Statistics Report",
          data: statisticsData,
          loading: statsLoading,
          metrics: [
            { label: "Total Students", value: statisticsData?.overview?.total_students || 0, icon: Users },
            { label: "Placed Students", value: statisticsData?.overview?.placed_students || 0, icon: TrendingUp },
            { label: "Placement %", value: `${statisticsData?.overview?.placement_percentage || 0}%`, icon: BarChart3 },
            { label: "Avg Salary", value: `₹${(statisticsData?.overview?.average_salary || 0).toLocaleString()}`, icon: FileText }
          ]
        }
      case "companies":
        const companies = Array.isArray(companiesData) ? companiesData : (companiesData as any)?.results || []
        return {
          title: "Company Analysis Report",
          data: companiesData,
          loading: companiesLoading,
          metrics: [
            { label: "Total Companies", value: companies.length, icon: Building2 },
            { label: "Active Companies", value: companies.filter((c: any) => c.is_active).length, icon: TrendingUp },
            { label: "Avg Rating", value: (companies.reduce((sum: number, c: any) => sum + (c.rating || 0), 0) / companies.length || 0).toFixed(1), icon: BarChart3 },
            { label: "Total Placements", value: companies.reduce((sum: number, c: any) => sum + (c.total_placements || 0), 0), icon: Users }
          ]
        }
      case "students":
        const applications = Array.isArray(applicationsData) ? applicationsData : (applicationsData as any)?.results || []
        return {
          title: "Student Performance Report",
          data: applicationsData,
          loading: applicationsLoading,
          metrics: [
            { label: "Total Applications", value: applications.length, icon: FileText },
            { label: "Selected Students", value: applications.filter((a: any) => a.status === 'selected' || a.status === 'HIRED').length, icon: TrendingUp },
            { label: "Under Review", value: applications.filter((a: any) => a.status === 'under_review' || a.status === 'UNDER_REVIEW').length, icon: BarChart3 },
            { label: "Rejected", value: applications.filter((a: any) => a.status === 'rejected' || a.status === 'REJECTED').length, icon: Users }
          ]
        }
      case "internships":
        const jobs = Array.isArray(jobsData) ? jobsData : (jobsData as any)?.results || []
        const internships = jobs.filter((job: any) => 
          job.job_type?.toLowerCase() === 'internship' || 
          job.title?.toLowerCase().includes('intern')
        )
        return {
          title: "Internship Report",
          data: jobsData,
          loading: jobsLoading,
          metrics: [
            { label: "Total Internships", value: internships.length, icon: Calendar },
            { label: "Active Internships", value: internships.filter((i: any) => i.is_active).length, icon: TrendingUp },
            { label: "Avg Stipend", value: `₹${(internships.reduce((sum: number, i: any) => sum + (i.stipend || i.salary_min || 0), 0) / internships.length || 0).toLocaleString()}`, icon: BarChart3 },
            { label: "Remote Internships", value: internships.filter((i: any) => i.work_mode === 'REMOTE').length, icon: Building2 }
          ]
        }
      default:
        return { title: "Report", data: null, loading: false, metrics: [] }
    }
  }

  const reportInfo = generateReportData()

  const handleDownloadReport = () => {
    toast({
      title: "Report Download",
      description: `${reportInfo.title} will be downloaded shortly.`,
    })
  }

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
          <Button onClick={handleDownloadReport} disabled={reportInfo.loading}>
            <Download className="h-4 w-4 mr-2" />
            {reportInfo.loading ? "Loading..." : "Generate Report"}
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
            {reportInfo.title} - {timeRanges.find(r => r.value === timeRange)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportInfo.loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span>Loading report data...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {reportInfo.metrics.map((metric, index) => (
                  <div key={index} className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <metric.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-foreground dark:text-white mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm text-muted-foreground dark:text-white/60">
                      {metric.label}
                    </div>
                  </div>
                ))}
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
          )}
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