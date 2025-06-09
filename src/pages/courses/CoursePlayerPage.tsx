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

interface CourseProgress {
  currentSectionIndex: number
  currentSubsectionIndex: number
  currentDataIndex: number
  completedItems: number
  totalItems: number
}

export default function CoursePlayerPage() {
  const { id } = useParams<{ id: string }>()
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
    if (id) {
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
      await updateProgress(id!, progressPercentage)
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

    // If course is completed, navigate to completion page or course detail
    if (newProgress.completedItems === newProgress.totalItems) {
      // navigate(`/courses/${id}?completed=true`)
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
        <Button variant="ghost" onClick={() => navigate(`/courses/${id}`)} className="mb-4">
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










// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { getCourseById, completeCourse } from "../../services/courseService";

// interface Course {
//   title: string;
//   description: string;
//   category: string;
//   prerequisites: string[];
//   content: {
//     sections: Section[];
//     tags: string[];
//   };
//   difficulty: string;
//   created_at: string;
//   updated_at: string;
//   enrollment_count: number;
//   enrolled_users: string[];
//   completed_users: string[];
// }

// interface Section {
//   section_id: string;
//   title: string;
//   order: number;
//   sub_sections: SubSection[];
// }

// interface SubSection {
//   subsection_id: string;
//   title: string;
//   order: number;
//   data: Data[];
// }

// interface Data {
//   data_id: string;
//   order: number;
//   type: "text" | "image";
//   content: string;
// }

// const CoursePlayerPage: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const [course, setCourse] = useState<Course | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
//   const navigate = useNavigate()

//   useEffect(() => {
//     const fetchCourse = async () => {
//       try {
//         if (!id) {
//           setError("Course ID is missing.");
//           setLoading(false);
//           return;
//         }

//         const response = await getCourseById(id); // Fetch course data from the backend
//         setCourse(response.course);
//       } catch (err) {
//         setError("Failed to load course data. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCourse();
//   }, [id]);

//   const handleNextSection = () => {
//     if (course && currentSectionIndex < course.content.sections.length - 1) {
//       setCurrentSectionIndex((prevIndex) => prevIndex + 1);
//     }
//   };

//   const handlePreviousSection = () => {
//     if (currentSectionIndex > 0) {
//       setCurrentSectionIndex((prevIndex) => prevIndex - 1);
//     }
//   };

//   const handleCompleteCourse = async () => {
//     alert("Congratulations! You have completed this course.");
//     // Add logic to mark the course as complete in the backend
//     try {
//       setLoading(true)
//       const markComplete = await completeCourse(id)
//       if (markComplete.message) {
//         // navigate to courses
//         navigate('/courses')
//       } else {
//         navigate(`/course/${id}/learn`)
//       }
//     } catch (error) {
//       console.error(error)
//       throw error
//     }
//   };

//   if (loading) {
//     return <div className="text-center py-10">Loading course...</div>;
//   }

//   if (error || !course) {
//     return (
//       <div className="text-center py-10 text-red-500">
//         {error || "Course not found."}
//       </div>
//     );
//   }

//   const currentSection = course.content.sections[currentSectionIndex];

//   return (
//     <div className="p-4">
//       {/* Course Title and Description */}
//       <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
//       <p className="text-gray-700 mb-4 dark:text-gray-50">{course.description}</p>

//       {/* Current Section */}
//       <div className="space-y-8">
//         <div key={currentSection.section_id} className="border-b pb-4">
//           <h2 className="text-2xl font-semibold mb-4">{currentSection.title}</h2>

//           {/* Sub-Sections */}
//           {currentSection.sub_sections.map((subSection) => (
//             <div key={subSection.subsection_id} className="pl-4 mb-6">
//               <h3 className="text-xl font-medium mb-2">{subSection.title}</h3>

//               {/* Data (Text or Images) */}
//               {subSection.data.map((data) => (
//                 <div key={data.data_id} className="mb-4">
//                   {data.type === "text" ? (
//                     <p className="text-gray-800 dark:text-gray-50">{data.content}</p>
//                   ) : data.type === "image" ? (
//                     <img
//                       src={data.content}
//                       alt={`Content for ${subSection.title}`}
//                       className="rounded shadow max-w-full h-auto"
//                     />
//                   ) : null}
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Navigation Buttons */}
//       <div className="flex justify-between mt-8">
//         {currentSectionIndex > 0 && (
//           <button
//             onClick={handlePreviousSection}
//             className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
//           >
//             Previous Section
//           </button>
//         )}
//         {currentSectionIndex < course.content.sections.length - 1 ? (
//           <button
//             onClick={handleNextSection}
//             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//           >
//             Next Section
//           </button>
//         ) : (
//           <button
//             onClick={handleCompleteCourse}
//             className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//           >
//             Complete Course
//           </button>
//         )}
//       </div>

//       {/* Tags */}
//       {course.content.tags.length > 0 && (
//         <div className="mt-8">
//           <h3 className="text-lg font-semibold mb-2">Tags:</h3>
//           <div className="flex flex-wrap gap-2">
//             {course.content.tags.map((tag, index) => (
//               <span
//                 key={index}
//                 className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
//               >
//                 {tag}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CoursePlayerPage;
