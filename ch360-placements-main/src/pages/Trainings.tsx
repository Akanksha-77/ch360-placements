import { useState, useMemo } from "react"
import { Plus, BookOpen, Users, Clock, MapPin, Calendar, Star, Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock training data
const MOCK_TRAININGS = [
  {
    id: 1,
    title: "Full Stack Web Development",
    provider: "Tech Academy",
    type: "online",
    duration: "3 months",
    level: "Beginner",
    rating: 4.8,
    students: 1250,
    price: 15000,
    description: "Learn modern web development with React, Node.js, and MongoDB",
    skills: ["React", "Node.js", "MongoDB", "JavaScript"],
    startDate: "2024-02-01",
    isActive: true
  },
  {
    id: 2,
    title: "Data Science & Machine Learning",
    provider: "Data Institute",
    type: "hybrid",
    duration: "6 months",
    level: "Intermediate",
    rating: 4.6,
    students: 890,
    price: 25000,
    description: "Master data science and machine learning with Python and TensorFlow",
    skills: ["Python", "TensorFlow", "Pandas", "Scikit-learn"],
    startDate: "2024-03-15",
    isActive: true
  },
  {
    id: 3,
    title: "Cloud Computing with AWS",
    provider: "Cloud Masters",
    type: "online",
    duration: "2 months",
    level: "Advanced",
    rating: 4.9,
    students: 2100,
    price: 20000,
    description: "Comprehensive AWS cloud computing certification program",
    skills: ["AWS", "Docker", "Kubernetes", "DevOps"],
    startDate: "2024-01-20",
    isActive: true
  },
  {
    id: 4,
    title: "Mobile App Development",
    provider: "App Academy",
    type: "offline",
    duration: "4 months",
    level: "Beginner",
    rating: 4.5,
    students: 650,
    price: 18000,
    description: "Build iOS and Android apps with React Native and Flutter",
    skills: ["React Native", "Flutter", "Firebase", "Mobile UI/UX"],
    startDate: "2024-04-01",
    isActive: true
  }
]

export default function Trainings() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterMode, setFilterMode] = useState("all")

  const filteredTrainings = useMemo(() => {
    return MOCK_TRAININGS.filter(training => {
      const matchesSearch = 
        String(training.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(training.provider || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesMode = filterMode === "all" || training.type === filterMode
      return matchesSearch && matchesMode
    })
  }, [searchTerm, filterMode])

  const modes = ["all", "online", "offline", "hybrid"]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white">Training Programs</h1>
        <p className="text-sm md:text-base text-muted-foreground dark:text-white/80">
          Enhance your skills with our comprehensive training programs
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trainings by title or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filterMode} onValueChange={setFilterMode}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              {modes.map(mode => (
                <SelectItem key={mode} value={mode}>
                  {mode === "all" ? "All Modes" : mode.charAt(0).toUpperCase() + mode.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Training
          </Button>
        </div>
      </div>

      {/* Trainings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainings.map((training) => (
          <Card key={training.id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-foreground dark:text-white mb-2">
                    {training.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-white/60 mb-2">
                    <Users className="h-4 w-4" />
                    <span>{training.provider}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-white/60">
                    <MapPin className="h-4 w-4" />
                    <span>{training.type.charAt(0).toUpperCase() + training.type.slice(1)}</span>
                  </div>
                </div>
                <Badge variant="outline" className="ml-2">
                  {training.level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Clock className="h-4 w-4" />
                  <span>{training.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(training.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Users className="h-4 w-4" />
                  <span>{training.students} enrolled</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground dark:text-white/60">
                  <Star className="h-4 w-4" />
                  <span>{training.rating}/5</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground dark:text-white/70 line-clamp-2">
                {training.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {training.skills.slice(0, 3).map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {training.skills.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{training.skills.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-foreground dark:text-white">
                  ₹{training.price.toLocaleString()}
                </span>
                <Button variant="outline" size="sm">
                  Enroll Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTrainings.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground dark:text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">No trainings found</h3>
          <p className="text-muted-foreground dark:text-white/60">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  )
}