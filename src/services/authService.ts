import { api } from "./apiClient"
import type { 
  User,
  LoginResponse,
  RegisterResponse,
  UserPreferences
} from "../types"

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post("/auth/login", { email, password })
    return response.data;
  } catch (error) {
    console.error("Login API error:", error)
    throw error
  }
}

export const registerUser = async (
  email: string,
  name: string,
  username: string,
  password: string
): Promise<RegisterResponse> => {
  try {
    const response = await api.post("/auth/register", { name, email, username, password })
    return response.data
  } catch (error) {
    console.error("Register API error:", error)
    throw error
  }
}

export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get("/auth/user")
    return response.data.user;
  } catch (error) {
    console.error("Get user profile API error:", error)
    throw error;
  }
}

export const logoutUser = async (): Promise<{message: string}> => {
  try {
    const response = await api.post("/auth/logout")
    return response.data;
  } catch (error) {
    console.error("Logout API error:", error)
    throw error;
  }
}

export const updateUserProfile = async (profileData: Partial<User>): Promise<User> => {
  try {
    const response = await api.put("/users/profile", profileData)
    return response.data.profile
  } catch (error) {
    console.error("Update profile API error:", error)
    throw error
  }
}

export const getUserPreferences = async (): Promise<UserPreferences> => {
  try {
    const response = await api.get("/users/preferences")
    return response.data.preferences
  } catch (error) {
    console.error("Get preferences API error:", error)
    throw error
  }
}

export const updateUserPreferences = async (preferences: Partial<UserPreferences>): Promise<{
  message: string;
  preferences: UserPreferences
}> => {
  try {
    const response = await api.put("/users/preferences", preferences)
    return response.data.preferences
  } catch (error) {
    console.error("Update preferences API error:", error)
    throw error
  }
}

export const resetPassword = async (email: string): Promise<{
  message: string;
  reset_token: string
}> => {
  try {
    const response = await api.post("/auth/reset_password", { email })
    return response.data
  } catch (error) {
    console.error("Reset password API error:", error)
    throw error
  }
}

export const verifyResetToken = async (token: string): Promise<{
  message: string;
  is_valid: boolean;
  error?: string
}> => {
  try {
    const response = await api.get(`/auth/verify_reset_token/${token}`)
    return response.data
  } catch (error) {
    console.error("Verify reset token API error:", error)
    throw error
  }
}

export const updatePassword = async (token: string, new_password: string): Promise<{
  message: string;
  error?: string
}> => {
  try {
    const response = await api.put(`/auth/update_password/${token}`, { new_password })
    return response.data
  } catch (error) {
    console.error("Update password API error:", error)
    throw error
  }
}

// export const sendVerificationEmail = async (email: string) => {
//   try {
//     const response = await api.post("/auth/verify-email", { email })
//     return response.data
//   } catch (error) {
//     console.error("Send verification email API error:", error)
//     throw error
//   }
// }

// export const verifyEmail = async (token: string) => {
//   try {
//     const response = await api.get(`/auth/verify-email/${token}`)
//     return response.data
//   } catch (error) {
//     console.error("Verify email API error:", error)
//     throw error
//   }
// }
