"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { learningPathService } from "../../services/learningPathService"
import { getAllCourses } from "../../services/courseService"
import type { Course } from "../../types"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const AdminLearningPathCreatePage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courses: [] as string[],
    target_skills: [] as string[],
  })

  const [newSkill, setNewSkill] = useState("")

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true)
      const response = await getAllCourses({ limit:100, skip: 0 }) // Get more courses for selection
      setAvailableCourses(response.courses)
    } catch (err) {
      setError("Failed to fetch courses")
      console.error("Error fetching courses:", err)
    } finally {
      setCoursesLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCourseToggle = (courseId: string) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter((id) => id !== courseId)
        : [...prev.courses, courseId],
    }))
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.target_skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        target_skills: [...prev.target_skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      target_skills: prev.target_skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setError("Title is required")
      return
    }

    if (!formData.description.trim()) {
      setError("Description is required")
      return
    }

    if (formData.courses.length === 0) {
      setError("At least one course must be selected")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await learningPathService.createLearningPath(formData)
      navigate("/admin/learning-paths")
    } catch (err) {
      setError("Failed to create learning path")
      console.error("Error creating learning path:", err)
    } finally {
      setLoading(false)
    }
  }

  if (coursesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate("/admin/learning-paths")}>
          <i className="fa-solid fa-arrow-left mr-2"></i>
          Back to Learning Paths
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Learning Path</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Create a new learning path with a sequence of courses</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter learning path title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter learning path description"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Course Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Course Selection *</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select courses to include in this learning path. The order will determine the sequence.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableCourses.map((course) => (
                <div
                  key={course._id}
                  className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <input
                    type="checkbox"
                    id={`course-${course._id}`}
                    checked={formData.courses.includes(course._id? course._id : '')}
                    onChange={() => handleCourseToggle(course._id? course._id : '')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`course-${course._id}`}
                      className="font-medium text-gray-900 dark:text-white cursor-pointer"
                    >
                      {course.title}
                    </label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{course.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Category: {course.category}</span>
                      <span>Difficulty: {course.difficulty}</span>
                      <span>Enrolled: {course.enrollment_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {formData.courses.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Selected {formData.courses.length} course(s) for this learning path
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Target Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Target Skills</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add skills that learners will acquire by completing this learning path
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter a skill"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
              />
              <Button type="button" onClick={handleAddSkill}>
                Add Skill
              </Button>
            </div>

            {formData.target_skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.target_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/learning-paths")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner />
                Creating...
              </>
            ) : (
              <>
                <i className="fa-solid fa-save mr-2"></i>
                Create Learning Path
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AdminLearningPathCreatePage
