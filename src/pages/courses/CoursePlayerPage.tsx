"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Progress } from "../../components/ui/progress"
import { Badge } from "../../components/ui/badge"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { getCourseById } from "../../services/courseService"
import { updateProgress } from "../../services/userService"
import type { Course } from "../../types"
import { ChevronLeft, ChevronRight, CheckCircle, BookOpen, Clock } from "lucide-react"
import { completeCourse } from "../../services/courseService"
import { getUserProgress } from "../../services/userService"

interface CourseProgress {
  currentSectionIndex: number
  currentSubsectionIndex: number
  currentDataIndex: number
  completedItems: number
  totalItems: number
}

export default function CoursePlayerPage() {
  // percentagValue is used to track the point of course continuation

  const { id, percentagValue } = useParams<{ id: string; percentagValue: string }>()
  const navigate = useNavigate()

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<CourseProgress>({
    currentSectionIndex: 0,
    currentSubsectionIndex: 0,
    currentDataIndex: 0,
    completedItems: 0,
    totalItems: 0,
  })
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false)

  useEffect(() => {
    if (id && percentagValue) {
      fetchCourseWithContentPoint()
    }
    else if (id) {
      fetchCourse()
    }
  }, [id])

  const fetchCourse = async () => {
    try {
      setLoading(true)
      const courseData = await getCourseById(id!)
      setCourse(courseData.course)

      // Calculate total items and initialize progress
      const totalItems = calculateTotalItems(courseData.course)
      setProgress((prev) => ({
        ...prev,
        totalItems,
        completedItems: 0,
      }))
    } catch (err) {
      setError("Failed to load course")
      console.error("Error fetching course:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourseWithContentPoint = async () => {
    try {
      setLoading(true)
      // Fetch course data
      const courseData = await getCourseById(id!)
      setCourse(courseData.course)

      // Fetch content staring point data
      const userProgressData = (await getUserProgress());
      const courseProgressData = userProgressData.course_progress[0];

      // Calculate total items and initialize progress
      const totalItems = calculateTotalItems(courseData.course)
      setProgress((prev) => ({
        ...prev,
        currentSectionIndex: courseProgressData.current_section_index,
        currentSubsectionIndex: courseProgressData.current_subsection_index,
        currentDataIndex: courseProgressData.current_data_index,
        completedItems: courseProgressData.completed_items,
        totalItems,
      }))
    } catch (err) {
      setError("Failed to load course")
      console.error("Error fetching course:", err)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalItems = (course: Course): number => {
    let total = 0
    course.content.sections.forEach((section) => {
      section.sub_sections.forEach((subsection) => {
        total += subsection.data.length
      })
    })
    return total
  }

  const calculateProgressPercentage = (completedItems: number, totalItems: number): number => {
    if (totalItems === 0) return 0
    return Math.round((completedItems / totalItems) * 100)
  }

  const updateUserProgress = async (progressPercentage: number) => {
    try {
      setIsUpdatingProgress(true)
      await updateProgress(
        id!, progressPercentage, progress.currentSectionIndex,
        progress.currentSubsectionIndex, progress.currentDataIndex,
        progress.completedItems
      )
    } catch (err) {
      console.error("Error updating progress:", err)
    } finally {
      setIsUpdatingProgress(false)
    }
  }

  const handleNext = async () => {
    if (!course) return

    const { currentSectionIndex, currentSubsectionIndex, currentDataIndex } = progress
    const currentSection = course.content.sections[currentSectionIndex]
    const currentSubsection = currentSection.sub_sections[currentSubsectionIndex]

    const newProgress = { ...progress }

    // Move to next data item
    if (currentDataIndex < currentSubsection.data.length - 1) {
      newProgress.currentDataIndex = currentDataIndex + 1
      newProgress.completedItems = progress.completedItems + 1
    }
    // Move to next subsection
    else if (currentSubsectionIndex < currentSection.sub_sections.length - 1) {
      newProgress.currentSubsectionIndex = currentSubsectionIndex + 1
      newProgress.currentDataIndex = 0
      newProgress.completedItems = progress.completedItems + 1
    }
    // Move to next section
    else if (currentSectionIndex < course.content.sections.length - 1) {
      newProgress.currentSectionIndex = currentSectionIndex + 1
      newProgress.currentSubsectionIndex = 0
      newProgress.currentDataIndex = 0
      newProgress.completedItems = progress.completedItems + 1
    }
    // Course completed
    else {
      newProgress.completedItems = progress.totalItems
    }

    setProgress(newProgress)

    // Update progress on backend
    const progressPercentage = calculateProgressPercentage(newProgress.completedItems, newProgress.totalItems)
    await updateUserProgress(progressPercentage)

    if (newProgress.completedItems === newProgress.totalItems) {
      // call the backend to process course completion
      await completeCourse(id)
      navigate('/progress')
    }
  }

  const handlePrevious = () => {
    if (!course) return

    const { currentSectionIndex, currentSubsectionIndex, currentDataIndex } = progress
    const newProgress = { ...progress }

    // Move to previous data item
    if (currentDataIndex > 0) {
      newProgress.currentDataIndex = currentDataIndex - 1
      newProgress.completedItems = Math.max(0, progress.completedItems - 1)
    }
    // Move to previous subsection
    else if (currentSubsectionIndex > 0) {
      const prevSubsection = course.content.sections[currentSectionIndex].sub_sections[currentSubsectionIndex - 1]
      newProgress.currentSubsectionIndex = currentSubsectionIndex - 1
      newProgress.currentDataIndex = prevSubsection.data.length - 1
      newProgress.completedItems = Math.max(0, progress.completedItems - 1)
    }
    // Move to previous section
    else if (currentSectionIndex > 0) {
      const prevSection = course.content.sections[currentSectionIndex - 1]
      const lastSubsection = prevSection.sub_sections[prevSection.sub_sections.length - 1]
      newProgress.currentSectionIndex = currentSectionIndex - 1
      newProgress.currentSubsectionIndex = prevSection.sub_sections.length - 1
      newProgress.currentDataIndex = lastSubsection.data.length - 1
      newProgress.completedItems = Math.max(0, progress.completedItems - 1)
    }

    setProgress(newProgress)
  }

  const getCurrentContent = () => {
    if (!course) return null

    const { currentSectionIndex, currentSubsectionIndex, currentDataIndex } = progress
    const currentSection = course.content.sections[currentSectionIndex]
    const currentSubsection = currentSection.sub_sections[currentSubsectionIndex]
    const currentData = currentSubsection.data[currentDataIndex]

    return {
      section: currentSection,
      subsection: currentSubsection,
      data: currentData,
    }
  }

  const renderContent = (data: any) => {
    switch (data.type) {
      case "text":
        return (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{data.content}</p>
          </div>
        )
      case "image":
        return (
          <div className="my-6">
            <img
              src={data.content || "/placeholder.svg"}
              alt={data.alt_text || "Course content image"}
              className="max-w-full h-auto rounded-lg shadow-md"
            />
            {data.caption && <p className="text-sm text-gray-600 mt-2 text-center italic">{data.caption}</p>}
          </div>
        )
      case "video":
        return (
          <div className="my-6">
            <video controls className="w-full rounded-lg shadow-md" src={data.content}>
              Your browser does not support the video tag.
            </video>
            {data.caption && <p className="text-sm text-gray-600 mt-2 text-center italic">{data.caption}</p>}
          </div>
        )
      default:
        return (
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-600">Unsupported content type: {data.type}</p>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-600 mb-4">{error || "Course not found"}</p>
            <Button onClick={() => navigate("/courses")}>Back to Courses</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentContent = getCurrentContent()
  const progressPercentage = calculateProgressPercentage(progress.completedItems, progress.totalItems)
  const isFirstItem =
    progress.currentSectionIndex === 0 && progress.currentSubsectionIndex === 0 && progress.currentDataIndex === 0
  const isLastItem = progress.completedItems >= progress.totalItems

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(`/course/${id}`)} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <Badge variant="secondary">{course.difficulty}</Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>
              {progress.completedItems} of {progress.totalItems} items completed
            </span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
          <div className="text-right text-sm font-medium text-gray-700">{progressPercentage}% Complete</div>
        </div>
      </div>

      {/* Current Content */}
      {currentContent && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{currentContent.subsection.title}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Section {progress.currentSectionIndex + 1}: {currentContent.section.title}
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <BookOpen className="w-4 h-4" />
                <span>
                  Item {progress.currentDataIndex + 1} of {currentContent.subsection.data.length}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>{renderContent(currentContent.data)}</CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handlePrevious} disabled={isFirstItem}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="text-sm text-gray-600">
          {progress.currentSectionIndex + 1} of {course.content.sections.length} sections
        </div>

        <Button onClick={handleNext} disabled={isLastItem || isUpdatingProgress} className="min-w-[100px]">
          {isUpdatingProgress ? (
            <LoadingSpinner />
          ) : isLastItem ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Course Info */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-gray-500" />
              <span>{course.content.sections.length} sections</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>{progress.totalItems} learning items</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-gray-500" />
              <span>{progressPercentage}% completed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
