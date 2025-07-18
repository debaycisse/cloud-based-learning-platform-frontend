import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getAssessmentById,
  updateAssessment,
} from "../../services/assessmentService";
import {
  getQuestionByAssessmentId,
  updateQuestion as updateQuestionInBackend,
} from "../../services/questionService";

// Define schema for assessment editing
const assessmentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  courseId: z.string().default(""),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  questions: z.array(
    z.object({
      _id: z.string().optional(),
      question_text: z.string().min(1, "Question is required"),
      options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "At least two options required"),
      correct_answer: z.string().min(1, "Correct answer is required"),
      tags: z.array(z.string()).optional(),
    })
  ),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>

const AssessmentEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with default values
  const {
    setValue,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      title: "",
      courseId: "",
      questions: [
        {
          question_text: "",
          options: ["", ""],
          correct_answer: "",
          tags: ["", ""],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const questions = watch("questions");

  // Fetch assessment details and questions on component mount
  useEffect(() => {
    const fetchAssessmentAndQuestions = async () => {
      try {
        // Fetch assessment details
        const assessment = await getAssessmentById(id!);
        // console.log(`Assessment fetched: ${JSON.stringify(assessment)}`);

        // Fetch questions associated with the assessment
        const { questions: fetchedQuestions } = await getQuestionByAssessmentId(
          id!
        );
        // console.log(`Questions fetched: ${JSON.stringify(fetchedQuestions)}`);

        // Reset form with fetched data
        reset({
          title: assessment.title,
          courseId: assessment.course_id,
          createdAt: new Date(assessment.created_at),
          updatedAt: new Date(assessment.updated_at),
          questions: fetchedQuestions.map((q) => ({
            _id: q._id,
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            tags: q.tags || [],
          })),
        });
      } catch (err: any) {
        setError(
          err.response?.data?.error ||
            "Failed to fetch assessment details. Please try again."
        );
      }
    };

    fetchAssessmentAndQuestions();
  }, [id, reset]);

  // Handle form submission
  const onSubmit = async (data: AssessmentFormData) => {
    // console.log(`HERE :::::`)
    setIsSubmitting(true);
    setError(null);
    // console.log(`\nInside onSubmit ::: data is ${JSON.stringify(data)}\n`)
    try {
      // Update the assessment details (excluding questions)
      await updateAssessment(id!, {
        title: data.title,
        course_id: data.courseId,
      });

      // Update the questions separately
      // console.log(`Questions ${JSON.stringify(data)}\n`)
      await Promise.all(
        data.questions.map((q) => {
          const question = {
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            tags: q.tags || [],
          }
          updateQuestionInBackend(q._id!, question)}
        )
      );

      navigate("/admin/assessments");
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Failed to update assessment. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  // Helper functions to manage questions
  const addQuestion = () => {
    setValue("questions", [
      ...questions,
      { question_text: "", options: ["", ""], correct_answer: "" },
    ]);
  };

  const updateQuestion = (
    index: number,
    field: keyof AssessmentFormData["questions"][number],
    value: string
  ) => {
    const updatedQuestions = [...questions];
    if (field === "question_text" || field === "correct_answer") {
      updatedQuestions[index][field] = value;
      setValue("questions", updatedQuestions);
    }
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setValue("questions", updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push("");
    setValue("questions", updatedQuestions);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setValue("questions", updatedQuestions);
    // console.log(`Concerned question AFTER update ::: ${JSON.stringify(updatedQuestions[questionIndex])}`);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options = updatedQuestions[
      questionIndex
    ].options.filter((_, i) => i !== optionIndex);
    setValue("questions", updatedQuestions);
  };

  const addTag = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].tags?.push("");
    setValue("questions", updatedQuestions);
  };

  const updateTag = (
    questionIndex: number,
    tagIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].tags[tagIndex] = value;
    setValue("questions", updatedQuestions);
  };

  const removeTag = (questionIndex: number, tagIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].tags = updatedQuestions[
        questionIndex
      ].tags.filter((_, i) => i !== tagIndex);
      setValue("questions", updatedQuestions);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          <i className="fa-solid fa-clipboard-list mr-2 text-primary-500"></i>
          Edit Assessment
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update the details of the assessment
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <i className="fa-solid fa-info-circle mr-2 text-primary-500"></i>
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="form-label">
                Assessment Title
              </label>
              <input
                id="title"
                type="text"
                className={`input ${errors.title ? "border-red-500" : ""}`}
                placeholder="e.g. JavaScript Basics Quiz"
                {...register("title")}
              />
              {errors.title && (
                <p className="form-error">{errors.title.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <i className="fa-solid fa-question-circle mr-2 text-primary-500"></i>
            Questions
          </h2>

          <div className="space-y-6">
            {questions.map((question, questionIndex) => (
              <div
                key={questionIndex}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">
                    Question {questionIndex + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeQuestion(questionIndex)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <i className="fa-solid fa-trash"></i>
                    <span className="sr-only">Remove Question</span>
                  </button>
                </div>

                <div className="mb-4">
                  <label className="form-label">Question</label>
                  <input
                    type="text"
                    className={`input ${
                      errors.questions?.[questionIndex]?.question_text
                        ? "border-red-500"
                        : ""
                    }`}
                    value={question.question_text}
                    onChange={(e) => {
                      e.preventDefault();
                      updateQuestion(
                        questionIndex,
                        "question_text",
                        e.target.value
                      )}
                    }
                  />
                  {errors.questions?.[questionIndex]?.question_text && (
                    <p className="form-error">
                      {errors.questions?.[questionIndex]?.question_text?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Options
                  </h4>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center mb-2">
                      <input
                        type="text"
                        className="input flex-1"
                        placeholder={`Option ${optionIndex + 1}`}
                        value={option}
                        onChange={(e) =>{
                          e.preventDefault();
                          updateOption(
                            questionIndex,
                            optionIndex,
                            e.target.value
                          )}
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(questionIndex, optionIndex)}
                        className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <i className="fa-solid fa-times"></i>
                        <span className="sr-only">Remove Option</span>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(questionIndex)}
                    className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    <i className="fa-solid fa-plus mr-1"></i>
                    Add Option
                  </button>
                </div>

                <div className="mt-4">
                  <label className="form-label">Correct Answer</label>
                  <input
                    type="text"
                    className={`input ${
                      errors.questions?.[questionIndex]?.correct_answer
                        ? "border-red-500"
                        : ""
                    }`}
                    value={question.correct_answer}
                    onChange={(e) =>{
                      e.preventDefault();
                      updateQuestion(
                        questionIndex,
                        "correct_answer",
                        e.target.value
                      )}
                    }
                  />
                  {errors.questions?.[questionIndex]?.correct_answer && (
                    <p className="form-error">
                      {
                        errors.questions?.[questionIndex]?.correct_answer
                          ?.message
                      }
                    </p>
                  )}
                </div>

                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">
                  Tags
                </h4>
                {question.tags?.map((tag, tagIndex) => (
                  <div key={tagIndex} className="flex items-center mb-2">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder={`Tag ${tagIndex + 1}`}
                      value={tag}
                      onChange={(e) => {
                        e.preventDefault();
                        updateTag(questionIndex, tagIndex, e.target.value);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeTag(questionIndex, tagIndex)}
                      className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <i className="fa-solid fa-times"></i>
                      <span className="sr-only">Remove Tag</span>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addTag(questionIndex)}
                  className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  <i className="fa-solid fa-plus mr-1"></i>
                  Add Tag
                </button>

              </div>
            ))}

            <button
              type="button"
              onClick={addQuestion}
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              <i className="fa-solid fa-plus mr-1"></i>
              Add Question
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/admin/assessments")}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                Updating...
              </>
            ) : (
              <>
                <i className="fa-solid fa-save mr-2"></i>
                Update Assessment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssessmentEditPage;
