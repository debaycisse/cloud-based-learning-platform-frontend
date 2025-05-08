import { api } from "./apiClient"
import type { User, UserProgress, UserPreferences } from "../types"

export const getUserProgress = async (): Promise<{
  progress: UserProgress;
  assessment_results: any[] 
}> => {
  try {
    const response = await api.get("/users/progress")
    return response.data
  } catch (error) {
    console.error("Get user progress API error:", error)
    throw error
  }
}

export const getUserPreferences = async (): Promise<{
  preferences: UserPreferences
}> => {
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
): Promise<{ preferences: UserPreferences; message: string }> => {
  try {
    const response = await api.put("/users/preferences", preferences)
    return response.data
  } catch (error) {
    console.error("Update user preferences API error:", error)
    throw error
  }
}

export const enrollInCourse = async (courseId: string): Promise<{
  message: string
}> => {
  try {
    const response = await api.post(`/courses/enroll`, { course_id: courseId })
    return response.data
  } catch (error) {
    console.error("Enroll in course API error:", error)
    throw error
  }
}

export const updateUserProfile = async (profileData: Partial<User>): Promise<{
  profile: User
}> => {
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
  limit?: number,
  skip?: number,
}): Promise<{
  users: User[];
  count: number;
  skip: number;
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

export const getUserById = async (user_id: string): Promise<{
  user: User
}> => {
  try {
    const response = await api.get(`/users/${user_id}`)
    return response.data
  } catch (error) {
    console.error(`Get user ${user_id} API error:`, error)
    throw error
  }
}
