import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAllCourses, deleteCourse } from "../../services/courseService"
import LoadingSpinner from "../../components/common/LoadingSpinner"

const AdminCoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const coursesPerPage = 10

  const queryClient = useQueryClient()

  // Fetch courses
  const { data: coursesData, isLoading, error } = useQuery(["adminCourses"], () => getAllCourses({ limit: 100 }))

  // Delete course mutation
  const deleteMutation = useMutation((courseId: string) => deleteCourse(courseId), {
    onSuccess: () => {
      queryClient.invalidateQueries(["adminCourses"])
      setShowDeleteConfirm(null)
    },
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-sm text-red-700 dark:text-red-400">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          Failed to load courses. Please try again later.
        </p>
      </div>
    )
  }

  const courses = coursesData?.courses || []

  // Get unique categories for filter
  const categories = Array.from(new Set(courses.map((course) => course.category)))

  // Filter courses
  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === "" || course.category === categoryFilter),
  )

  // Pagination
  const indexOfLastCourse = currentPage * coursesPerPage
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse)
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const handleDeleteClick = (courseId: string | undefined) => {
    if (courseId)
      setShowDeleteConfirm(courseId)
  }

  const handleConfirmDelete = (courseId: string | undefined) => {
    if (courseId)
      deleteMutation.mutate(courseId)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            <i className="fa-solid fa-book mr-2 text-primary-500"></i>
            Manage Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Create, edit, and delete courses</p>
        </div>
        <Link to="/admin/course/create" className="btn btn-primary mt-4 md:mt-0">
          <i className="fa-solid fa-plus mr-2"></i>
          Create New Course
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="form-label">
              <i className="fa-solid fa-search mr-2 text-gray-500"></i>
              Search Courses
            </label>
            <input
              id="search"
              type="text"
              className="input"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          <div>
            <label htmlFor="category" className="form-label">
              <i className="fa-solid fa-folder mr-2 text-gray-500"></i>
              Filter by Category
            </label>
            <select
              id="category"
              className="input"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Difficulty
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Sections
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Created
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentCourses.length > 0 ? (
                currentCourses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <i className="fa-solid fa-book text-gray-500 dark:text-gray-400"></i>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{course.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-400">
                        {course.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {course.content.sections.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(course.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {showDeleteConfirm === course._id ? (
                        <div className="flex justify-end items-center space-x-2">
                          <button
                            onClick={() => handleConfirmDelete(course._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={handleCancelDelete}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end items-center space-x-4">
                          <Link
                            to={`/admin/course/${course._id}/edit`}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            <i className="fa-solid fa-edit"></i>
                            <span className="sr-only">Edit</span>
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(course._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <i className="fa-solid fa-trash"></i>
                            <span className="sr-only">Delete</span>
                          </button>
                          <Link
                            to={`/course/${course._id}`}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            <i className="fa-solid fa-eye"></i>
                            <span className="sr-only">View</span>
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No courses found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredCourses.length > coursesPerPage && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600"
                    : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600"
                    : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  Showing <span className="font-medium">{indexOfFirstCourse + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(indexOfLastCourse, filteredCourses.length)}</span> of{" "}
                  <span className="font-medium">{filteredCourses.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600"
                        : "bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <i className="fa-solid fa-chevron-left h-5 w-5"></i>
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600"
                        : "bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <i className="fa-solid fa-chevron-right h-5 w-5"></i>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCoursesPage
