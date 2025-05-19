import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateUserPreferences } from "../../services/userService"
import Logo from "../../components/common/Logo"
import { motion, AnimatePresence } from "framer-motion"

const preferencesSchema = z.object({
  categories: z.array(z.string()).min(1, "Please select at least one category"),
  skills: z.array(z.string()).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  learning_style: z.enum(["visual", "auditory", "reading", "kinesthetic"]),
  time_commitment: z.enum(["low", "medium", "high"]),
  goals: z.array(z.string()).min(1, "Please select at least one goal"),
})

type PreferencesFormData = z.infer<typeof preferencesSchema>

// Available options for form selections
const categoryOptions = [
  "Programming",
  "Data Science",
  "Web Development",
  "Mobile Development",
  "DevOps",
  "Cloud Computing",
  "Cybersecurity",
  "Artificial Intelligence",
  "Machine Learning",
  "Blockchain",
  "Design",
  "Business",
]

const skillOptions = [
  "JavaScript",
  "Python",
  "Java",
  "C#",
  "C++",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "Go",
  "Rust",
  "SQL",
  "HTML/CSS",
  "React",
  "Angular",
  "Vue",
  "Node.js",
  "Django",
  "Flask",
  "Spring",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Git",
  "Linux",
  "Networking",
]

const goalOptions = [
  "Career advancement",
  "Change careers",
  "Learn new skills",
  "Stay current in field",
  "Personal interest",
  "Academic requirement",
  "Certification preparation",
  "Start a business",
  "Improve job performance",
]

