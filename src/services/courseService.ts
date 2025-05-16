import { api } from "./apiClient"
import type { Course } from "../types"

export const getAllCourses = async (params?: {
  limit?: number
  skip?: number
  category?: string
  difficulty?: string
  search?: string
}): Promise<{ 
  courses: Course[];
  count: number;
  skip: number;
  limit: number }> => {
  try {
    const response = await api.get("/courses", { params })
    return response.data
  } catch (error) {
    console.error("Get all courses API error:", error)
    throw error
  }
}

export const getCourseById = async (id: string): Promise<{
  course: Course
}> => {
  try {
    const response = await api.get(`/courses/${id}`)
    return response.data
  } catch (error) {
    console.error(`Get course ${id} API error:`, error)
    throw error
  }
}

export const getPopularCourses = async (limit = 4): Promise<{ 
  courses: Course[];
  count: number;
  limit: number;
  sort: string
}> => {
  try {
    const response = await api.get("/courses/popular", {
      params: {
        limit,
        sort: "popular",
      },
    })
    return response.data
  } catch (error) {
    console.error("Get popular courses API error:", error)
    throw error
  }
}

export const createCourse = async (courseData: Partial<Course>): Promise<{
  course: Course;
  message: string
}> => {
  try {
    const response = await api.post("/courses", courseData)
    return response.data
  } catch (error) {
    console.error("Create course API error:", error)
    throw error
  }
}

export const updateCourse = async (
  id: string,
  courseData: Partial<Course>
): Promise<{
  course: Course;
  message: string
}> => {
  try {
    const response = await api.put(`/courses/${id}`, courseData)
    return response.data
  } catch (error) {
    console.error(`Update course ${id} API error:`, error)
    throw error
  }
}

export const deleteCourse = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/courses/${id}`)
    return response.data
  } catch (error) {
    console.error(`Delete course ${id} API error:`, error)
    throw error
  }
}

export const completeCourse = async (id: any): Promise<{ message: string}> => {

  try {
    const response = await api.post(`/courses/complete`, {'course_id': id})
    return response.data
  } catch (error) {
    console.error('Course could not be completed')
    throw error
  }
}

export default {
  getAllCourses,
  getCourseById,
  getPopularCourses,
}