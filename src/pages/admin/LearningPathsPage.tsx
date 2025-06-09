"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { learningPathService } from "../../services/learningPathService"
import type { LearningPath } from "../../types"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const AdminLearningPathsPage = () => {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10

  useEffect(() => {
    fetchLearningPaths()
  }, [currentPage])

  const fetchLearningPaths = async () => {
    try {
      setLoading(true)
      const skip = (currentPage - 1) * itemsPerPage
      const response = await learningPathService.getLearningPaths(skip, itemsPerPage)
      setLearningPaths(response.learning_paths)
      setTotalCount(response.count)
    } catch (err) {
      setError("Failed to fetch learning paths")
      console.error("Error fetching learning paths:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this learning path?")) {
      try {
        await learningPathService.deleteLearningPath(id)
        fetchLearningPaths()
      } catch (err) {
        setError("Failed to delete learning path")
        console.error("Error deleting learning path:", err)
      }
    }
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Paths</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage learning paths and their course sequences</p>
        </div>
        <Link to="/admin/learning-path/create">
          <Button>
            <i className="fa-solid fa-plus mr-2"></i>
            Create Learning Path
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Learning Paths</CardTitle>
            <i className="fa-solid fa-route h-4 w-4 text-muted-foreground"></i>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Paths List */}
      <Card>
        <CardHeader>
          <CardTitle>All Learning Paths</CardTitle>
        </CardHeader>
        <CardContent>
          {learningPaths.length === 0 ? (
            <div className="text-center py-8">
              <i className="fa-solid fa-route text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-500 dark:text-gray-400">No learning paths found</p>
              <Link to="/admin/learning-path/create" className="mt-4 inline-block">
                <Button>Create Your First Learning Path</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {learningPaths.map((path) => (
                <div
                  key={path._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{path.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{path.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary">
                          <i className="fa-solid fa-book mr-1"></i>
                          {path.courses.length} Courses
                        </Badge>
                        <Badge variant="outline">
                          <i className="fa-solid fa-target mr-1"></i>
                          {path.target_skills.length} Skills
                        </Badge>
                      </div>

                      {path.target_skills.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Target Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {path.target_skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {path.target_skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{path.target_skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Created: {new Date(path.created_at).toLocaleDateString()}
                        {path.updated_at && (
                          <span className="ml-4">Updated: {new Date(path.updated_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Link to={`/admin/learning-path/${path._id}/edit`}>
                        <Button variant="outline" size="sm">
                          <i className="fa-solid fa-edit mr-1"></i>
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(path._id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <i className="fa-solid fa-trash mr-1"></i>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <i className="fa-solid fa-chevron-left mr-1"></i>
                Previous
              </Button>

              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <i className="fa-solid fa-chevron-right ml-1"></i>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminLearningPathsPage
