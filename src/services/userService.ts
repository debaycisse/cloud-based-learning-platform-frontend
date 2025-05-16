import { api } from "./apiClient"
import type { UserProgress, UserPreferences } from "../types"

export const getUserProgress = async (): Promise<{ progress: UserProgress; assessment_results: any[] }> => {
  try {
    const response = await api.get("/users/progress")
    return response.data
  } catch (error) {
    console.error("Get user progress API error:", error)
    throw error
  }
}

export const getUserPreferences = async (): Promise<{ preferences: UserPreferences }> => {
  try {
    const response = await api.get("/users/preferences")
    return response.data
  } catch (error) {
    console.error("Get user preferences API error:", error)
    throw error
  }
}

export const updateUserPreferences = async (
  preferences: Partial<UserPreferences>,
): Promise<{ preferences: UserPreferences }> => {
  try {
    const response = await api.put("/users/preferences", preferences)
    return response.data
  } catch (error) {
    console.error("Update user preferences API error:", error)
    throw error
  }
}

export const enrollInCourse = async (courseId: string): Promise<any> => {
  try {
    const response = await api.post(`/courses/enroll`, { 'course_id': courseId }) // check this api at the backend
    return response.data
  } catch (error) {
    console.error("Enroll in course API error:", error)
    throw error
  }
}

export const updateUserProfile = async (profileData: any): Promise<any> => {
  try {
    const response = await api.put("/users/profile", profileData)
    return response.data
  } catch (error) {
    console.error("Update profile API error:", error)
    throw error
  }
}

export const getAllUsers = async ({
  limit = 100,
  skip = 0,
}: {
  limit?: number
  skip?: number
}): Promise<{
  users: any[]
  count: number
  skip: number
  limit: number
}> => {
  try {
    const response = await api.get("/users/all", {
      params: { limit, skip },
    })
    return response.data
  } catch (error) {
    console.error("Get all users API error:", error)
    throw error
  }
}

export const getUserById = async (userId: string): Promise<any> => {
  try {
    const response = await api.get(`/users/${userId}`)
    return response.data
  } catch (error) {
    console.error(`Get user ${userId} API error:`, error)
    throw error
  }
}

export const updateUser = async (userId: string, userData: any): Promise<any> => {
  try {
    const response = await api.put(`/users/${userId}`, userData)
    return response.data
  } catch (error) {
    console.error(`Update user ${userId} API error:`, error)
    throw error
  }
}

export const deleteUser = async (userId: string): Promise<any> => {
  try {
    const response = await api.delete(`/users/${userId}`)
    return response.data
  } catch (error) {
    console.error(`Delete user ${userId} API error:`, error)
    throw error
  }
}
