import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "../../context/AuthContext"
import { getCourseRecommendations, getLearningPathRecommendations } from "../../services/recommendationService"
import { getUserProgress } from "../../services/userService"
import DashboardStats from "../../components/dashboard/DashboardStats"
import CourseCard from "../../components/courses/CourseCard"
import LearningPathCard from "../../components/dashboard/LearningPathCard"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { getCourseById } from "../../services/courseService"
import { getCooldownHistoryByUserId } from "../../services/cooldownHistoryService"
import { getAssessmentResultsByCourseId } from "../../services/assessmentService"

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

  const {
    data: inProgressCourseData,
    isLoading: isLoadingInProgressCourse,
    error: inProgressCourseError
  } = useQuery(["inProgressCourse"], () => getCourseById(
    progressData?.progress.in_progress_courses ? progressData?.progress.in_progress_courses : ''))

  const {
    data: cooldownHistoryData,
    isLoading: isLoadingCooldownHistory,
    error: cooldownHistoryError
  } = useQuery(["cooldownHistory"], () => getCooldownHistoryByUserId(user? user._id : ''))

  const {
    data: assessmentResultData,
    isLoading: isLoadingAssessmentResult,
    error: assessmentResultError
  } = useQuery(["assessmentResult"], () => getAssessmentResultsByCourseId(
    inProgressCourseData?.course._id ? inProgressCourseData.course._id : ''
  ))


  const isLoading = isLoadingCourses || isLoadingPaths ||
  isLoadingProgress || isLoadingInProgressCourse || isLoadingAssessmentResult ||
  isLoadingCooldownHistory;
  const error = coursesError || pathsError || progressError ||
  inProgressCourseError || cooldownHistoryError || assessmentResultError;

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
  const cooldownHistory = cooldownHistoryData?.cooldown || null
  const assessmentResult = assessmentResultData?.result || null

  const currentDateAndTime = new Date();
  const cooldownHistoryEndDateAndTime = new Date(
    cooldownHistory? cooldownHistory.cooldown_end : 
    new Date(Date.now() - 60 * 60 * 1000).toISOString()
  )
  const cooldownHistoryElapsed = currentDateAndTime > cooldownHistoryEndDateAndTime

  const emptyCourse = {
    title: '', description: '', category: '', difficulty: '', prerequisites: [],
    content: { sections: [], tags: [], }, enrollment_count: 0, enrolled_users: [],
    completed_users: [], created_at: '', updated_at: '',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            <i className="fa-solid fa-hand-wave mr-2 text-primary-500"></i>
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Here is an overview of your learning journey.</p>
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
      {progress?.in_progress_courses ? (
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
            <div className="card p-4 flex items-center justify-center h-55 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600">
              {progress.in_progress_courses ? (
                <CourseCard
                  key={progress?.in_progress_courses}
                  course={inProgressCourseData?.course ? inProgressCourseData?.course : emptyCourse}
                  passedAssessment={assessmentResult? assessmentResult.passed : false}
                  cooldownElapsed={cooldownHistoryElapsed}
                />
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  <i className="fa-solid fa-hourglass-half text-2xl mb-2 block"></i>
                  Your in-progress courses will appear here
              </p>
              )}
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
