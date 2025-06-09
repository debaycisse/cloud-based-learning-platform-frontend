import { api } from "./apiClient"
import type { LearningPath, PaginatedResponse } from "../types"

export const learningPathService = {
  // Get all learning paths with pagination
  getLearningPaths: async (skip = 0, limit = 10): Promise<PaginatedResponse<LearningPath>> => {
    const response = await api.get(`/learning-paths?skip=${skip}&limit=${limit}`)
    return response.data
  },

  // Get a specific learning path by ID
  getLearningPath: async (id: string): Promise<LearningPath> => {
    const response = await api.get(`/learning-paths/${id}`)
    return response.data
  },

  // Create a new learning path (admin only)
  createLearningPath: async (learningPathData: Partial<LearningPath>): Promise<LearningPath> => {
    const response = await api.post("/learning-paths", learningPathData)
    return response.data
  },

  // Update a learning path (admin only)
  updateLearningPath: async (id: string, learningPathData: Partial<LearningPath>): Promise<LearningPath> => {
    const response = await api.put(`/learning-paths/${id}`, learningPathData)
    return response.data
  },

  // Delete a learning path (admin only)
  deleteLearningPath: async (id: string): Promise<void> => {
    await api.delete(`/learning-paths/${id}`)
  },

  // Get recommended learning paths
  getRecommendedPaths: async (): Promise<LearningPath[]> => {
    const response = await api.get("learning-paths/recommended")
    return response.data
  },
}
