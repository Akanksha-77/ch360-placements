import { useState } from "react"
import { Plus, GraduationCap, MapPin, Building2, Clock, DollarSign, Users, Calendar, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Internships() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDuration, setFilterDuration] = useState("all")
  const [filterLocation, setFilterLocation] = useState("all")

  const internships: Array<any> = []
  const filteredInternships = internships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDuration = filterDuration === "all" || internship.duration === filterDuration
    const matchesLocation = filterLocation === "all" || internship.location === filterLocation
    return matchesSearch && matchesDuration && matchesLocation
  })

  const durations = ["all"]
  const locations = ["all"]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white">Internships</h1>
        <p className="text-sm md:text-base text-muted-foreground dark:text-white/80">
          Browse and apply for internship opportunities with leading companies
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search internships by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterDuration}
            onChange={(e) => setFilterDuration(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground dark:text-white"
          >
            {durations.map(duration => (
              <option key={duration} value={duration}>
                {duration === "all" ? "All Durations" : duration}
              </option>
            ))}
          </select>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground dark:text-white"
          >
            {locations.map(location => (
              <option key={location} value={location}>
                {location === "all" ? "All Locations" : location}
              </option>
            ))}
          </select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Post Internship
          </Button>
        </div>
      </div>

      {/* Internships Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInternships.map((internship) => (
          <Card key={internship.id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-foreground dark:text-white mb-2">
                    {internship.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-white/60 mb-2">
                    <Building2 className="h-4 w-4" />
                    <span>{internship.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-white/60">
                    <MapPin className="h-4 w-4" />
                    <span>{internship.location}</span>
                  </div>
                </div>
                <Badge variant="outline" className="ml-2">
                  {internship.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Clock className="h-4 w-4" />
                  <span>{internship.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <DollarSign className="h-4 w-4" />
                  <span>{internship.stipend}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Users className="h-4 w-4" />
                  <span>{internship.applications} applications</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Calendar className="h-4 w-4" />
                  <span>Posted {internship.posted}</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground dark:text-white/70 line-clamp-2">
                {internship.description}
              </p>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground dark:text-white/50">
                  {internship.applications} students applied
                </span>
                <Button variant="outline" size="sm">
                  Apply Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInternships.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-muted-foreground dark:text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">No internships found</h3>
          <p className="text-muted-foreground dark:text-white/60">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  )
}