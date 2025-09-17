import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Eye, EyeOff, Lock, Mail, AtSign, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "@/hooks/use-theme"
import { authService } from "@/lib/auth"

export default function Login() {
  const [email, setEmail] = useState("mrvidhyasree@mits.ac.in")
  const [password, setPassword] = useState("Campus@360")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [endpointStatus, setEndpointStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  // Check if already logged in and test endpoint connectivity
  useEffect(() => {
    if (authService.isAuthenticated()) {
      setIsLoggedIn(true)
      const from = location.state?.from?.pathname || "/"
      navigate(from, { replace: true })
    }

    // Test endpoint connectivity
    const testEndpoint = async () => {
      try {
        const isHealthy = await authService.healthCheck()
        setEndpointStatus(isHealthy ? 'connected' : 'disconnected')
      } catch (error) {
        setEndpointStatus('disconnected')
      }
    }

    testEndpoint()
  }, [navigate, location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in both email and password.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      await authService.login({ email, password })

      // Check if user has placement permission
      if (!authService.hasPlacementPermission()) {
        authService.logout()
        toast({
          title: "Access Denied",
          description: "You need to be a member of the 'placement' group to access this portal.",
          variant: "destructive"
        })
        return
      }

      // Check if user is active
      if (!authService.isUserActive()) {
        authService.logout()
        toast({
          title: "Account Inactive",
          description: "Your account is inactive. Please contact administrator.",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Login successful!",
        description: "Welcome to CampusHub360 Placement Portal",
      })

      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || "/"
      console.log('Login successful, redirecting to:', from)
      console.log('Auth status:', authService.isAuthenticated())
      console.log('User profile:', authService.getUserProfile())
      navigate(from, { replace: true })
    } catch (err: any) {
      console.error('Login error:', err);
      
      let errorMessage = "Invalid email or password.";
      
      if (err.response?.data) {
        // Handle different error response formats
        errorMessage = err.response.data.detail || 
                      err.response.data.message || 
                      err.response.data.error || 
                      errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Handle network errors
      if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
        errorMessage = "Unable to connect to the server. Please check your connection and try again.";
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoggedIn) {
    return null // Will redirect automatically
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-gray-900">
      {/* Left side - Light blue background */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-100 dark:bg-blue-900/20"></div>
      
      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Theme toggle in top right */}
          <div className="flex justify-end mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </Button>
          </div>

          {/* Login Card */}
          <Card className="w-full bg-white dark:bg-gray-800 shadow-lg border-0">
            <CardContent className="p-8">
              {/* Logo */}
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-2xl">CH</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Sign in to your PlacementHub account
                </p>
                
                {/* Endpoint Status Indicator */}
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    endpointStatus === 'connected' ? 'bg-green-500' : 
                    endpointStatus === 'disconnected' ? 'bg-red-500' : 
                    'bg-yellow-500'
                  }`}></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {endpointStatus === 'connected' ? 'Connected to server' : 
                     endpointStatus === 'disconnected' ? 'Server unavailable' : 
                     'Checking connection...'}
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-4 pr-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <AtSign className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-4 pr-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              {/* Forgot Password */}
              <div className="text-center mt-6">
                <a
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Forgot your password?
                </a>
              </div>

              {/* Divider */}
              <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                <span className="px-4 text-sm text-gray-500 dark:text-gray-400">or</span>
                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
              </div>

              {/* Create Account */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <a
                    href="#"
                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Create one now
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
