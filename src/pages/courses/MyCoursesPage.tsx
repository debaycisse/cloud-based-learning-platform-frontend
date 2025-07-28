"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getUserProgress } from "../../services/userService"
import { getCourseById } from "../../services/courseService"
import type { Course } from "../../types"
import LoadingSpinner from "../../components/common/LoadingSpinner"
// import { Progress } from "../../components/ui/progress"

const MyCoursesPage = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [enrolledCourses, setEnrolledCourses] = useState<Array<Course & { progress: number }>>([])

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoading(true)
        // Get user progress which includes enrolled courses
        const { progress, course_progress } = await getUserProgress()

        // Combine in-progress and completed courses
        const combinedIds = [progress.in_progress_courses, ...progress.completed_courses]
        const allEnrolledCourseIds: string[] = []

        combinedIds.forEach((courseId) => {
          if (typeof courseId === 'string') {
            allEnrolledCourseIds.push(courseId)
          }
        })

        // Fetch details for each enrolled course
        const coursePromises = allEnrolledCourseIds.map(async (courseId) => {
          try {
            const { course } = await getCourseById(courseId)

            // Calculate progress percentage
            const theCourseCompleted = progress.completed_courses.
              find((completedCourse) => completedCourse === courseId)
            
            const theCourseProgress = course_progress.find(cp_obj => cp_obj.course_id === courseId)

            const isCompleted = theCourseCompleted? true : false
            const progressPercentage = isCompleted ? 100 : theCourseProgress?.percentage

            return {
              ...course,
              progress: progressPercentage,
            }
          } catch (err) {
            console.error(`Error fetching course ${courseId}:`, err)
            return null
          }
        })

        const coursesWithProgress = (await Promise.all(coursePromises)).filter(Boolean) as Array<
          Course & { progress: number }
        >
        setEnrolledCourses(coursesWithProgress)
      } catch (err) {
        console.error("Error fetching enrolled courses:", err)
        setError("Failed to load your courses. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchMyCourses()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    )
  }
  const img = {
    'Programming': 'https://i.ibb.co/HMx40dF/programming.webp',
    'Data Science': 'https://i.ibb.co/PZm982nX/data-science.webp',
    'Mobile Development': 'https://i.ibb.co/W4dwScpv/mobile-dev.webp',
    'DevOps': 'https://i.ibb.co/6R6MsRvZ/devops.webp',
    'Cloud Computing': 'https://i.ibb.co/WNP55yFF/cloud-computing.webp',
    'Cybersecurity': 'https://i.ibb.co/cq9xKY0/cybersecurity.webp',
    'Artificial Intelligence': 'https://i.ibb.co/KpQhxcMf/artificial-intelligence.webp',
    'Web Development': 'https://i.ibb.co/8nVQrXVc/web-dev.webp'
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <Link
          to="/courses"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Browse More Courses
        </Link>
      </div>

      {enrolledCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
            >

              <div className="relative pb-1/5">
                <img
                  src={`${img[course.category as keyof typeof img]}`}
                  alt={course.title}
                  className="h-48 w-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{course.title}</h2>
                  <span className="badge badge-primary">{course.difficulty}</span>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {course.content.sections.length} sections
                  </span>

                  <Link
                    to={`/course/${course._id}/learn`}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm"
                  >
                    {course.progress === 100 ? "Review Course" : "Continue Learning"}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <h3 className="text-xl font-medium mb-2">You haven't enrolled in any courses yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Explore our course catalog and start your learning journey today!
          </p>
          <Link
            to="/courses"
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors inline-block"
          >
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  )
}

export default MyCoursesPage