const PreferencesPage = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const totalSteps = 3

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      categories: [],
      skills: [],
      difficulty: "beginner",
      learning_style: "visual",
      time_commitment: "medium",
      goals: [],
    },
  })

  // Watch values for multi-select fields
  const watchCategories = watch("categories")
  const watchSkills = watch("skills")
  const watchGoals = watch("goals")

  // Toggle selection for multi-select fields
  const toggleSelection = (field: "categories" | "skills" | "goals", value: string) => {
    const currentValues = watch(field) || []

    if (currentValues.includes(value)) {
      setValue(
        field,
        currentValues.filter((item) => item !== value),
      )
    } else {
      setValue(field, [...currentValues, value])
    }
  };

  const onSubmit = async (data: PreferencesFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      await updateUserPreferences(data)
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save preferences. Please try again.")
    } finally {
      setIsLoading(false)
    }
  };

  const nextStep = () => {
    setStep((prev) => Math.min(prev + 1, totalSteps))
  }

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <Logo className="mx-auto h-12 w-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Tell us about your learning preferences
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            This helps us personalize your learning experience
          </p>
        </div>

        {error && (
          <motion.div
            className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Step {step} of {totalSteps}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {step === 1 ? "Interests" : step === 2 ? "Learning Style" : "Goals"}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-primary-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              ></motion.div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* Step 1: Categories and Skills */}
              {step === 1 && (
                <motion.div
                  className="space-y-6"
                  key="step1"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <label className="form-label">
                      <i className="fa-solid fa-folder mr-2 text-primary-500"></i>
                      What categories are you interested in?
                    </label>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                      {categoryOptions.map((category) => (
                        <motion.div
                          key={category}
                          onClick={() => toggleSelection("categories", category)}
                          className={`
                            px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                            ${
                              watchCategories.includes(category)
                                ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 border-2 border-primary-500"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-2 border-transparent"
                            }
                          `}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {category}
                        </motion.div>
                      ))}
                    </div>
                    {errors.categories && <p className="form-error">{errors.categories.message}</p>}
                  </div>

                  <div>
                    <label className="form-label">
                      <i className="fa-solid fa-code mr-2 text-primary-500"></i>
                      What skills are you looking to develop? (Optional)
                    </label>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                      {skillOptions.map((skill) => (
                        <motion.div
                          key={skill}
                          onClick={() => toggleSelection("skills", skill)}
                          className={`
                            px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                            ${
                              (watchSkills || []).includes(skill)
                                ? "bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200 border-2 border-secondary-500"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-2 border-transparent"
                            }
                          `}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {skill}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Learning Style and Difficulty */}
              {step === 2 && (
                <motion.div
                  className="space-y-6"
                  key="step2"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <label className="form-label">
                      <i className="fa-solid fa-brain mr-2 text-primary-500"></i>
                      What's your preferred learning style?
                    </label>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-start p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="radio"
                          value="visual"
                          {...register("learning_style")}
                          className="mt-1 h-4 w-4 text-primary-600"
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-medium text-gray-900 dark:text-white">
                            <i className="fa-solid fa-eye mr-2 text-primary-500"></i>
                            Visual
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            Learn best through images, diagrams, and videos
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="radio"
                          value="auditory"
                          {...register("learning_style")}
                          className="mt-1 h-4 w-4 text-primary-600"
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-medium text-gray-900 dark:text-white">
                            <i className="fa-solid fa-headphones mr-2 text-primary-500"></i>
                            Auditory
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            Learn best through listening and discussions
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="radio"
                          value="reading"
                          {...register("learning_style")}
                          className="mt-1 h-4 w-4 text-primary-600"
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-medium text-gray-900 dark:text-white">
                            <i className="fa-solid fa-book mr-2 text-primary-500"></i>
                            Reading/Writing
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            Learn best through reading and writing
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="radio"
                          value="kinesthetic"
                          {...register("learning_style")}
                          className="mt-1 h-4 w-4 text-primary-600"
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-medium text-gray-900 dark:text-white">
                            <i className="fa-solid fa-hands mr-2 text-primary-500"></i>
                            Kinesthetic
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            Learn best through hands-on activities and practice
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">
                      <i className="fa-solid fa-gauge-high mr-2 text-primary-500"></i>
                      What difficulty level are you comfortable with?
                    </label>
                    <div className="mt-2">
                      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                        <label className="flex items-center p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                          <input
                            type="radio"
                            value="beginner"
                            {...register("difficulty")}
                            className="h-4 w-4 text-primary-600"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                            <i className="fa-solid fa-seedling mr-2 text-green-500"></i>
                            Beginner
                          </span>
                        </label>

                        <label className="flex items-center p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                          <input
                            type="radio"
                            value="intermediate"
                            {...register("difficulty")}
                            className="h-4 w-4 text-primary-600"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                            <i className="fa-solid fa-tree mr-2 text-yellow-500"></i>
                            Intermediate
                          </span>
                        </label>

                        <label className="flex items-center p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                          <input
                            type="radio"
                            value="advanced"
                            {...register("difficulty")}
                            className="h-4 w-4 text-primary-600"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                            <i className="fa-solid fa-mountain mr-2 text-red-500"></i>
                            Advanced
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">
                      <i className="fa-solid fa-clock mr-2 text-primary-500"></i>
                      How much time can you commit to learning?
                    </label>
                    <div className="mt-2">
                      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                        <label className="flex items-center p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                          <input
                            type="radio"
                            value="low"
                            {...register("time_commitment")}
                            className="h-4 w-4 text-primary-600"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                            <i className="fa-solid fa-hourglass-start mr-2 text-tertiary-500"></i>
                            Low (1-3 hours/week)
                          </span>
                        </label>

                        <label className="flex items-center p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                          <input
                            type="radio"
                            value="medium"
                            {...register("time_commitment")}
                            className="h-4 w-4 text-primary-600"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                            <i className="fa-solid fa-hourglass-half mr-2 text-tertiary-500"></i>
                            Medium (4-7 hours/week)
                          </span>
                        </label>

                        <label className="flex items-center p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                          <input
                            type="radio"
                            value="high"
                            {...register("time_commitment")}
                            className="h-4 w-4 text-primary-600"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                            <i className="fa-solid fa-hourglass-end mr-2 text-tertiary-500"></i>
                            High (8+ hours/week)
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Goals */}
              {step === 3 && (
                <motion.div
                  className="space-y-6"
                  key="step3"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <label className="form-label">
                      <i className="fa-solid fa-bullseye mr-2 text-primary-500"></i>
                      What are your learning goals?
                    </label>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {goalOptions.map((goal) => (
                        <motion.div
                          key={goal}
                          onClick={() => toggleSelection("goals", goal)}
                          className={`
                            px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                            ${
                              watchGoals.includes(goal)
                                ? "bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200 border-2 border-tertiary-500"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-2 border-transparent"
                            }
                          `}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {goal}
                        </motion.div>
                      ))}
                    </div>
                    {errors.goals && <p className="form-error">{errors.goals.message}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 flex justify-between">
              {step > 1 ? (
                <motion.button
                  type="button"
                  onClick={prevStep}
                  className="btn btn-outline"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <i className="fa-solid fa-arrow-left mr-2"></i>
                  Back
                </motion.button>
              ) : (
                <div></div> // Empty div for spacing
              )}

              {step < totalSteps ? (
                <motion.button
                  type="button"
                  onClick={nextStep}
                  className="btn btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Next
                  <i className="fa-solid fa-arrow-right ml-2"></i>
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check mr-2"></i>
                      Complete Setup
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  )
}

export default PreferencesPage
