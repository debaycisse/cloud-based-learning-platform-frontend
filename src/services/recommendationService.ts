import { api } from "./apiClient"
import type { Course, LearningPath } from "../types"

export const getCourseRecommendations = async (
  limit = 4,
): Promise<{
  recommended_courses: Course[];
  count: number
}> => {
  try {
    const response = await api.get("/recommendations/courses", { params: { limit } })
    return response.data
  } catch (error) {
    console.error("Get course recommendations API error:", error)
    throw error
  }
}

export const getLearningPathRecommendations = async (
  limit = 3,
): Promise<{
  recommended_paths: LearningPath[]
  count: number
}> => {
  try {
    const response = await api.get("/recommendations/learning_paths", { params: { limit } })
    return response.data
  } catch (error) {
    console.error("Get learning path recommendations API error:", error)
    throw error
  }
}

export const getPersonalizedRecommendations = async (
  preferences?: any,
  limit = 4,
): Promise<{
  recommended_courses: Course[]
  count: number
}> => {
  try {
    const response = await api.post("/recommendations/personalized", preferences, {
      params: { limit },
    })
    return response.data
  } catch (error) {
    console.error("Get personalized recommendations API error:", error)
    throw error
  }
}

export const getSimilarCourses = async (
  courseId: string,
  limit = 3,
): Promise<{
  similar_courses: Course[]
  count: number
}> => {
  try {
    const response = await api.get(`/recommendations/similar/${courseId}`, {
      params: { limit },
    })
    return response.data
  } catch (error) {
    console.error(`Get similar courses for ${courseId} API error:`, error)
    throw error
  }
}
