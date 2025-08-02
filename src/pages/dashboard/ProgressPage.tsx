import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getUserProgress } from "../../services/userService"
import { getAllCourses } from "../../services/courseService"
import { getAssessmentResults, getAssessmentResultsByCourseId } from "../../services/assessmentService"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { Link } from "react-router-dom"
import { UserProgress } from "../../types"

const ProgressPage = () => {
  const [activeTab, setActiveTab] = useState<"courses" | "assessments">("courses");
  const [courseCompletionPercentage, setCourseCompletionPercentage] = useState(0);

  useEffect(
    () => {
      async function fetchCoursePogress() {
        const { course_progress } = await getUserProgress();
        setCourseCompletionPercentage(course_progress[0].percentage)
      }
      fetchCoursePogress();
    },
    []
  );

  // Fetch user progress
  const {
    data: progressData,
    isLoading: isLoadingProgress,
    error: progressError,
  } = useQuery(["userProgress"], () => getUserProgress())

  // Fetch all courses to get details for the enrolled courses
  const {
    data: coursesData,
    isLoading: isLoadingCourses,
    error: coursesError,
  } = useQuery(["allCourses"], () => getAllCourses({ limit: 100 }))

  // Fetch assessment results
  const {
    data: assessmentResultsData,
    isLoading: isLoadingAssessments,
    error: assessmentsError,
  } = useQuery(["assessmentResults"], () => getAssessmentResults())

  const {
    data: assessmentResultByCourseData,
    isLoading: isLoadingAssessmentResultByCourse,
    error: assessmentResultByCourseError,
  } = useQuery(["assessmentResultByCourseID"], () => getAssessmentResultsByCourseId(
    progressData? progressData.progress.in_progress_courses : ""
  ))

  const isLoading = isLoadingProgress || isLoadingCourses || isLoadingAssessments || isLoadingAssessmentResultByCourse
  const error = progressError || coursesError || assessmentsError || assessmentResultByCourseError

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-sm text-red-700 dark:text-red-400">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          Failed to load progress data. Please try again later.
        </p>
      </div>
    )
  }

  const progress: UserProgress = progressData?.progress || {
    in_progress_courses: "",
    completed_courses: [""],
    completed_assessments: [""]
  }
  const allCourses = coursesData?.courses || []
  const assessmentResults = assessmentResultsData?.results || []

  // Get course details for enrolled courses
  const inProgressCourses = allCourses.filter((course) => progress.in_progress_courses.includes(course._id? course._id: ""))
  const completedCourses = allCourses.filter((course) => progress.completed_courses.includes(course._id? course._id: ""))

  // Calculate overall 
  const totalCourses = inProgressCourses.length + completedCourses.length

  // Calculate assessment stats
  const passedAssessments = assessmentResults.filter((result) => result.passed).length
  const failedAssessments = assessmentResults.filter((result) => !result.passed).length
  const totalAssessments = assessmentResults.length
  const assessmentSuccessRate = totalAssessments > 0 ? (passedAssessments / totalAssessments) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          <i className="fa-solid fa-chart-line mr-2 text-primary-500"></i>
          Learning Progress
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Track your learning journey and achievements</p>
      </div>

      {/* Progress overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Courses</h3>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalCourses}</div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">
                {completedCourses.length} completed
              </span>
              <span className="mx-1 text-gray-500 dark:text-gray-400">|</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {inProgressCourses.length} in progress
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Course Completion</span>
              <span>{courseCompletionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${courseCompletionPercentage}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Assessments</h3>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalAssessments}</div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">{passedAssessments} passed</span>
              <span className="mx-1 text-gray-500 dark:text-gray-400">|</span>
              <span className="text-red-600 dark:text-red-400 font-medium">{failedAssessments} failed</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Success Rate</span>
              <span>{Math.round(assessmentSuccessRate)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${assessmentSuccessRate}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Learning Streak</h3>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">7</div>
            <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
              <i className="fa-solid fa-fire mr-1"></i>
              Days in a row
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div key={day} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${day <= 7
                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                    : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                    }`}
                >
                  {day <= 7 && <i className="fa-solid fa-check"></i>}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Day {day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label="Progress tabs">
          <button
            onClick={() => setActiveTab("courses")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "courses"
              ? "border-primary-500 text-primary-600 dark:text-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            aria-current={activeTab === "courses" ? "page" : undefined}
          >
            <i className="fa-solid fa-book mr-2"></i>
            Course Progress
          </button>
          <button
            onClick={() => setActiveTab("assessments")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "assessments"
              ? "border-primary-500 text-primary-600 dark:text-primary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            aria-current={activeTab === "assessments" ? "page" : undefined}
          >
            <i className="fa-solid fa-clipboard-check mr-2"></i>
            Assessment Results
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="space-y-4">
        {activeTab === "courses" && (
          <>
            {/* In Progress Courses */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                <i className="fa-solid fa-spinner mr-2 text-primary-500"></i>
                In Progress Courses
              </h2>
              {inProgressCourses.length > 0 ? (
                <div className="space-y-4">
                  {inProgressCourses.map((course) => {
                    return (
                      <div key={course._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="badge badge-primary">{course.category}</span>
                              <span className="badge badge-secondary">{course.difficulty}</span>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0 md:ml-4 md:w-1/3">
                            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                              <span>Progress</span>
                              <span>{courseCompletionPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div
                                className="bg-primary-600 h-2 rounded-full"
                                style={{ width: `${courseCompletionPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0 md:ml-4">
                            {assessmentResultByCourseData && assessmentResultByCourseData.result.passed ? (
                                <Link to={`/course/${course._id}/learn/${courseCompletionPercentage}`} className="btn btn-primary btn-sm">
                                  <i className="fa-solid fa-play mr-1"></i>
                                  Continue
                                </Link>) : (
                                <Link to={`/course/${course._id}/learn/${courseCompletionPercentage}`} 
                                className="btn btn-primary btn-sm pointer-events-none opacity-50"
                                onClick={(e) => e.preventDefault()}
                                >
                                  <i className="fa-solid fa-play mr-1"></i>
                                  Continue
                                </Link>
                              )

                            }
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <i className="fa-solid fa-book text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No courses in progress</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">You haven't started any courses yet</p>
                  <Link to="/courses" className="btn btn-primary mt-4">
                    <i className="fa-solid fa-compass mr-2"></i>
                    Browse Courses
                  </Link>
                </div>
              )}
            </div>

            {/* Completed Courses */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                <i className="fa-solid fa-check-circle mr-2 text-green-500"></i>
                Completed Courses
              </h2>
              {completedCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedCourses.map((course) => (
                    <div key={course._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                      <div className="flex items-start">
                        <div className="mr-4 bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                          <i className="fa-solid fa-trophy text-green-600 dark:text-green-400"></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="badge badge-primary">{course.category}</span>
                            <span className="badge badge-secondary">{course.difficulty}</span>
                          </div>
                          <div className="mt-3 flex justify-between">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              <i className="fa-solid fa-calendar-check mr-1"></i>
                              Completed on: {new Date().toLocaleDateString()}
                            </span>
                            <Link
                              to={`/course/${course._id}`}
                              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                            >
                              <i className="fa-solid fa-redo mr-1"></i>
                              Review
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <i className="fa-solid fa-trophy text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No completed courses</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Keep learning to complete your first course</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "assessments" && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              <i className="fa-solid fa-clipboard-check mr-2 text-primary-500"></i>
              Assessment History
            </h2>
            {assessmentResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Assessment
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {assessmentResults.map((result, index) => (
                      <tr key={index}>
                        <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">Assessment {index + 1}</td>
                        <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(result.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                          {Math.round(result.score * 100)}%
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {result.passed ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Passed
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          <Link
                            to={`/assessment/${result.assessment_id}/result`}
                            className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
                          >
                            <i className="fa-solid fa-eye mr-1"></i>
                            View Results
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <i className="fa-solid fa-clipboard-list text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No assessment results</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">You haven't taken any assessments yet</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProgressPage
