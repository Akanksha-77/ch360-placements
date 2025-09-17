import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ShieldX, ArrowLeft } from "lucide-react"

interface PermissionGuardProps {
  children: React.ReactNode
  requiredGroup?: string
  requiredPermission?: string
  fallbackPath?: string
}

export function PermissionGuard({ 
  children, 
  requiredGroup = 'placement',
  requiredPermission,
  fallbackPath = '/login'
}: PermissionGuardProps) {
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          navigate('/login', { replace: true })
          return
        }

        // Check if user profile exists, if not fetch it
        let userProfile = authService.getUserProfile()
        if (!userProfile) {
          try {
            userProfile = await authService.fetchUserProfile()
          } catch (error) {
            console.error('Failed to fetch user profile:', error)
            setError('Failed to load user profile. Please try logging in again.')
            setIsChecking(false)
            return
          }
        }

        // Check if user is active
        if (!authService.isUserActive()) {
          setError('Your account is inactive. Please contact administrator.')
          setIsChecking(false)
          return
        }

        // Check required group (placement by default)
        if (requiredGroup && !authService.hasGroup(requiredGroup)) {
          setError(`Access denied. You need to be a member of the '${requiredGroup}' group to access this page.`)
          setIsChecking(false)
          return
        }

        // Check specific permission if required
        if (requiredPermission && !authService.hasPermission(requiredPermission)) {
          setError(`Access denied. You need the '${requiredPermission}' permission to access this page.`)
          setIsChecking(false)
          return
        }

        // All checks passed
        setHasAccess(true)
        setIsChecking(false)
      } catch (error) {
        console.error('Permission check failed:', error)
        setError('An error occurred while checking permissions.')
        setIsChecking(false)
      }
    }

    checkPermissions()
  }, [navigate, requiredGroup, requiredPermission])

  // Show loading while checking permissions
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show error if access denied
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full mx-4">
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <ShieldX className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={() => navigate(fallbackPath)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Render children if access granted
  if (hasAccess) {
    return <>{children}</>
  }

  return null
}


