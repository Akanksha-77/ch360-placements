import { useState, useMemo } from "react"
import { Plus, Users, Calendar, MapPin, Clock, Star, Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock workshop data
const MOCK_WORKSHOPS = [
  {
    id: 1,
    title: "Resume Building & Interview Skills",
    speaker: "Dr. Sarah Johnson",
    status: "upcoming",
    date: "2024-02-15",
    time: "10:00 AM - 12:00 PM",
    location: "Auditorium A",
    maxParticipants: 100,
    currentParticipants: 67,
    rating: 4.7,
    description: "Learn how to create compelling resumes and ace job interviews",
    topics: ["Resume Writing", "Interview Techniques", "Body Language", "Salary Negotiation"]
  },
  {
    id: 2,
    title: "Tech Industry Trends 2024",
    speaker: "Mr. Rajesh Kumar",
    status: "ongoing",
    date: "2024-02-10",
    time: "2:00 PM - 4:00 PM",
    location: "Conference Room B",
    maxParticipants: 50,
    currentParticipants: 50,
    rating: 4.9,
    description: "Explore the latest trends in technology and their impact on careers",
    topics: ["AI/ML", "Cloud Computing", "Cybersecurity", "Blockchain"]
  },
  {
    id: 3,
    title: "Entrepreneurship & Startups",
    speaker: "Ms. Priya Sharma",
    status: "completed",
    date: "2024-02-05",
    time: "3:00 PM - 5:00 PM",
    location: "Seminar Hall",
    maxParticipants: 80,
    currentParticipants: 72,
    rating: 4.6,
    description: "Learn the fundamentals of starting your own business",
    topics: ["Business Planning", "Funding", "Marketing", "Legal Aspects"]
  },
  {
    id: 4,
    title: "Digital Marketing Masterclass",
    speaker: "Mr. Amit Patel",
    status: "upcoming",
    date: "2024-02-20",
    time: "11:00 AM - 1:00 PM",
    location: "Computer Lab 1",
    maxParticipants: 60,
    currentParticipants: 45,
    rating: 4.8,
    description: "Master digital marketing strategies for modern businesses",
    topics: ["SEO", "Social Media", "Content Marketing", "Analytics"]
  }
]

export default function Workshops() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredWorkshops = useMemo(() => {
    return MOCK_WORKSHOPS.filter(workshop => {
      const matchesSearch = 
        String(workshop.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(workshop.speaker || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === "all" || workshop.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, filterStatus])

  const statuses = ["all", "upcoming", "ongoing", "completed"]

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
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                <Badge 
                  variant="outline" 
                  className={`ml-2 ${
                    workshop.status === 'upcoming' ? 'border-blue-500 text-blue-600' :
                    workshop.status === 'ongoing' ? 'border-green-500 text-green-600' :
                    'border-gray-500 text-gray-600'
                  }`}
                >
                  {workshop.status.charAt(0).toUpperCase() + workshop.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(workshop.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Clock className="h-4 w-4" />
                  <span>{workshop.time}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Users className="h-4 w-4" />
                  <span>{workshop.currentParticipants}/{workshop.maxParticipants}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Star className="h-4 w-4" />
                  <span>{workshop.rating}/5</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground dark:text-white/70 line-clamp-2">
                {workshop.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {workshop.topics.slice(0, 3).map((topic: string) => (
                  <Badge key={topic} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
                {workshop.topics.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{workshop.topics.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground dark:text-white/50">
                  {workshop.maxParticipants - workshop.currentParticipants} spots left
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={workshop.status === 'completed' || workshop.currentParticipants >= workshop.maxParticipants}
                >
                  {workshop.status === 'completed' ? 'Completed' : 
                   workshop.currentParticipants >= workshop.maxParticipants ? 'Full' : 'Register Now'}
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