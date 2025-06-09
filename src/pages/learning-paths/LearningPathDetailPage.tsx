import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/seperator"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { ArrowLeft, BookOpen, CheckCircle, Clock, Play, Lock } from "lucide-react"
import type { LearningPath, Course, UserProgress } from "../../types"
import { learningPathService } from "../../services/learningPathService"
import { getCourseById } from "../../services/courseService"
import { getUserProgress } from "../../services/userService"

const LearningPathDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress>(
    {
        "completed_courses": [""],
        "in_progress_courses": [""],
        "completed_assessments": [""],
    }
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLearningPathDetails = async () => {
      if (!id) return

      try {
        setLoading(true)

        // Fetch learning path details
        const pathData = await learningPathService.getLearningPath(id)
        setLearningPath(pathData)

        // Fetch courses in the learning path
        const coursePromises = pathData.courses.map((courseId: string) => getCourseById(courseId))
        const coursesData = await Promise.all(coursePromises)
        const courses = coursesData.map((course) => course.course)
        setCourses(courses)

        // Fetch user progress for these courses
        const progressData = await getUserProgress()
        setUserProgress(progressData.progress)
      } catch (err) {
        setError("Failed to load learning path details")
        console.error("Error fetching learning path details:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLearningPathDetails()
  }, [id])

//   const getCourseProgress = (courseId: string) => {
//     const progress = userProgress.find((p) => p.course_id === courseId)
//     return progress ? progress.progress_percentage : 0
//   }

  const getCourseProgressPercentage = (courseId: string) => {
    const progress = userProgress.course_progress?.course_id === courseId ? 
        userProgress.course_progress : null
    return progress ? progress.percentage : 0
  }

  const isCourseCompleted = (courseId: string) => {
    return courseId in userProgress.completed_courses
  }

  const isCourseAccessible = (courseIndex: number) => {
    // First course is always accessible
    if (courseIndex === 0) return true

    // Check if previous course is completed
    const previousCourse = courses[courseIndex - 1]
    return previousCourse ? isCourseCompleted(previousCourse._id) : false
  }

  const handleStartCourse = (courseId: string) => {
    navigate(`/course/${courseId}`)
  }

  const handleContinueCourse = (courseId: string) => {
    navigate(`/course/${courseId}/learn`)
  }

  const getOverallProgress = () => {
    if (courses.length === 0) return 0
    const totalProgress = courses.reduce((sum, course) => sum + getCourseProgressPercentage(course._id), 0)
    return Math.round(totalProgress / courses.length)
  }

  const getCompletedCoursesCount = () => {
    return courses.filter((course) => isCourseCompleted(course._id)).length
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !learningPath) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || "Learning path not found"}</p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{learningPath.title}</h1>
            <p className="text-gray-600 mb-4">{learningPath.description}</p>

            {/* Skills */}
            {learningPath.target_skills && learningPath.target_skills.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Skills you'll learn:</h3>
                <div className="flex flex-wrap gap-2">
                  {learningPath.target_skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Progress Card */}
          <Card className="w-full lg:w-80">
            <CardHeader>
              <CardTitle className="text-lg">Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{getOverallProgress()}%</span>
                  </div>
                  <Progress value={getOverallProgress()} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{getCompletedCoursesCount()}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
                    <div className="text-sm text-gray-600">Total Courses</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Courses List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Learning Path Courses</h2>

        <div className="space-y-4">
          {courses.map((course, index) => {
            const progress = getCourseProgressPercentage(course._id)
            const isCompleted = isCourseCompleted(course._id)
            const isAccessible = isCourseAccessible(index)
            const isInProgress = progress > 0 && progress < 100

            return (
              <Card key={course._id} className={`transition-all ${!isAccessible ? "opacity-60" : ""}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Course Number */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCompleted
                            ? "bg-green-100 text-green-700"
                            : isAccessible
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>

                          {/* Course Meta */}
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              <span>{course.content.sections?.length || 0} sections</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {/* <span>~{course.estimated_duration || "N/A"}</span> */}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          {isAccessible && (
                            <div className="mb-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="flex-shrink-0">
                          {!isAccessible ? (
                            <Button disabled variant="outline" size="sm">
                              <Lock className="w-4 h-4 mr-2" />
                              Locked
                            </Button>
                          ) : isCompleted ? (
                            <Button variant="outline" size="sm" onClick={() => handleStartCourse(course._id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Review
                            </Button>
                          ) : isInProgress ? (
                            <Button size="sm" onClick={() => handleContinueCourse(course._id)}>
                              <Play className="w-4 h-4 mr-2" />
                              Continue
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => handleStartCourse(course._id)}>
                              <Play className="w-4 h-4 mr-2" />
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default LearningPathDetailPage










// import type React from "react"
// import { useState, useEffect } from "react"
// import { useParams, useNavigate } from "react-router-dom"
// import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"
// import { Button } from "../../components/ui/button"
// import { Progress } from "../../components/ui/progress"
// import { Badge } from "../../components/ui/badge"
// import { Separator } from "../../components/ui/seperator"
// import LoadingSpinner from "../../components/common/LoadingSpinner"
// import { ArrowLeft, BookOpen, CheckCircle, Clock, Play, Lock } from "lucide-react"
// import type { LearningPath, Course, UserProgress, CourseProgress } from "../../types"
// import { learningPathService } from "../../services/learningPathService"
// import { getCourseById } from "../../services/courseService"
// import { getUserProgress } from "../../services/userService"

// const LearningPathDetailPage: React.FC = () => {
//   const { id } = useParams<{ id: string }>()
//   const navigate = useNavigate()
//   const [learningPath, setLearningPath] = useState<LearningPath | null>(null)
//   const [courses, setCourses] = useState<Course[]>([])
//   const [userProgress, setUserProgress] = useState<string[]>([])
//   const [courseProgress, setCourseProgress] = useState<CourseProgress>({
//     course_id: "",percentage: 0 })
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const fetchLearningPathDetails = async () => {
//       if (!id) return

//       try {
//         setLoading(true)

//         // Fetch learning path details
//         const pathData = await learningPathService.getLearningPath(id)
//         setLearningPath(pathData)

//         // Fetch courses in the learning path
//         const coursePromises = pathData.courses.map((courseId: string) => getCourseById(courseId))
//         const coursesData = await Promise.all(coursePromises)
//         const courses = coursesData.map((courseResponse) => courseResponse.course)
//         setCourses(courses)

//         // Fetch user progress for these courses
//         const progressData = await getUserProgress()
//         setUserProgress(progressData.progress.in_progress_courses)
//         setCourseProgress(progressData.progress.course_progress || { course_id: "", percentage: 0 })
//       } catch (err) {
//         setError("Failed to load learning path details")
//         console.error("Error fetching learning path details:", err)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchLearningPathDetails()
//   }, [id])

//   const getCourseProgress = (courseId: string) => {
//     const progress = userProgress.find((course_id) => course_id === courseId)
//     return progress ? progress.progress_percentage : 0
//   }

//   const isCourseCompleted = (courseId: string) => {
//     return getCourseProgress(courseId) >= 100
//   }

//   const isCourseAccessible = (courseIndex: number) => {
//     // First course is always accessible
//     if (courseIndex === 0) return true

//     // Check if previous course is completed
//     const previousCourse = courses[courseIndex - 1]
//     return previousCourse ? isCourseCompleted(previousCourse._id) : false
//   }

//   const handleStartCourse = (courseId: string) => {
//     navigate(`/course/${courseId}`)
//   }

//   const handleContinueCourse = (courseId: string) => {
//     navigate(`/course/${courseId}/learn`)
//   }

//   const getOverallProgress = () => {
//     if (courses.length === 0) return 0
//     const totalProgress = courses.reduce((sum, course) => sum + getCourseProgress(course._id), 0)
//     return Math.round(totalProgress / courses.length)
//   }

//   const getCompletedCoursesCount = () => {
//     return courses.filter((course) => isCourseCompleted(course._id)).length
//   }

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <LoadingSpinner />
//       </div>
//     )
//   }

//   if (error || !learningPath) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
//           <p className="text-gray-600 mb-4">{error || "Learning path not found"}</p>
//           <Button onClick={() => navigate("/dashboard")}>
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back to Dashboard
//           </Button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Header */}
//       <div className="mb-6">
//         <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           Back to Dashboard
//         </Button>

//         <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
//           <div className="flex-1">
//             <h1 className="text-3xl font-bold mb-2">{learningPath.title}</h1>
//             <p className="text-gray-600 mb-4">{learningPath.description}</p>

//             {/* Skills */}
//             {learningPath.target_skills && learningPath.target_skills.length > 0 && (
//               <div className="mb-4">
//                 <h3 className="text-sm font-medium mb-2">Skills you'll learn:</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {learningPath.target_skills.map((skill, index) => (
//                     <Badge key={index} variant="secondary">
//                       {skill}
//                     </Badge>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Progress Card */}
//           <Card className="w-full lg:w-80">
//             <CardHeader>
//               <CardTitle className="text-lg">Your Progress</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div>
//                   <div className="flex justify-between text-sm mb-2">
//                     <span>Overall Progress</span>
//                     <span>{getOverallProgress()}%</span>
//                   </div>
//                   <Progress value={getOverallProgress()} className="h-2" />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4 text-center">
//                   <div>
//                     <div className="text-2xl font-bold text-green-600">{getCompletedCoursesCount()}</div>
//                     <div className="text-sm text-gray-600">Completed</div>
//                   </div>
//                   <div>
//                     <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
//                     <div className="text-sm text-gray-600">Total Courses</div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       <Separator className="my-8" />

//       {/* Courses List */}
//       <div className="space-y-6">
//         <h2 className="text-2xl font-bold">Learning Path Courses</h2>

//         <div className="space-y-4">
//           {courses.map((course, index) => {
//             const progress = getCourseProgress(course._id)
//             const isCompleted = isCourseCompleted(course._id)
//             const isAccessible = isCourseAccessible(index)
//             const isInProgress = progress > 0 && progress < 100

//             return (
//               <Card key={course._id} className={`transition-all ${!isAccessible ? "opacity-60" : ""}`}>
//                 <CardContent className="p-6">
//                   <div className="flex items-start gap-4">
//                     {/* Course Number */}
//                     <div className="flex-shrink-0">
//                       <div
//                         className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
//                           isCompleted
//                             ? "bg-green-100 text-green-700"
//                             : isAccessible
//                               ? "bg-blue-100 text-blue-700"
//                               : "bg-gray-100 text-gray-500"
//                         }`}
//                       >
//                         {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
//                       </div>
//                     </div>

//                     {/* Course Content */}
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-start justify-between gap-4">
//                         <div className="flex-1">
//                           <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
//                           <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>

//                           {/* Course Meta */}
//                           <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
//                             <div className="flex items-center gap-1">
//                               <BookOpen className="w-4 h-4" />
//                               <span>{course.sections?.length || 0} sections</span>
//                             </div>
//                             <div className="flex items-center gap-1">
//                               <Clock className="w-4 h-4" />
//                               <span>~{course.estimated_duration || "N/A"}</span>
//                             </div>
//                           </div>

//                           {/* Progress Bar */}
//                           {isAccessible && (
//                             <div className="mb-3">
//                               <div className="flex justify-between text-sm mb-1">
//                                 <span>Progress</span>
//                                 <span>{progress}%</span>
//                               </div>
//                               <Progress value={progress} className="h-2" />
//                             </div>
//                           )}
//                         </div>

//                         {/* Action Button */}
//                         <div className="flex-shrink-0">
//                           {!isAccessible ? (
//                             <Button disabled variant="outline" size="sm">
//                               <Lock className="w-4 h-4 mr-2" />
//                               Locked
//                             </Button>
//                           ) : isCompleted ? (
//                             <Button variant="outline" size="sm" onClick={() => handleStartCourse(course._id)}>
//                               <CheckCircle className="w-4 h-4 mr-2" />
//                               Review
//                             </Button>
//                           ) : isInProgress ? (
//                             <Button size="sm" onClick={() => handleContinueCourse(course._id)}>
//                               <Play className="w-4 h-4 mr-2" />
//                               Continue
//                             </Button>
//                           ) : (
//                             <Button size="sm" onClick={() => handleStartCourse(course._id)}>
//                               <Play className="w-4 h-4 mr-2" />
//                               Start
//                             </Button>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             )
//           })}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default LearningPathDetailPage
