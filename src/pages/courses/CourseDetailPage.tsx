import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import { getCourseById } from "../../services/courseService"
import { getAssessmentForCourse } from "../../services/assessmentService"
import { enrollInCourse } from "../../services/userService"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import CourseContentAccordion from "../../components/courses/CourseContentAccordion"
import { useAuth } from "../../context/AuthContext"

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)

  // Fetch course data
  const { data: courseData, isLoading: isLoadingCourse } = useQuery(["course", id], () => getCourseById(id!), {
    enabled: !!id,
    onError: (err) => {
      console.error("Failed to fetch course data:", err)
      setError("Failed to load course data. Please try again later.")
    },
  })

  // Fetch assessment data
  const { data: assessmentData, isLoading: isLoadingAssessment } = useQuery(
    ["assessment", id],
    () => getAssessmentForCourse(id!),
    {
      enabled: !!id,
      onError: (err) => {
        console.error("Failed to fetch assessment data:", err)
        // Not setting error here as assessment is optional
      },
    },
  )
  console.log(`${JSON.stringify(assessmentData)}`)
  // Enroll mutation
  const enrollMutation = useMutation((courseId: string) => enrollInCourse(courseId), {
    onSuccess: () => {
      // Present user with assessment based on the course and if their scores are 50 or above navigate to the /course/${id}/learn
      try {
        const assessment = Array.isArray(assessmentData)? assessmentData[0] :
          assessmentData
        if (assessment) {
          // Navigate to the assessment page
          navigate(`/assessment/${assessment._id}`);
        } else {
          // If not assessment, navigate straight to the learning page
          navigate(`/course/${id}/learn`);
        }
      } catch (error) {
        console.error(`Error occured during post-enrollment navigation:`, error);
        setError(`An error occured after enrollment. Please try again`)
      }
    },
    onError: (err) => {
      console.error("Failed to enroll in course:", err)
      setError("Failed to enroll in course. Please try again later.")
    },
  })

  const handleEnroll = () => {
    if (!course || !user) return
    enrollMutation.mutate(course._id)
  }

  const handleTakeAssessment = () => {
    if (assessment) {
      navigate(`/assessment/${assessment._id}`)
    }
  }

  const isLoading = isLoadingCourse || isLoadingAssessment
  const course = courseData?.course
  const assessment = assessmentData?.assessments?.[0]

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-sm text-red-700 dark:text-red-400">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          {error}
        </p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course not found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          The course you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/courses" className="mt-4 inline-block btn btn-primary">
          <i className="fa-solid fa-arrow-left mr-2"></i>
          Browse Courses
        </Link>
      </div>
    )
  }

  const img = course.category === 'Programming'? 'https://i.ibb.co/HMx40dF/programming.webp' :
    course.category === 'Data Science'? 'https://i.ibb.co/PZm982nX/data-science.webp" ' :
    course.category === 'Web Development'? 'https://i.ibb.co/8nVQrXVc/web-dev.webp' :
    course.category === 'Mobile Development'? 'https://i.ibb.co/W4dwScpv/mobile-dev.webp' :
    course.category === 'DevOps'? 'https://i.ibb.co/6R6MsRvZ/devops.webp':
    course.category === 'Cloud Computing'? 'https://i.ibb.co/WNP55yFF/cloud-computing.webp' :
    course.category === 'Cybersecurity'? 'https://i.ibb.co/cq9xKY0/cybersecurity.webp':
    course.category === 'Artificial Intelligence'? 'https://i.ibb.co/KpQhxcMf/artificial-intelligence.webp':
    'https://i.ibb.co/63Dv0cm/tech-tools.webp'

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/courses" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 flex items-center">
          <i className="fa-solid fa-arrow-left mr-1"></i>
          Back to Courses
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="relative pb-1/3">
          <img
            src={img}
            alt={course.title}
            className="absolute h-full w-full object-cover"
          />
        </div>

        <div className="p-6">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="badge badge-primary">
                  <i className="fa-solid fa-folder mr-1"></i>
                  {course.category}
                </span>
                <span className="badge badge-secondary">
                  <i className="fa-solid fa-gauge-high mr-1"></i>
                  {course.difficulty}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {assessment && (
                <button onClick={handleTakeAssessment} className="btn btn-secondary">
                  <i className="fa-solid fa-clipboard-check mr-2"></i>
                  Take Prerequisite Assessment
                </button>
              )}
              <button onClick={handleEnroll} disabled={enrollMutation.isLoading} className="btn btn-primary">
                {enrollMutation.isLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                    Enrolling...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-graduation-cap mr-2"></i>
                    Enroll Now
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <i className="fa-solid fa-circle-info mr-2 text-primary-500"></i>
              About this course
            </h2>
            <p className="mt-2 text-gray-700 dark:text-gray-300">{course.description}</p>
          </div>

          {course.prerequisites.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                <i className="fa-solid fa-list-check mr-2 text-primary-500"></i>
                Prerequisites
              </h2>
              <ul className="mt-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                {course.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <i className="fa-solid fa-book mr-2 text-primary-500"></i>
              Course Content
            </h2>
            <div className="mt-2">
              <CourseContentAccordion sections={course.content.sections} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailPage
