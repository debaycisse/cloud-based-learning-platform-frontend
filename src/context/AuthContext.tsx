import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { loginUser, registerUser, getUserProfile, logoutUser } from "../services/authService"
import type { User } from "../types"
import isTokenExpired from "../utils/auth"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, username: string, password: string) => Promise<{ userId: string }>
  logout: () => void
  updateUserData: (userData: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token")
      if (token && !isTokenExpired(token)) {
        try {
          const userData = await getUserProfile()
          setUser(userData)
        } catch (error) {
          console.error("Failed to get user profile:", error)
          localStorage.removeItem("token")
        }
      } else if (token) {
        // Token exists but is expired
        localStorage.removeItem("token")
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { access_token, user } = await loginUser(email, password)
      localStorage.setItem("token", access_token)
      setUser(user)
      
      const prefCategoriesLength = user.preferences?.categories?.length ?? 0

      if (prefCategoriesLength < 1) {
        navigate('/preferences');
        return;
      }
      
      navigate("/dashboard");

    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, name: string, username: string, password: string) => {
    setIsLoading(true)
    try {
      const { access_token, user } = await registerUser(email, name, username, password)
      localStorage.setItem("token", access_token)
      setUser(user)
      return { userId: user._id }
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error("Logout API call failed:", error)
    } finally {
      localStorage.removeItem("token")
      setUser(null)
      navigate("/login")
    }
  }

  const updateUserData = (userData: User) => {
    setUser(userData)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isLoading,
        login,
        register,
        logout,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
