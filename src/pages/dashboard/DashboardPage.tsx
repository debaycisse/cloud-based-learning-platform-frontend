import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "../../context/AuthContext"
import { getCourseRecommendations, getLearningPathRecommendations } from "../../services/recommendationService"
import { getUserProgress } from "../../services/userService"
import DashboardStats from "../../components/dashboard/DashboardStats"
import CourseCard from "../../components/courses/CourseCard"
import LearningPathCard from "../../components/dashboard/LearningPathCard"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const DashboardPage = () => {
  const { user } = useAuth()

  // Fetch dashboard data using React Query
  const {
    data: recommendedCoursesData,
    isLoading: isLoadingCourses,
    error: coursesError,
  } = useQuery(["recommendedCourses"], () => getCourseRecommendations())

  const {
    data: recommendedPathsData,
    isLoading: isLoadingPaths,
    error: pathsError,
  } = useQuery(["recommendedPaths"], () => getLearningPathRecommendations())

  const {
    data: progressData,
    isLoading: isLoadingProgress,
    error: progressError,
  } = useQuery(["userProgress"], () => getUserProgress())

  const isLoading = isLoadingCourses || isLoadingPaths || isLoadingProgress
  const error = coursesError || pathsError || progressError

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-sm text-red-700 dark:text-red-400">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          Failed to load dashboard data. Please try again later.
        </p>
      </div>
    )
  }

  const recommendedCourses = recommendedCoursesData?.recommended_courses || []
  const recommendedPaths = recommendedPathsData?.recommended_paths || []
  const progress = progressData?.progress || null

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            <i className="fa-solid fa-hand-wave mr-2 text-primary-500"></i>
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Here's an overview of your learning journey.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/courses" className="btn btn-primary">
            <i className="fa-solid fa-compass mr-2"></i>
            Browse Courses
          </Link>
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats progress={progress} />

      {/* In Progress Courses */}
      {progress?.in_progress_courses.length ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <i className="fa-solid fa-spinner mr-2 text-primary-500"></i>
              Continue Learning
            </h2>
            <Link
              to="/my-courses"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 text-sm font-medium"
            >
              View All
              <i className="fa-solid fa-arrow-right ml-1"></i>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* In progress courses would be displayed here */}
            <div className="card p-4 flex items-center justify-center h-40 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                <i className="fa-solid fa-hourglass-half text-2xl mb-2 block"></i>
                Your in-progress courses will appear here
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Recommended Courses */}
      {recommendedCourses.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <i className="fa-solid fa-star mr-2 text-primary-500"></i>
              Recommended Courses
            </h2>
            <Link
              to="/courses"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 text-sm font-medium"
            >
              View All
              <i className="fa-solid fa-arrow-right ml-1"></i>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* Recommended Learning Paths */}
      {recommendedPaths.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <i className="fa-solid fa-road mr-2 text-primary-500"></i>
              Learning Paths For You
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedPaths.map((path) => (
              <LearningPathCard key={path._id} path={{ ...path, progress: path.progress || 0 }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
