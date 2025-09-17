import { useState } from "react"
import { Plus, Users, Calendar, MapPin, Clock, Star, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Workshops() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const workshops: Array<any> = []
  const filteredWorkshops = workshops.filter(workshop => {
    const matchesSearch = workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workshop.speaker.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || workshop.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const statuses = ["all"]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white">Workshops</h1>
        <p className="text-sm md:text-base text-muted-foreground dark:text-white/80">
          Join interactive workshops to enhance your skills and knowledge
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workshops by title or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground dark:text-white"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Workshop
          </Button>
        </div>
      </div>

      {/* Workshops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkshops.map((workshop) => (
          <Card key={workshop.id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-foreground dark:text-white mb-2">
                    {workshop.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-white/60 mb-2">
                    <Users className="h-4 w-4" />
                    <span>{workshop.speaker}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-white/60">
                    <MapPin className="h-4 w-4" />
                    <span>{workshop.location}</span>
                  </div>
                </div>
                <Badge variant="outline" className="ml-2">
                  {workshop.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Calendar className="h-4 w-4" />
                  <span>{workshop.date}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Clock className="h-4 w-4" />
                  <span>{workshop.time}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Users className="h-4 w-4" />
                  <span>{workshop.participants}/{workshop.maxParticipants}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Star className="h-4 w-4" />
                  <span>{workshop.duration}</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground dark:text-white/70 line-clamp-2">
                {workshop.description}
              </p>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground dark:text-white/50">
                  {workshop.maxParticipants - workshop.participants} spots left
                </span>
                <Button variant="outline" size="sm">
                  Register Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWorkshops.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground dark:text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">No workshops found</h3>
          <p className="text-muted-foreground dark:text-white/60">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  )
}