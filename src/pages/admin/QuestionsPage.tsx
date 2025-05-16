import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { getQuestions, deleteQuestion } from "../../services/questionService"
import type { Question } from "../../types"

const QuestionsPage = () => {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const questionsPerPage = 10

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true)
        const skip = (currentPage - 1) * questionsPerPage
        const { questions: fetchedQuestions, count } = await getQuestions(questionsPerPage, skip)
        setQuestions(fetchedQuestions)
        setTotalQuestions(count)
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch questions. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [currentPage])

  // Delete question logic
  const handleDelete = async (questionId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this question? This action cannot be undone.")
    if (!confirmDelete) return

    try {
      setIsLoading(true)
      await deleteQuestion(questionId)
      setQuestions((prev) => prev.filter((question) => question._id !== questionId))
      // If we delete the last question on a page, go to previous page (unless we're on page 1)
      if (questions.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      } else {
        // Refresh the current page
        const skip = (currentPage - 1) * questionsPerPage
        const { questions: fetchedQuestions, count } = await getQuestions(questionsPerPage, skip)
        setQuestions(fetchedQuestions)
        setTotalQuestions(count)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete the question. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle pagination
  const totalPages = Math.ceil(totalQuestions / questionsPerPage)
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Truncate long question text
  const truncateText = (text: string, maxLength = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Questions</h1>
        <Link
          to="/admin/question/create"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          Create Question
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-primary-500 text-2xl"></i>
          <p className="text-gray-600 mt-2">Loading questions...</p>
        </div>
      ) : questions.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-50 border border-gray-200 rounded-lg shadow">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="py-2 px-4 border-b text-left">Question</th>
                  <th className="py-2 px-4 border-b text-left">Tags</th>
                  <th className="py-2 px-4 border-b text-center">Options</th>
                  <th className="py-2 px-4 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question._id} className="hover:bg-gray-50 dark:bg-gray-800">
                    <td className="py-2 px-4 border-b">{truncateText(question.question_text)}</td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex flex-wrap gap-1">
                        {question.tags?.map((tag, index) => (
                          <span key={index} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b text-center">{question.options?.length || 0}</td>
                    <td className="py-2 px-4 border-b text-center">
                      <Link to={`/admin/question/${question._id}/edit`} className="text-blue-500 hover:underline mr-2">
                        Edit
                      </Link>
                      <button className="text-red-500 hover:underline" onClick={() => handleDelete(question._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <nav className="flex items-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md mr-2 bg-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md mx-1 ${
                      currentPage === page ? "bg-primary-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md ml-2 bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-600">No questions found.</p>
      )}
    </div>
  )
}

export default QuestionsPage
