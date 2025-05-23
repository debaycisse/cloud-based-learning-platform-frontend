import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
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

type AssessmentFormData = z.infer<typeof assessmentSchema>;

const AssessmentEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    control,
    register,
    handleSubmit,
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
          tags: [],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Field array for questions
  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  // Fetch assessment details and questions on component mount
  useEffect(() => {
    const fetchAssessmentAndQuestions = async () => {
      try {
        setLoading(true);
        const assessment = await getAssessmentById(id!);
        const { questions: fetchedQuestions } = await getQuestionByAssessmentId(id!);

        reset({
          title: assessment.assessment.title,
          courseId: assessment.assessment.course_id,
          createdAt: new Date(assessment.assessment.created_at),
          updatedAt: new Date(assessment.assessment.updated_at),
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
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAssessmentAndQuestions();
  }, [id, reset]);

  // Handle form submission
  const onSubmit = async (data: AssessmentFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await updateAssessment(id!, {
        title: data.title,
        course_id: data.courseId,
      });

      await Promise.all(
        data.questions.map((q) =>
          updateQuestionInBackend(q._id!, {
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
          })
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-8">
          <i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary-500"></i>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
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
          {errors.title && <p className="form-error">{errors.title.message}</p>}
        </div>

        {/* Questions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <i className="fa-solid fa-question-circle mr-2 text-primary-500"></i>
            Questions
          </h2>
          <div className="space-y-6">
            {questionFields.map((question, questionIndex) => {
              // Field array for options inside each question
              const {
                fields: optionFields,
                append: appendOption,
                remove: removeOption,
              } = useFieldArray({
                control,
                name: `questions.${questionIndex}.options`,
              });

              return (
                <div
                  key={question.id}
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
                      {...register(`questions.${questionIndex}.question_text`)}
                    />
                    {errors.questions?.[questionIndex]?.question_text && (
                      <p className="form-error">
                        {errors.questions?.[questionIndex]?.question_text?.message}
                      </p>
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Options
                    </h4>
                    {optionFields.map((option, optionIndex) => (
                      <div key={option.id} className="flex items-center mb-2">
                        <input
                          type="text"
                          className="input flex-1"
                          placeholder={`Option ${optionIndex + 1}`}
                          {...register(
                            `questions.${questionIndex}.options.${optionIndex}`
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(optionIndex)}
                          className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <i className="fa-solid fa-times"></i>
                          <span className="sr-only">Remove Option</span>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => appendOption("")}
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
                      {...register(
                        `questions.${questionIndex}.correct_answer`
                      )}
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
                  {/* Hidden field for _id */}
                  <input
                    type="hidden"
                    {...register(`questions.${questionIndex}._id`)}
                  />
                </div>
              );
            })}

            <button
              type="button"
              onClick={() =>
                appendQuestion({
                  question_text: "",
                  options: ["", ""],
                  correct_answer: "",
                  tags: [],
                })
              }
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


// The second implementation
// import { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useForm, useFieldArray } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   getAssessmentById,
//   updateAssessment,
// } from "../../services/assessmentService";
// import {
//   getQuestionByAssessmentId,
//   updateQuestion as updateQuestionInBackend,
// } from "../../services/questionService";

// // Define schema for assessment editing
// const assessmentSchema = z.object({
//   title: z.string().min(5, "Title must be at least 5 characters"),
//   courseId: z.string().default(""),
//   createdAt: z.date().optional(),
//   updatedAt: z.date().optional(),
//   questions: z.array(
//     z.object({
//       _id: z.string().optional(),
//       question_text: z.string().min(1, "Question is required"),
//       options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "At least two options required"),
//       correct_answer: z.string().min(1, "Correct answer is required"),
//       tags: z.array(z.string()).optional(),
//     })
//   ),
// });

// type AssessmentFormData = z.infer<typeof assessmentSchema>

// const AssessmentEditPage = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Initialize form with default values
//   const {
//     control,
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm<AssessmentFormData>({
//     resolver: zodResolver(assessmentSchema),
//     defaultValues: {
//       title: "",
//       courseId: "",
//       questions: [
//         {
//           question_text: "",
//           options: ["", ""],
//           correct_answer: "",
//           tags: [],
//         },
//       ],
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     },
//   });

//   // Use useFieldArray for dynamic questions management
//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "questions",
//   });

//   // Fetch assessment details and questions on component mount
//   useEffect(() => {
//     const fetchAssessmentAndQuestions = async () => {
//       try {
//         setLoading(true);
//         // Fetch assessment details
//         const assessment = await getAssessmentById(id!);
//         // console.log(`assessment obtained : ${JSON.stringify(assessment)}`)

//         // Fetch questions associated with the assessment
//         const { questions: fetchedQuestions } = await getQuestionByAssessmentId(
//           id!
//         );
//         // console.log(`Questions related to assessment ::: \n${JSON.stringify(fetchedQuestions)}\n`)

//         // Reset form with fetched data
//         reset({
//           title: assessment.assessment.title,
//           courseId: assessment.assessment.course_id,
//           createdAt: new Date(assessment.assessment.created_at),
//           updatedAt: new Date(assessment.assessment.updated_at),
//           questions: fetchedQuestions.map((q) => ({
//             _id: q._id,
//             question_text: q.question_text,
//             options: q.options,
//             correct_answer: q.correct_answer,
//             tags: q.tags || [],
//           })),
//         });
//       } catch (err: any) {
//         console.error("Error fetching assessment:", err);
//         setError(
//           err.response?.data?.error ||
//             "Failed to fetch assessment details. Please try again."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) {
//       fetchAssessmentAndQuestions();
//     }
//   }, [id, reset]);

//   // Handle form submission
//   const onSubmit = async (data: AssessmentFormData) => {
//     console.log("Form submitted with data:", JSON.stringify(data));
    
//     setIsSubmitting(true);
//     setError(null);
    
//     try {
//       // Update the assessment details (excluding questions)
//       await updateAssessment(id!, {
//         title: data.title,
//         course_id: data.courseId,
//       });

//       // Update the questions separately
//       console.log("Updating questions:", data.questions);
      
//       // Filter out questions without _id (new questions) and handle them separately if needed
//       const questionsToUpdate = data.questions.filter(q => q._id);
      
//       if (questionsToUpdate.length > 0) {
//         await Promise.all(
//           questionsToUpdate.map((q) =>
//             updateQuestionInBackend(q._id!, {
//               question_text: q.question_text,
//               options: q.options,
//               correct_answer: q.correct_answer,
//             })
//           )
//         );
//       }

//       console.log("Assessment updated successfully");
//       navigate("/admin/assessments");
//     } catch (err: any) {
//       console.error("Error updating assessment:", err);
//       setError(
//         err.response?.data?.error ||
//           "Failed to update assessment. Please try again."
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Helper functions to manage questions
//   const addQuestion = () => {
//     append({ 
//       question_text: "", 
//       options: ["", ""], 
//       correct_answer: "",
//       tags: []
//     });
//   };

//   const addOption = (questionIndex: number) => {
//     // This requires a more complex approach with useFieldArray for nested arrays
//     // For now, we'll handle this through the register approach
//     const currentQuestion = fields[questionIndex];
//     const newOptions = [...currentQuestion.options, ""];
//     // Update through form methods
//   };

//   const removeOption = (questionIndex: number, optionIndex: number) => {
//     // Similar to addOption, this needs special handling for nested arrays
//   };

//   if (loading) {
//     return (
//       <div className="max-w-4xl mx-auto">
//         <div className="text-center py-8">
//           <i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary-500"></i>
//           <p className="mt-2 text-gray-600 dark:text-gray-400">Loading assessment...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//           <i className="fa-solid fa-clipboard-list mr-2 text-primary-500"></i>
//           Edit Assessment
//         </h1>
//         <p className="text-gray-600 dark:text-gray-400">
//           Update the details of the assessment
//         </p>
//       </div>

//       {error && (
//         <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6">
//           <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
//         </div>
//       )}

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
//           <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//             <i className="fa-solid fa-info-circle mr-2 text-primary-500"></i>
//             Basic Information
//           </h2>

//           <div className="space-y-4">
//             <div>
//               <label htmlFor="title" className="form-label">
//                 Assessment Title
//               </label>
//               <input
//                 id="title"
//                 type="text"
//                 className={`input ${errors.title ? "border-red-500" : ""}`}
//                 placeholder="e.g. JavaScript Basics Quiz"
//                 {...register("title")}
//               />
//               {errors.title && (
//                 <p className="form-error">{errors.title.message}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
//           <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//             <i className="fa-solid fa-question-circle mr-2 text-primary-500"></i>
//             Questions
//           </h2>

//           <div className="space-y-6">
//             {fields.map((field, questionIndex) => (
//               <div
//                 key={field.id}
//                 className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
//               >
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="text-md font-medium text-gray-900 dark:text-white">
//                     Question {questionIndex + 1}
//                   </h3>
//                   <button
//                     type="button"
//                     onClick={() => remove(questionIndex)}
//                     className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
//                   >
//                     <i className="fa-solid fa-trash"></i>
//                     <span className="sr-only">Remove Question</span>
//                   </button>
//                 </div>

//                 <div className="mb-4">
//                   <label className="form-label">Question</label>
//                   <input
//                     type="text"
//                     className={`input ${
//                       errors.questions?.[questionIndex]?.question_text
//                         ? "border-red-500"
//                         : ""
//                     }`}
//                     {...register(`questions.${questionIndex}.question_text`)}
//                   />
//                   {errors.questions?.[questionIndex]?.question_text && (
//                     <p className="form-error">
//                       {errors.questions?.[questionIndex]?.question_text?.message}
//                     </p>
//                   )}
//                 </div>

//                 {/* Simplified options handling - you might need to implement useFieldArray for nested options */}
//                 <div className="space-y-2">
//                   <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Options (comma-separated)
//                   </h4>
//                   <input
//                     type="text"
//                     className="input"
//                     placeholder="Option 1, Option 2, Option 3"
//                     defaultValue={field.options.join(", ")}
//                     {...register(`questions.${questionIndex}.options`)}
//                   />
//                   {errors.questions?.[questionIndex]?.options && (
//                     <p className="form-error">
//                       At least 2 options are required
//                     </p>
//                   )}
//                 </div>

//                 <div className="mt-4">
//                   <label className="form-label">Correct Answer</label>
//                   <input
//                     type="text"
//                     className={`input ${
//                       errors.questions?.[questionIndex]?.correct_answer
//                         ? "border-red-500"
//                         : ""
//                     }`}
//                     {...register(`questions.${questionIndex}.correct_answer`)}
//                   />
//                   {errors.questions?.[questionIndex]?.correct_answer && (
//                     <p className="form-error">
//                       {errors.questions?.[questionIndex]?.correct_answer?.message}
//                     </p>
//                   )}
//                 </div>

//                 {/* Hidden field for _id to preserve it */}
//                 <input
//                   type="hidden"
//                   {...register(`questions.${questionIndex}._id`)}
//                 />
//               </div>
//             ))}

//             <button
//               type="button"
//               onClick={addQuestion}
//               className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
//             >
//               <i className="fa-solid fa-plus mr-1"></i>
//               Add Question
//             </button>
//           </div>
//         </div>

//         <div className="flex justify-end space-x-4">
//           <button
//             type="button"
//             onClick={() => navigate("/admin/assessments")}
//             className="btn btn-outline"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="btn btn-primary"
//           >
//             {isSubmitting ? (
//               <>
//                 <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
//                 Updating...
//               </>
//             ) : (
//               <>
//                 <i className="fa-solid fa-save mr-2"></i>
//                 Update Assessment
//               </>
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AssessmentEditPage;



// The first Implementation

// import { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   getAssessmentById,
//   updateAssessment,
// } from "../../services/assessmentService";
// import {
//   getQuestionByAssessmentId,
//   updateQuestion as updateQuestionInBackend,
// } from "../../services/questionService";

// // Define schema for assessment editing
// const assessmentSchema = z.object({
//   title: z.string().min(5, "Title must be at least 5 characters"),
//   courseId: z.string().default(""),
//   createdAt: z.date().optional(),
//   updatedAt: z.date().optional(),
//   questions: z.array(
//     z.object({
//       _id: z.string().optional(),
//       question_text: z.string().min(1, "Question is required"),
//       options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "At least two options required"),
//       correct_answer: z.string().min(1, "Correct answer is required"),
//       tags: z.array(z.string()).optional(),
//     })
//   ),
// });

// type AssessmentFormData = z.infer<typeof assessmentSchema>

// const AssessmentEditPage = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Initialize form with default values
//   const {
//     setValue,
//     register,
//     handleSubmit,
//     watch,
//     reset,
//     formState: { errors },
//   } = useForm<AssessmentFormData>({
//     resolver: zodResolver(assessmentSchema),
//     defaultValues: {
//       title: "",
//       courseId: "",
//       questions: [
//         {
//           question_text: "",
//           options: ["", ""],
//           correct_answer: "",
//         },
//       ],
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     },
//   });

//   const questions = watch("questions");

//   // Fetch assessment details and questions on component mount
//   useEffect(() => {
//     const fetchAssessmentAndQuestions = async () => {
//       try {
//         // Fetch assessment details
//         const assessment = await getAssessmentById(id!);

//         // Fetch questions associated with the assessment
//         const { questions: fetchedQuestions } = await getQuestionByAssessmentId(
//           id!
//         );

//         // Reset form with fetched data
//         reset({
//           title: assessment.assessment.title,
//           courseId: assessment.assessment.course_id,
//           createdAt: new Date(assessment.assessment.created_at),
//           updatedAt: new Date(assessment.assessment.updated_at),
//           questions: fetchedQuestions.map((q) => ({
//             _id: q._id,
//             question_text: q.question_text,
//             options: q.options,
//             correct_answer: q.correct_answer,
//             tags: q.tags || [],
//           })),
//         });
//       } catch (err: any) {
//         setError(
//           err.response?.data?.error ||
//             "Failed to fetch assessment details. Please try again."
//         );
//       }
//     };

//     fetchAssessmentAndQuestions();
//   }, [id, reset]);

//   // Handle form submission
//   const onSubmit = async (data: AssessmentFormData) => {
//     // console.log(`HERE :::::`)
//     setIsSubmitting(true);
//     setError(null);
//     // console.log(`\nInside onSubmit ::: data is ${JSON.stringify(data)}\n`)
//     try {
//       // Update the assessment details (excluding questions)
//       await updateAssessment(id!, {
//         title: data.title,
//         course_id: data.courseId,
//       });

//       // Update the questions separately
//       // console.log(`Questions ${JSON.stringify(data)}\n`)
//       await Promise.all(
//         data.questions.map((q) =>
//           updateQuestionInBackend(q._id!, {
//             question_text: q.question_text,
//             options: q.options,
//             correct_answer: q.correct_answer,
//           })
//         )
//       );

//       navigate("/admin/assessments");
//     } catch (err: any) {
//       setError(
//         err.response?.data?.error ||
//           "Failed to update assessment. Please try again."
//       );
//       setIsSubmitting(false);
//     }
//   };

//   // Helper functions to manage questions
//   const addQuestion = () => {
//     setValue("questions", [
//       ...questions,
//       { question_text: "", options: ["", ""], correct_answer: "" },
//     ]);

//     // Register a question question in the questions field in the form

//   };

//   const updateQuestion = (
//     index: number,
//     field: keyof AssessmentFormData["questions"][number],
//     value: string
//   ) => {
//     const updatedQuestions = [...questions];
//     if (field === "question_text" || field === "correct_answer") {
//       updatedQuestions[index][field] = value;
//     } else if (
//       field === "options" &&
//       Array.isArray(updatedQuestions[index][field])
//     ) {
//       updatedQuestions[index][field] = value.split(","); // Example: Convert a comma-separated string to an array
//     }
//     setValue("questions", updatedQuestions);
//   };

//   const removeQuestion = (index: number) => {
//     const updatedQuestions = questions.filter((_, i) => i !== index);
//     setValue("questions", updatedQuestions);
//   };

//   const addOption = (questionIndex: number) => {
//     const updatedQuestions = [...questions];
//     updatedQuestions[questionIndex].options.push("");
//     setValue("questions", updatedQuestions);
//   };

//   const updateOption = (
//     questionIndex: number,
//     optionIndex: number,
//     value: string
//   ) => {
//     const updatedQuestions = [...questions];
//     updatedQuestions[questionIndex].options[optionIndex] = value;
//     setValue("questions", updatedQuestions);
//   };

//   const removeOption = (questionIndex: number, optionIndex: number) => {
//     const updatedQuestions = [...questions];
//     updatedQuestions[questionIndex].options = updatedQuestions[
//       questionIndex
//     ].options.filter((_, i) => i !== optionIndex);
//     setValue("questions", updatedQuestions);
//   };

//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//           <i className="fa-solid fa-clipboard-list mr-2 text-primary-500"></i>
//           Edit Assessment
//         </h1>
//         <p className="text-gray-600 dark:text-gray-400">
//           Update the details of the assessment
//         </p>
//       </div>

//       {error && (
//         <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6">
//           <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
//         </div>
//       )}

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
//           <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//             <i className="fa-solid fa-info-circle mr-2 text-primary-500"></i>
//             Basic Information
//           </h2>

//           <div className="space-y-4">
//             <div>
//               <label htmlFor="title" className="form-label">
//                 Assessment Title
//               </label>
//               <input
//                 id="title"
//                 type="text"
//                 className={`input ${errors.title ? "border-red-500" : ""}`}
//                 placeholder="e.g. JavaScript Basics Quiz"
//                 {...register("title")}
//               />
//               {errors.title && (
//                 <p className="form-error">{errors.title.message}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
//           <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//             <i className="fa-solid fa-question-circle mr-2 text-primary-500"></i>
//             Questions
//           </h2>

//           <div className="space-y-6">
//             {questions.map((question, questionIndex) => (
//               <div
//                 key={questionIndex}
//                 className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
//               >
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="text-md font-medium text-gray-900 dark:text-white">
//                     Question {questionIndex + 1}
//                   </h3>
//                   <button
//                     type="button"
//                     onClick={() => removeQuestion(questionIndex)}
//                     className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
//                   >
//                     <i className="fa-solid fa-trash"></i>
//                     <span className="sr-only">Remove Question</span>
//                   </button>
//                 </div>

//                 <div className="mb-4">
//                   <label className="form-label">Question</label>
//                   <input
//                     type="text"
//                     className={`input ${
//                       errors.questions?.[questionIndex]?.question_text
//                         ? "border-red-500"
//                         : ""
//                     }`}
//                     value={question.question_text}
//                     onChange={(e) =>
//                       updateQuestion(questionIndex, "question_text", e.target.value)
//                     }
//                   />
//                   {errors.questions?.[questionIndex]?.question_text && (
//                     <p className="form-error">
//                       {errors.questions?.[questionIndex]?.question_text?.message}
//                     </p>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Options
//                   </h4>
//                   {question.options.map((option, optionIndex) => (
//                     <div key={optionIndex} className="flex items-center mb-2">
//                       <input
//                         type="text"
//                         className="input flex-1"
//                         placeholder={`Option ${optionIndex + 1}`}
//                         value={option}
//                         onChange={(e) =>
//                           updateOption(
//                             questionIndex,
//                             optionIndex,
//                             e.target.value
//                           )
//                         }
//                       />
//                       <button
//                         type="button"
//                         onClick={() => removeOption(questionIndex, optionIndex)}
//                         className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
//                       >
//                         <i className="fa-solid fa-times"></i>
//                         <span className="sr-only">Remove Option</span>
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     type="button"
//                     onClick={() => addOption(questionIndex)}
//                     className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
//                   >
//                     <i className="fa-solid fa-plus mr-1"></i>
//                     Add Option
//                   </button>
//                 </div>

//                 <div className="mt-4">
//                   <label className="form-label">Correct Answer</label>
//                   <input
//                     type="text"
//                     className={`input ${
//                       errors.questions?.[questionIndex]?.correct_answer
//                         ? "border-red-500"
//                         : ""
//                     }`}
//                     value={question.correct_answer}
//                     onChange={(e) =>
//                       updateQuestion(
//                         questionIndex,
//                         "correct_answer",
//                         e.target.value
//                       )
//                     }
//                   />
//                   {errors.questions?.[questionIndex]?.correct_answer && (
//                     <p className="form-error">
//                       {
//                         errors.questions?.[questionIndex]?.correct_answer
//                           ?.message
//                       }
//                     </p>
//                   )}
//                 </div>
//               </div>
//             ))}

//             <button
//               type="button"
//               onClick={addQuestion}
//               className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
//             >
//               <i className="fa-solid fa-plus mr-1"></i>
//               Add Question
//             </button>
//           </div>
//         </div>

//         <div className="flex justify-end space-x-4">
//           <button
//             type="button"
//             onClick={() => navigate("/admin/assessments")}
//             className="btn btn-outline"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="btn btn-primary"
//           >
//             {isSubmitting ? (
//               <>
//                 <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
//                 Updating...
//               </>
//             ) : (
//               <>
//                 <i className="fa-solid fa-save mr-2"></i>
//                 Update Assessment
//               </>
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AssessmentEditPage;
