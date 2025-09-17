import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export default function Index() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to dashboard if authenticated, otherwise to login
    const token = localStorage.getItem("auth_token")
    if (token) {
      navigate("/", { replace: true })
    } else {
      navigate("/login", { replace: true })
    }
  }, [navigate])

  return null
}
