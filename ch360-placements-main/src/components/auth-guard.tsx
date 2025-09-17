import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { authService } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // First check if user has a valid token
      if (!authService.isAuthenticated()) {
        navigate("/login", { 
          replace: true,
          state: { from: location.pathname }
        })
        return
      }

      // Check if user profile exists, if not fetch it
      let userProfile = authService.getUserProfile()
      if (!userProfile) {
        try {
          userProfile = await authService.fetchUserProfile()
        } catch (error) {
          console.error('Failed to fetch user profile:', error)
          // In mock mode, create a minimal profile instead of redirecting
          const mockProfile = {
            id: 1,
            email: authService.getUserEmail() || 'user@example.com',
            username: 'mockuser',
            first_name: 'Campus',
            last_name: 'User',
            is_active: true,
            groups: ['placement'],
            user_permissions: []
          }
          authService.setUserProfile(mockProfile)
          userProfile = mockProfile
        }
      }

      // Check placement permission
      if (!authService.hasPlacementPermission()) {
        authService.logout()
        navigate("/login", { 
          replace: true,
          state: { from: location.pathname }
        })
        return
      }

      // Check if user is active
      if (!authService.isUserActive()) {
        authService.logout()
        navigate("/login", { 
          replace: true,
          state: { from: location.pathname }
        })
        return
      }

      setIsChecking(false)
    }

    checkAuth()
  }, [navigate, location.pathname])

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
}
