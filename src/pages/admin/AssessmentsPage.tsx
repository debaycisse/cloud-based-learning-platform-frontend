import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { getAssessments, deleteAssessment } from "../../services/assessmentService"
import { getQuestionByAssessmentId } from "../../services/questionService"
import type { Assessment } from "../../types"

const AssessmentsPage: React.FC = () => {
  const navigate = useNavigate()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [questionsCount, setQuestionsCount] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch assessments and their question counts
  useEffect(() => {
    const fetchAssessmentsAndQuestions = async () => {
      try {
        setIsLoading(true)

        // Fetch assessments
        const { assessments: fetchedAssessments } = await getAssessments()

        // Fetch question counts for each assessment
        const questionCounts: Record<string, number> = {}
        await Promise.all(
          fetchedAssessments.map(async (assessment) => {
            const { questions } = await getQuestionByAssessmentId(assessment._id)
            questionCounts[assessment._id] = questions.length
          }),
        )

        setAssessments(fetchedAssessments)
        setQuestionsCount(questionCounts)
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch assessments. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessmentsAndQuestions()
  }, [])

  // Delete assessment logic
  const handleDelete = async (assessmentId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this assessment? This action cannot be undone.",
    )
    if (!confirmDelete) return

    try {
      setIsLoading(true)
      await deleteAssessment(assessmentId) // Call the delete API
      setAssessments((prev) => prev.filter((assessment) => assessment._id !== assessmentId)) // Remove the deleted assessment from the state
      setQuestionsCount((prev) => {
        const updatedCounts = { ...prev }
        delete updatedCounts[assessmentId]
        return updatedCounts
      }) // Remove the question count for the deleted assessment
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete the assessment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Assessments</h1>
        <Link
          to="/admin/assessment/create"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          Create Assessment
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
          <p className="text-gray-600 mt-2">Loading assessments...</p>
        </div>
      ) : assessments.length > 0 ? (
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Title</th>
              <th className="py-2 px-4 border-b">Questions</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((assessment) => (
              <tr key={assessment._id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{assessment.title}</td>
                <td className="py-2 px-4 border-b">{questionsCount[assessment._id] || 0}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    className="text-blue-500 hover:underline mr-2"
                    onClick={() => navigate(`/admin/assessment/${assessment._id}/edit`)}
                  >
                    Edit
                  </button>
                  <button className="text-red-500 hover:underline" onClick={() => handleDelete(assessment._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600">No assessments found.</p>
      )}
    </div>
  )
}

export default AssessmentsPage
