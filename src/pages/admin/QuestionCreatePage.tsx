import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { createQuestion } from "../../services/questionService"

// Define schema for question creation
const questionSchema = z.object({
  question_text: z.string().min(5, "Question text must be at least 5 characters"),
  options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "At least 2 options are required").nonempty(),
  correct_answer: z.string().min(1, "Correct answer is required"),
  tags: z.array(z.string()).optional(),
})

type QuestionFormData = z.infer<typeof questionSchema>

const QuestionCreatePage = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState("")

  // Initialize form with default values
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question_text: "",
      options: ["", ""],
      correct_answer: "",
      tags: [],
    },
  })

  // Use field array for dynamic options
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  })

  const watchTags = watch("tags") || []

  // Handle form submission
  const onSubmit = async (data: QuestionFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      await createQuestion(data)
      navigate("/admin/questions")
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create question. Please try again.")
      setIsSubmitting(false)
    }
  }

  // Handle adding tags
  const handleAddTag = () => {
    if (tagInput.trim() && !watchTags.includes(tagInput.trim())) {
      setValue("tags", [...watchTags, tagInput.trim()])
      setTagInput("")
    }
  }

  // Handle removing tags
  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "tags",
      watchTags.filter((tag) => tag !== tagToRemove),
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          <i className="fa-solid fa-question-circle mr-2 text-primary-500"></i>
          Create New Question
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Add a new question to the question bank</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <i className="fa-solid fa-pen mr-2 text-primary-500"></i>
            Question Details
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="question_text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Question Text
              </label>
              <textarea
                id="question_text"
                rows={3}
                className={`mt-1 block w-full rounded-md border ${
                  errors.question_text ? "border-red-500" : "border-gray-300"
                } shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500`}
                placeholder="Enter your question here..."
                {...register("question_text")}
              ></textarea>
              {errors.question_text && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.question_text.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Options</label>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center">
                    <input
                      type="text"
                      className={`flex-1 rounded-md border ${
                        errors.options?.[index] ? "border-red-500" : "border-gray-300"
                      } shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500`}
                      placeholder={`Option ${index + 1}`}
                      {...register(`options.${index}`)}
                    />
                    {index > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <i className="fa-solid fa-trash"></i>
                        <span className="sr-only">Remove Option</span>
                      </button>
                    )}
                  </div>
                ))}
                {errors.options && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.options.message}</p>
                )}
                <button
                  type="button"
                  onClick={() => append("")}
                  className="text-sm text-primary-600 hover:text-primary-500 flex items-center"
                >
                  <i className="fa-solid fa-plus mr-1"></i>
                  Add Option
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="correct_answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Correct Answer
              </label>
              <input
                id="correct_answer"
                type="text"
                className={`mt-1 block w-full rounded-md border ${
                  errors.correct_answer ? "border-red-500" : "border-gray-300"
                } shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500`}
                placeholder="Enter the correct answer"
                {...register("correct_answer")}
              />
              {errors.correct_answer && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.correct_answer.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {watchTags.map((tag, index) => (
                  <span key={index} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded flex items-center">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-gray-600 hover:text-gray-800"
                    >
                      <i className="fa-solid fa-times"></i>
                      <span className="sr-only">Remove Tag</span>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="flex-1 rounded-l-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Add a tag"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-r-md px-3"
                >
                  Add
                </button>
              </div>
            </div>

          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/admin/questions")}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                Creating...
              </>
            ) : (
              "Create Question"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default QuestionCreatePage
