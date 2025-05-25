import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { contactSupport } from "../services/contactSupport"

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

type ContactFormData = z.infer<typeof contactFormSchema>

const SupportPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"faq" | "contact">("faq")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema)
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await contactSupport(data)

      setSubmitSuccess(true)
      reset()
    } catch (error) {
      setSubmitError("Failed to send your message. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const faqItems = [
    {
      question: "How do I enroll in a course?",
      answer:
        "To enroll in a course, navigate to the course details page and click the 'Enroll Now' button. You'll be able to start learning immediately after enrollment.",
    },
    {
      question: "How do assessments work?",
      answer:
        "Assessments test your knowledge on course material. You need to achieve a passing score (usually 70% or higher) to complete the assessment. You can retake assessments if needed.",
    },
    {
      question: "Can I download course materials for offline use?",
      answer:
        "Currently, course materials are only available online. We're working on adding offline access in a future update.",
    },
    {
      question: "How do I track my progress?",
      answer:
        "Your progress is automatically tracked as you complete course sections. You can view your overall progress on the 'Progress' page in your dashboard.",
    },
    {
      question: "What happens if I fail an assessment?",
      answer:
        "If you fail an assessment, you'll receive feedback on areas that need improvement. You can review the course material and retake the assessment after a short waiting period.",
    },
    {
      question: "How do I get a certificate after completing a course?",
      answer:
        "Certificates are automatically generated when you complete all course sections and pass the final assessment. You can download your certificates from your profile page.",
    },
    {
      question: "Can I change my account information?",
      answer:
        "Yes, you can update your profile information, including your username and email address, on the Profile page. You can also change your password there.",
    },
    {
      question: "Is there a mobile app available?",
      answer:
        "We're currently developing mobile apps for iOS and Android. In the meantime, our website is fully responsive and works well on mobile devices.",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          <i className="fa-solid fa-circle-question mr-2 text-primary-500"></i>
          Support Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Find answers to common questions or contact our support team</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label="Support tabs">
          <button
            onClick={() => setActiveTab("faq")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "faq"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            aria-current={activeTab === "faq" ? "page" : undefined}
          >
            <i className="fa-solid fa-question-circle mr-2"></i>
            Frequently Asked Questions
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "contact"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            aria-current={activeTab === "contact" ? "page" : undefined}
          >
            <i className="fa-solid fa-envelope mr-2"></i>
            Contact Support
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "faq" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqItems.map((item, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    <i className="fa-solid fa-question-circle text-primary-500 mr-2"></i>
                    {item.question}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">{item.answer}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Can't find what you're looking for? Contact our support team.
              </p>
              <button onClick={() => setActiveTab("contact")} className="btn btn-primary mt-4">
                <i className="fa-solid fa-envelope mr-2"></i>
                Contact Support
              </button>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                <i className="fa-solid fa-envelope mr-2"></i>
                Get in Touch
              </h2>

              {submitSuccess && (
                <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4 mb-6">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <i className="fa-solid fa-check-circle mr-2"></i>
                    Your message has been sent successfully. We'll get back to you as soon as possible.
                  </p>
                </div>
              )}

              {submitError && (
                <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    <i className="fa-solid fa-circle-exclamation mr-2"></i>
                    {submitError}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="form-label">
                      <i className="fa-solid fa-user mr-2 text-gray-500"></i>
                      Your Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      className={`input ${errors.name ? "border-red-500" : ""}`}
                      placeholder="John Doe"
                      {...register("name")}
                    />
                    {errors.name && <p className="form-error">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="form-label">
                      <i className="fa-solid fa-envelope mr-2 text-gray-500"></i>
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={`input ${errors.email ? "border-red-500" : ""}`}
                      placeholder="john@example.com"
                      {...register("email")}
                    />
                    {errors.email && <p className="form-error">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="form-label">
                    <i className="fa-solid fa-heading mr-2 text-gray-500"></i>
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    className={`input ${errors.subject ? "border-red-500" : ""}`}
                    placeholder="How can we help you?"
                    {...register("subject")}
                  />
                  {errors.subject && <p className="form-error">{errors.subject.message}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="form-label">
                    <i className="fa-solid fa-comment mr-2 text-gray-500"></i>
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className={`input ${errors.message ? "border-red-500" : ""}`}
                    placeholder="Please describe your issue or question in detail..."
                    {...register("message")}
                  ></textarea>
                  {errors.message && <p className="form-error">{errors.message.message}</p>}
                </div>

                <div className="mt-6">
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                    {isSubmitting ? (
                      <>
                        <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-paper-plane mr-2"></i>
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <i className="fa-solid fa-info-circle mr-2 text-primary-500"></i>
                Other Ways to Reach Us
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="mr-4 bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full">
                    <i className="fa-solid fa-envelope text-primary-600 dark:text-primary-400"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Email Support</h4>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">support@cblp.com</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Response time: 24-48 hours</p>
                  </div>
                </div>
                {/* <div className="flex items-start">
                  <div className="mr-4 bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full">
                    <i className="fa-solid fa-comments text-primary-600 dark:text-primary-400"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Live Chat</h4>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Available Monday-Friday</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">9:00 AM - 5:00 PM EST</p>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SupportPage
