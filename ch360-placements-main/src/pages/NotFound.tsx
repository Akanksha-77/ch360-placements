import { Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl md:text-8xl font-bold text-foreground dark:text-white">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground dark:text-white">
            Page Not Found
          </h2>
          <p className="text-muted-foreground dark:text-white/60 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved to a different location.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button onClick={() => navigate("/")}>
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>

        <div className="pt-8">
          <p className="text-sm text-muted-foreground dark:text-white/40">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
}