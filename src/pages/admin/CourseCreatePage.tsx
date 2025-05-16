"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { createCourse } from "../../services/courseService"
import { uploadImage } from "../../services/uploadService"

// Define schema for course creation
const courseSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Category is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  prerequisites: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  sections: z.array(
    z.object({
      title: z.string().min(3, "Section title must be at least 3 characters"),
      sub_sections: z.array(
        z.object({
          title: z.string().min(3, "Subsection title must be at least 3 characters"),
          data: z.array(
            z.object({
              type: z.enum(["text", "image", "video", "code"]),
              content: z.string().min(1, "Content is required"),
              language: z.string().optional(),
              url: z.string().optional(),
              alt_text: z.string().optional(),
              caption: z.string().optional(),
            }),
          ),
        }),
      ),
    }),
  ),
})

type CourseFormData1 = z.infer<typeof courseSchema>

type CourseFormData = Omit<CourseFormData1, "prerequisites" | "tags"> & {
  prerequisites: string[]
  tags: string[]
}

const AdminCourseCreatePage = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState<{
    sectionIndex: number
    subsectionIndex: number
    dataIndex: number
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize form with default values
  const {
    setValue,
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      difficulty: "beginner",
      prerequisites: [""],
      tags: [""],
      sections: [
        {
          title: "Introduction",
          sub_sections: [
            {
              title: "Getting Started",
              data: [
                {
                  type: "text",
                  content: "Welcome to the course! In this section, we'll cover the basics.",
                },
              ],
            },
          ],
        },
      ],
    },
  })

  const prerequisites = watch("prerequisites")
  const tags = watch("tags")

  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control,
    name: "sections",
  })

  // Watch sections to access subsections
  const sections = watch("sections")

  // Handle form submission
  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Format data for API
      const courseData = {
        ...data,
        // Filter out empty prerequisites and tags
        prerequisites: data.prerequisites?.filter((p) => p.trim() !== "") || [],
        tags: data.tags?.filter((t) => t.trim() !== "") || [],
        // Format content structure
        content: {
          sections: data.sections.map((section) => ({
            ...section,
            sub_sections: section.sub_sections.map((subSection) => ({
              ...subSection,
              data: subSection.data.map((data_obj) => ({
                ...data_obj,
              })),
            })),
          })),
          tags: data.tags?.filter((t) => t.trim() !== "") || [],
        },
      }

      await createCourse(courseData)
      navigate("/admin/courses")
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create course. Please try again.")
      setIsSubmitting(false)
    }
  }

  // Helper functions to manage prerequisites
  const addPrerequisite = () => {
    setValue("prerequisites", [...prerequisites, ""])
  }

  const updatePrerequisite = (index: number, value: string) => {
    const updatedPrerequisites = [...prerequisites]
    updatedPrerequisites[index] = value
    setValue("prerequisites", updatedPrerequisites)
  }

  const removePrerequisite = (index: number) => {
    const updatedPrerequisites = prerequisites.filter((_, i) => i !== index)
    setValue("prerequisites", updatedPrerequisites)
  }

  // Helper functions to manage tags
  const addTag = () => {
    setValue("tags", [...tags, ""])
  }

  const updateTag = (index: number, value: string) => {
    const updatedTags = [...tags]
    updatedTags[index] = value
    setValue("tags", updatedTags)
  }

  const removeTag = (index: number) => {
    const updatedTags = tags.filter((_, i) => i !== index)
    setValue("tags", updatedTags)
  }

  // Helper function to add a subsection to a section
  const addSubsection = (sectionIndex: number) => {
    const currentSection = sections[sectionIndex]
    const newSubsections = [
      ...currentSection.sub_sections,
      {
        title: `Subsection ${currentSection.sub_sections.length + 1}`,
        data: [
          {
            type: "text" as const,
            content: "",
          },
        ],
      },
    ]

    // Update the form
    const newSections = [...sections]
    newSections[sectionIndex].sub_sections = newSubsections
    setValue("sections", newSections)
    return newSections
  }

  // Helper function to add content data to a subsection
  const addContentData = (sectionIndex: number, subsectionIndex: number, type: "text" | "image" | "video" | "code") => {
    const currentSubsection = sections[sectionIndex].sub_sections[subsectionIndex]
    const newData = [
      ...currentSubsection.data,
      {
        type,
        content: "",
        language: type === "code" ? "javascript" : undefined,
        url: type === "image" || type === "video" ? "" : undefined,
        alt_text: type === "image" ? "" : undefined,
        caption: type === "image" ? "" : undefined,
      },
    ]

    // Update the form
    const newSections = [...sections]
    newSections[sectionIndex].sub_sections[subsectionIndex].data = newData
    setValue("sections", newSections)
    return newSections
  }

  // Helper function to remove content data
  const removeContentData = (sectionIndex: number, subsectionIndex: number, dataIndex: number) => {
    const newSections = [...sections]
    newSections[sectionIndex].sub_sections[subsectionIndex].data.splice(dataIndex, 1)
    setValue("sections", newSections)
    return newSections
  }

  // Handle image upload
  const handleImageUpload = async (sectionIndex: number, subsectionIndex: number, dataIndex: number, file: File) => {
    try {
      setUploadingImage({ sectionIndex, subsectionIndex, dataIndex })

      // Upload the image and get the URL
      const imageUrl = await uploadImage(file)

      // Update the form with the image URL
      const newSections = [...sections]
      newSections[sectionIndex].sub_sections[subsectionIndex].data[dataIndex].content = imageUrl
      setValue("sections", newSections)

      setUploadingImage(null)
    } catch (error) {
      console.error("Error uploading image:", error)
      setError("Failed to upload image. Please try again.")
      setUploadingImage(null)
    }
  }

  // Trigger file input click
  const triggerFileInput = (sectionIndex: number, subsectionIndex: number, dataIndex: number) => {
    // Store the current indices in a data attribute on the file input
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("data-section-index", sectionIndex.toString())
      fileInputRef.current.setAttribute("data-subsection-index", subsectionIndex.toString())
      fileInputRef.current.setAttribute("data-data-index", dataIndex.toString())
      fileInputRef.current.click()
    }
  }

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Get the indices from the data attributes
    const sectionIndex = Number.parseInt(event.target.getAttribute("data-section-index") || "0")
    const subsectionIndex = Number.parseInt(event.target.getAttribute("data-subsection-index") || "0")
    const dataIndex = Number.parseInt(event.target.getAttribute("data-data-index") || "0")

    // Upload the image
    handleImageUpload(sectionIndex, subsectionIndex, dataIndex, file)

    // Reset the file input
    event.target.value = ""
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          <i className="fa-solid fa-book-medical mr-2 text-primary-500"></i>
          Create New Course
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Fill in the details to create a new course</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Hidden file input for image uploads */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <i className="fa-solid fa-info-circle mr-2 text-primary-500"></i>
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="form-label">
                Course Title
              </label>
              <input
                id="title"
                type="text"
                className={`input ${errors.title ? "border-red-500" : ""}`}
                placeholder="e.g. Introduction to JavaScript"
                {...register("title")}
              />
              {errors.title && <p className="form-error">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className={`input ${errors.description ? "border-red-500" : ""}`}
                placeholder="Provide a detailed description of the course..."
                {...register("description")}
              ></textarea>
              {errors.description && <p className="form-error">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  id="category"
                  className={`input ${errors.category ? "border-red-500" : ""}`}
                  {...register("category")}
                >
                  <option value="">Select a category</option>
                  <option value="Programming">Programming</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                </select>
                {errors.category && <p className="form-error">{errors.category.message}</p>}
              </div>

              <div>
                <label htmlFor="difficulty" className="form-label">
                  Difficulty Level
                </label>
                <select
                  id="difficulty"
                  className={`input ${errors.difficulty ? "border-red-500" : ""}`}
                  {...register("difficulty")}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                {errors.difficulty && <p className="form-error">{errors.difficulty.message}</p>}
              </div>
            </div>

            <div>
              <label className="form-label">Prerequisites</label>
              {prerequisites.map((prerequisite, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="e.g. Basic HTML knowledge"
                    value={prerequisite}
                    onChange={(e) => updatePrerequisite(index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removePrerequisite(index)}
                    className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <i className="fa-solid fa-times"></i>
                    <span className="sr-only">Remove</span>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPrerequisite}
                className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                <i className="fa-solid fa-plus mr-1"></i>
                Add Prerequisite
              </button>
            </div>

            <div>
              <label className="form-label">Tags</label>
              {tags.map((tag, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="e.g. javascript"
                    value={tag}
                    onChange={(e) => updateTag(index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <i className="fa-solid fa-times"></i>
                    <span className="sr-only">Remove</span>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTag}
                className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                <i className="fa-solid fa-plus mr-1"></i>
                Add Tag
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <i className="fa-solid fa-book-open mr-2 text-primary-500"></i>
            Course Content
          </h2>

          <div className="space-y-6">
            {sectionFields.map((sectionField, sectionIndex) => (
              <div key={sectionField.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">Section {sectionIndex + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeSection(sectionIndex)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <i className="fa-solid fa-trash"></i>
                    <span className="sr-only">Remove Section</span>
                  </button>
                </div>

                <div className="mb-4">
                  <label className="form-label">Section Title</label>
                  <input
                    type="text"
                    className={`input ${errors.sections?.[sectionIndex]?.title ? "border-red-500" : ""}`}
                    {...register(`sections.${sectionIndex}.title` as const)}
                  />
                  {errors.sections?.[sectionIndex]?.title && (
                    <p className="form-error">{errors.sections?.[sectionIndex]?.title?.message}</p>
                  )}
                </div>

                <div className="space-y-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Subsections</h4>

                  {sections[sectionIndex].sub_sections.map((subsection, subsectionIndex) => (
                    <div
                      key={subsectionIndex}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 ml-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Subsection {subsectionIndex + 1}
                        </h5>
                        <button
                          type="button"
                          onClick={() => {
                            const newSections = [...sections]
                            newSections[sectionIndex].sub_sections.splice(subsectionIndex, 1)
                            setValue("sections", newSections)
                          }}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <i className="fa-solid fa-times"></i>
                          <span className="sr-only">Remove Subsection</span>
                        </button>
                      </div>

                      <div className="mb-4">
                        <label className="form-label">Subsection Title</label>
                        <input
                          type="text"
                          className={`input ${
                            errors.sections?.[sectionIndex]?.sub_sections?.[subsectionIndex]?.title
                              ? "border-red-500"
                              : ""
                          }`}
                          {...register(`sections.${sectionIndex}.sub_sections.${subsectionIndex}.title` as const)}
                        />
                        {errors.sections?.[sectionIndex]?.sub_sections?.[subsectionIndex]?.title && (
                          <p className="form-error">
                            {errors.sections?.[sectionIndex]?.sub_sections?.[subsectionIndex]?.title?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-4 mt-4">
                        <div className="flex justify-between items-center">
                          <h6 className="text-xs font-medium text-gray-600 dark:text-gray-400">Content</h6>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => addContentData(sectionIndex, subsectionIndex, "text")}
                              className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400"
                              title="Add Text"
                            >
                              <i className="fa-solid fa-font"></i>
                              <span className="sr-only">Add Text</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => addContentData(sectionIndex, subsectionIndex, "image")}
                              className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400"
                              title="Add Image"
                            >
                              <i className="fa-solid fa-image"></i>
                              <span className="sr-only">Add Image</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => addContentData(sectionIndex, subsectionIndex, "video")}
                              className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400"
                              title="Add Video"
                            >
                              <i className="fa-solid fa-video"></i>
                              <span className="sr-only">Add Video</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => addContentData(sectionIndex, subsectionIndex, "code")}
                              className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400"
                              title="Add Code"
                            >
                              <i className="fa-solid fa-code"></i>
                              <span className="sr-only">Add Code</span>
                            </button>
                          </div>
                        </div>

                        {subsection.data.map((data, dataIndex) => (
                          <div
                            key={dataIndex}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 ml-4"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                {data.type.charAt(0).toUpperCase() + data.type.slice(1)} Content
                              </span>
                              <button
                                type="button"
                                onClick={() => removeContentData(sectionIndex, subsectionIndex, dataIndex)}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <i className="fa-solid fa-times"></i>
                                <span className="sr-only">Remove Content</span>
                              </button>
                            </div>

                            <input
                              type="hidden"
                              {...register(
                                `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.type` as const,
                              )}
                              value={data.type}
                            />

                            {data.type === "text" && (
                              <div>
                                <textarea
                                  rows={3}
                                  className="input"
                                  placeholder="Enter text content..."
                                  {...register(
                                    `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.content` as const,
                                  )}
                                ></textarea>
                              </div>
                            )}

                            {data.type === "image" && (
                              <div className="space-y-2">
                                <div className="flex flex-col space-y-2">
                                  <label className="text-xs text-gray-600 dark:text-gray-400">Image</label>

                                  {/* Image preview */}
                                  {data.content && (
                                    <div className="mb-2">
                                      <img
                                        src={data.content || "/placeholder.svg"}
                                        alt="Preview"
                                        className="max-h-40 rounded border border-gray-200 dark:border-gray-700"
                                      />
                                    </div>
                                  )}

                                  {/* Upload button */}
                                  <div className="flex items-center space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => triggerFileInput(sectionIndex, subsectionIndex, dataIndex)}
                                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-sm flex items-center"
                                      disabled={!!uploadingImage}
                                    >
                                      {uploadingImage &&
                                      uploadingImage.sectionIndex === sectionIndex &&
                                      uploadingImage.subsectionIndex === subsectionIndex &&
                                      uploadingImage.dataIndex === dataIndex ? (
                                        <>
                                          <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                                          Uploading...
                                        </>
                                      ) : (
                                        <>
                                          <i className="fa-solid fa-upload mr-2"></i>
                                          Upload Image
                                        </>
                                      )}
                                    </button>

                                    {/* Manual URL input option */}
                                    <span className="text-xs text-gray-500">or</span>
                                  </div>

                                  <input
                                    type="text"
                                    className="input mt-1"
                                    placeholder="Enter image URL manually..."
                                    {...register(
                                      `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.content` as const,
                                    )}
                                  />
                                </div>

                                <div>
                                  <label className="text-xs text-gray-600 dark:text-gray-400">Alt Text</label>
                                  <input
                                    type="text"
                                    className="input"
                                    placeholder="Image description"
                                    {...register(
                                      `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.alt_text` as const,
                                    )}
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600 dark:text-gray-400">Caption</label>
                                  <input
                                    type="text"
                                    className="input"
                                    placeholder="Image caption"
                                    {...register(
                                      `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.caption` as const,
                                    )}
                                  />
                                </div>
                              </div>
                            )}

                            {data.type === "video" && (
                              <div className="space-y-2">
                                <div>
                                  <label className="text-xs text-gray-600 dark:text-gray-400">Video URL</label>
                                  <input
                                    type="text"
                                    className="input"
                                    placeholder="https://example.com/video.mp4"
                                    {...register(
                                      `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.url` as const,
                                    )}
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600 dark:text-gray-400">Description</label>
                                  <textarea
                                    rows={2}
                                    className="input"
                                    placeholder="Video description..."
                                    {...register(
                                      `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.content` as const,
                                    )}
                                  ></textarea>
                                </div>
                              </div>
                            )}

                            {data.type === "code" && (
                              <div className="space-y-2">
                                <div>
                                  <label className="text-xs text-gray-600 dark:text-gray-400">
                                    Programming Language
                                  </label>
                                  <select
                                    className="input"
                                    {...register(
                                      `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.language` as const,
                                    )}
                                  >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="csharp">C#</option>
                                    <option value="cpp">C++</option>
                                    <option value="php">PHP</option>
                                    <option value="ruby">Ruby</option>
                                    <option value="swift">Swift</option>
                                    <option value="go">Go</option>
                                    <option value="rust">Rust</option>
                                    <option value="typescript">TypeScript</option>
                                    <option value="html">HTML</option>
                                    <option value="css">CSS</option>
                                    <option value="sql">SQL</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600 dark:text-gray-400">Code Snippet</label>
                                  <textarea
                                    rows={5}
                                    className="input font-mono text-sm"
                                    placeholder="Enter code here..."
                                    {...register(
                                      `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.content` as const,
                                    )}
                                  ></textarea>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addSubsection(sectionIndex)}
                    className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 ml-4"
                  >
                    <i className="fa-solid fa-plus mr-1"></i>
                    Add Subsection
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                appendSection({
                  title: `Section ${sectionFields.length + 1}`,
                  sub_sections: [
                    {
                      title: "New Subsection",
                      data: [
                        {
                          type: "text",
                          content: "",
                        },
                      ],
                    },
                  ],
                })
              }
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              <i className="fa-solid fa-plus mr-1"></i>
              Add Section
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate("/admin/courses")} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                Creating...
              </>
            ) : (
              <>
                <i className="fa-solid fa-save mr-2"></i>
                Create Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminCourseCreatePage








// import type React from "react"

// import { useState, useRef } from "react"
// import { useNavigate } from "react-router-dom"
// import { useForm, useFieldArray } from "react-hook-form"
// import { z } from "zod"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { createCourse } from "../../services/courseService"
// import { uploadImage } from "../../services/uploadService"

// // Define schema for course creation
// const courseSchema = z.object({
//   title: z.string().min(5, "Title must be at least 5 characters"),
//   description: z.string().min(20, "Description must be at least 20 characters"),
//   category: z.string().min(1, "Category is required"),
//   difficulty: z.enum(["beginner", "intermediate", "advanced"]),
//   prerequisites: z.array(z.string()).optional(),
//   tags: z.array(z.string()).optional(),
//   sections: z.array(
//     z.object({
//       title: z.string().min(3, "Section title must be at least 3 characters"),
//       order: z.number(),
//       sub_sections: z.array(
//         z.object({
//           title: z.string().min(3, "Subsection title must be at least 3 characters"),
//           order: z.number(),
//           data: z.array(
//             z.object({
//               type: z.enum(["text", "image", "video", "code"]),
//               content: z.string().min(1, "Content is required"),
//               order: z.number(),
//               language: z.string().optional(),
//               url: z.string().optional(),
//               alt_text: z.string().optional(),
//               caption: z.string().optional(),
//             }),
//           ),
//         }),
//       ),
//     }),
//   ),
// })

// type CourseFormData1 = z.infer<typeof courseSchema>

// type CourseFormData = Omit<CourseFormData1, "prerequisites" | "tags"> & {
//   prerequisites: string[]
//   tags: string[]
// }

// const AdminCourseCreatePage = () => {
//   const navigate = useNavigate()
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [uploadingImage, setUploadingImage] = useState<{
//     sectionIndex: number
//     subsectionIndex: number
//     dataIndex: number
//   } | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   // Initialize form with default values
//   const {
//     setValue,
//     register,
//     handleSubmit,
//     control,
//     formState: { errors },
//     watch,
//   } = useForm<CourseFormData>({
//     resolver: zodResolver(courseSchema),
//     defaultValues: {
//       title: "",
//       description: "",
//       category: "",
//       difficulty: "beginner",
//       prerequisites: [""],
//       tags: [""],
//       sections: [
//         {
//           title: "Introduction",
//           order: 1,
//           sub_sections: [
//             {
//               title: "Getting Started",
//               order: 1,
//               data: [
//                 {
//                   type: "text",
//                   content: "Welcome to the course! In this section, we'll cover the basics.",
//                   order: 1,
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     },
//   })

//   const prerequisites = watch("prerequisites")
//   const tags = watch("tags")

//   const {
//     fields: sectionFields,
//     append: appendSection,
//     remove: removeSection,
//   } = useFieldArray({
//     control,
//     name: "sections",
//   })

//   // Watch sections to access subsections
//   const sections = watch("sections")

//   // Handle form submission
//   const onSubmit = async (data: CourseFormData) => {
//     setIsSubmitting(true)
//     setError(null)

//     try {
//       // Format data for API
//       const courseData = {
//         ...data,
//         // Filter out empty prerequisites and tags
//         prerequisites: data.prerequisites?.filter((p) => p.trim() !== "") || [],
//         tags: data.tags?.filter((t) => t.trim() !== "") || [],
//         // Format content structure
//         content: {
//           sections: data.sections.map((section) => ({
//             ...section,
//             section_id: crypto.randomUUID(), // Generate a unique ID for each section
//             sub_sections: section.sub_sections.map((subSection) => ({
//               ...subSection,
//               subsection_id: crypto.randomUUID(), // Generate a unique ID for each subsection
//               data: subSection.data.map((data_obj) => {
//                 return {
//                   ...data_obj,
//                   data_id: crypto.randomUUID(), // Generate a unique ID for each data object
//                 }
//               }),
//             })),
//           })),
//           tags: data.tags?.filter((t) => t.trim() !== "") || [],
//         },
//       }

//       await createCourse(courseData)
//       navigate("/admin/courses")
//     } catch (err: any) {
//       setError(err.response?.data?.error || "Failed to create course. Please try again.")
//       setIsSubmitting(false)
//     }
//   }

//   // Helper functions to manage prerequisites
//   const addPrerequisite = () => {
//     setValue("prerequisites", [...prerequisites, ""])
//   }

//   const updatePrerequisite = (index: number, value: string) => {
//     const updatedPrerequisites = [...prerequisites]
//     updatedPrerequisites[index] = value
//     setValue("prerequisites", updatedPrerequisites)
//   }

//   const removePrerequisite = (index: number) => {
//     const updatedPrerequisites = prerequisites.filter((_, i) => i !== index)
//     setValue("prerequisites", updatedPrerequisites)
//   }

//   // Helper functions to manage tags
//   const addTag = () => {
//     setValue("tags", [...tags, ""])
//   }

//   const updateTag = (index: number, value: string) => {
//     const updatedTags = [...tags]
//     updatedTags[index] = value
//     setValue("tags", updatedTags)
//   }

//   const removeTag = (index: number) => {
//     const updatedTags = tags.filter((_, i) => i !== index)
//     setValue("tags", updatedTags)
//   }

//   // Helper function to add a subsection to a section
//   const addSubsection = (sectionIndex: number) => {
//     const currentSection = sections[sectionIndex]
//     const newSubsections = [
//       ...currentSection.sub_sections,
//       {
//         title: `Subsection ${currentSection.sub_sections.length + 1}`,
//         order: currentSection.sub_sections.length + 1,
//         data: [
//           {
//             type: "text" as const,
//             content: "",
//             order: 1,
//           },
//         ],
//       },
//     ]

//     // Update the form
//     const newSections = [...sections]
//     newSections[sectionIndex].sub_sections = newSubsections
//     setValue("sections", newSections)
//     return newSections
//   }

//   // Helper function to add content data to a subsection
//   const addContentData = (sectionIndex: number, subsectionIndex: number, type: "text" | "image" | "video" | "code") => {
//     const currentSubsection = sections[sectionIndex].sub_sections[subsectionIndex]
//     const newData = [
//       ...currentSubsection.data,
//       {
//         type,
//         content: "",
//         order: currentSubsection.data.length + 1,
//         language: type === "code" ? "javascript" : undefined,
//         url: type === "image" || type === "video" ? "" : undefined,
//         alt_text: type === "image" ? "" : undefined,
//         caption: type === "image" ? "" : undefined,
//       },
//     ]

//     // Update the form
//     const newSections = [...sections]
//     newSections[sectionIndex].sub_sections[subsectionIndex].data = newData
//     setValue("sections", newSections)
//     return newSections
//   }

//   // Helper function to remove content data
//   const removeContentData = (sectionIndex: number, subsectionIndex: number, dataIndex: number) => {
//     const newSections = [...sections]
//     newSections[sectionIndex].sub_sections[subsectionIndex].data.splice(dataIndex, 1)
//     setValue("sections", newSections)
//     return newSections
//   }

//   // Handle image upload
//   const handleImageUpload = async (sectionIndex: number, subsectionIndex: number, dataIndex: number, file: File) => {
//     try {
//       setUploadingImage({ sectionIndex, subsectionIndex, dataIndex })

//       // Upload the image and get the URL
//       const imageUrl = await uploadImage(file)

//       // Update the form with the image URL
//       const newSections = [...sections]
//       newSections[sectionIndex].sub_sections[subsectionIndex].data[dataIndex].content = imageUrl
//       setValue("sections", newSections)

//       setUploadingImage(null)
//     } catch (error) {
//       console.error("Error uploading image:", error)
//       setError("Failed to upload image. Please try again.")
//       setUploadingImage(null)
//     }
//   }

//   // Trigger file input click
//   const triggerFileInput = (sectionIndex: number, subsectionIndex: number, dataIndex: number) => {
//     // Store the current indices in a data attribute on the file input
//     if (fileInputRef.current) {
//       fileInputRef.current.setAttribute("data-section-index", sectionIndex.toString())
//       fileInputRef.current.setAttribute("data-subsection-index", subsectionIndex.toString())
//       fileInputRef.current.setAttribute("data-data-index", dataIndex.toString())
//       fileInputRef.current.click()
//     }
//   }

//   // Handle file selection
//   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (!file) return

//     // Get the indices from the data attributes
//     const sectionIndex = Number.parseInt(event.target.getAttribute("data-section-index") || "0")
//     const subsectionIndex = Number.parseInt(event.target.getAttribute("data-subsection-index") || "0")
//     const dataIndex = Number.parseInt(event.target.getAttribute("data-data-index") || "0")

//     // Upload the image
//     handleImageUpload(sectionIndex, subsectionIndex, dataIndex, file)

//     // Reset the file input
//     event.target.value = ""
//   }

//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//           <i className="fa-solid fa-book-medical mr-2 text-primary-500"></i>
//           Create New Course
//         </h1>
//         <p className="text-gray-600 dark:text-gray-400">Fill in the details to create a new course</p>
//       </div>

//       {error && (
//         <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6">
//           <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
//         </div>
//       )}

//       {/* Hidden file input for image uploads */}
//       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
//           <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//             <i className="fa-solid fa-info-circle mr-2 text-primary-500"></i>
//             Basic Information
//           </h2>

//           <div className="space-y-4">
//             <div>
//               <label htmlFor="title" className="form-label">
//                 Course Title
//               </label>
//               <input
//                 id="title"
//                 type="text"
//                 className={`input ${errors.title ? "border-red-500" : ""}`}
//                 placeholder="e.g. Introduction to JavaScript"
//                 {...register("title")}
//               />
//               {errors.title && <p className="form-error">{errors.title.message}</p>}
//             </div>

//             <div>
//               <label htmlFor="description" className="form-label">
//                 Description
//               </label>
//               <textarea
//                 id="description"
//                 rows={4}
//                 className={`input ${errors.description ? "border-red-500" : ""}`}
//                 placeholder="Provide a detailed description of the course..."
//                 {...register("description")}
//               ></textarea>
//               {errors.description && <p className="form-error">{errors.description.message}</p>}
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label htmlFor="category" className="form-label">
//                   Category
//                 </label>
//                 <select
//                   id="category"
//                   className={`input ${errors.category ? "border-red-500" : ""}`}
//                   {...register("category")}
//                 >
//                   <option value="">Select a category</option>
//                   <option value="Programming">Programming</option>
//                   <option value="Data Science">Data Science</option>
//                   <option value="Web Development">Web Development</option>
//                   <option value="Mobile Development">Mobile Development</option>
//                   <option value="DevOps">DevOps</option>
//                   <option value="Cloud Computing">Cloud Computing</option>
//                   <option value="Cybersecurity">Cybersecurity</option>
//                   <option value="Artificial Intelligence">Artificial Intelligence</option>
//                 </select>
//                 {errors.category && <p className="form-error">{errors.category.message}</p>}
//               </div>

//               <div>
//                 <label htmlFor="difficulty" className="form-label">
//                   Difficulty Level
//                 </label>
//                 <select
//                   id="difficulty"
//                   className={`input ${errors.difficulty ? "border-red-500" : ""}`}
//                   {...register("difficulty")}
//                 >
//                   <option value="beginner">Beginner</option>
//                   <option value="intermediate">Intermediate</option>
//                   <option value="advanced">Advanced</option>
//                 </select>
//                 {errors.difficulty && <p className="form-error">{errors.difficulty.message}</p>}
//               </div>
//             </div>

//             <div>
//               <label className="form-label">Prerequisites</label>
//               {prerequisites.map((prerequisite, index) => (
//                 <div key={index} className="flex items-center mb-2">
//                   <input
//                     type="text"
//                     className="input flex-1"
//                     placeholder="e.g. Basic HTML knowledge"
//                     value={prerequisite}
//                     onChange={(e) => updatePrerequisite(index, e.target.value)}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => removePrerequisite(index)}
//                     className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
//                   >
//                     <i className="fa-solid fa-times"></i>
//                     <span className="sr-only">Remove</span>
//                   </button>
//                 </div>
//               ))}
//               <button
//                 type="button"
//                 onClick={addPrerequisite}
//                 className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
//               >
//                 <i className="fa-solid fa-plus mr-1"></i>
//                 Add Prerequisite
//               </button>
//             </div>

//             <div>
//               <label className="form-label">Tags</label>
//               {tags.map((tag, index) => (
//                 <div key={index} className="flex items-center mb-2">
//                   <input
//                     type="text"
//                     className="input flex-1"
//                     placeholder="e.g. javascript"
//                     value={tag}
//                     onChange={(e) => updateTag(index, e.target.value)}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => removeTag(index)}
//                     className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
//                   >
//                     <i className="fa-solid fa-times"></i>
//                     <span className="sr-only">Remove</span>
//                   </button>
//                 </div>
//               ))}
//               <button
//                 type="button"
//                 onClick={addTag}
//                 className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
//               >
//                 <i className="fa-solid fa-plus mr-1"></i>
//                 Add Tag
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
//           <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//             <i className="fa-solid fa-book-open mr-2 text-primary-500"></i>
//             Course Content
//           </h2>

//           <div className="space-y-6">
//             {sectionFields.map((sectionField, sectionIndex) => (
//               <div key={sectionField.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="text-md font-medium text-gray-900 dark:text-white">Section {sectionIndex + 1}</h3>
//                   <button
//                     type="button"
//                     onClick={() => removeSection(sectionIndex)}
//                     className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
//                   >
//                     <i className="fa-solid fa-trash"></i>
//                     <span className="sr-only">Remove Section</span>
//                   </button>
//                 </div>

//                 <div className="mb-4">
//                   <label className="form-label">Section Title</label>
//                   <input
//                     type="text"
//                     className={`input ${errors.sections?.[sectionIndex]?.title ? "border-red-500" : ""}`}
//                     {...register(`sections.${sectionIndex}.title` as const)}
//                   />
//                   {errors.sections?.[sectionIndex]?.title && (
//                     <p className="form-error">{errors.sections?.[sectionIndex]?.title?.message}</p>
//                   )}
//                 </div>

//                 <input
//                   type="hidden"
//                   {...register(`sections.${sectionIndex}.order` as const)}
//                   value={sectionIndex + 1}
//                 />

//                 <div className="space-y-4 mt-4">
//                   <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Subsections</h4>

//                   {sections[sectionIndex].sub_sections.map((subsection, subsectionIndex) => (
//                     <div
//                       key={subsectionIndex}
//                       className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 ml-4"
//                     >
//                       <div className="flex justify-between items-center mb-4">
//                         <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                           Subsection {subsectionIndex + 1}
//                         </h5>
//                         <button
//                           type="button"
//                           onClick={() => {
//                             const newSections = [...sections]
//                             newSections[sectionIndex].sub_sections.splice(subsectionIndex, 1)
//                             setValue("sections", newSections)
//                           }}
//                           className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
//                         >
//                           <i className="fa-solid fa-times"></i>
//                           <span className="sr-only">Remove Subsection</span>
//                         </button>
//                       </div>

//                       <div className="mb-4">
//                         <label className="form-label">Subsection Title</label>
//                         <input
//                           type="text"
//                           className={`input ${
//                             errors.sections?.[sectionIndex]?.sub_sections?.[subsectionIndex]?.title
//                               ? "border-red-500"
//                               : ""
//                           }`}
//                           {...register(`sections.${sectionIndex}.sub_sections.${subsectionIndex}.title` as const)}
//                         />
//                         {errors.sections?.[sectionIndex]?.sub_sections?.[subsectionIndex]?.title && (
//                           <p className="form-error">
//                             {errors.sections?.[sectionIndex]?.sub_sections?.[subsectionIndex]?.title?.message}
//                           </p>
//                         )}
//                       </div>

//                       <input
//                         type="hidden"
//                         {...register(`sections.${sectionIndex}.sub_sections.${subsectionIndex}.order` as const)}
//                         value={subsectionIndex + 1}
//                       />

//                       <div className="space-y-4 mt-4">
//                         <div className="flex justify-between items-center">
//                           <h6 className="text-xs font-medium text-gray-600 dark:text-gray-400">Content</h6>
//                           <div className="flex space-x-2">
//                             <button
//                               type="button"
//                               onClick={() => addContentData(sectionIndex, subsectionIndex, "text")}
//                               className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400"
//                               title="Add Text"
//                             >
//                               <i className="fa-solid fa-font"></i>
//                               <span className="sr-only">Add Text</span>
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => addContentData(sectionIndex, subsectionIndex, "image")}
//                               className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400"
//                               title="Add Image"
//                             >
//                               <i className="fa-solid fa-image"></i>
//                               <span className="sr-only">Add Image</span>
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => addContentData(sectionIndex, subsectionIndex, "video")}
//                               className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400"
//                               title="Add Video"
//                             >
//                               <i className="fa-solid fa-video"></i>
//                               <span className="sr-only">Add Video</span>
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => addContentData(sectionIndex, subsectionIndex, "code")}
//                               className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400"
//                               title="Add Code"
//                             >
//                               <i className="fa-solid fa-code"></i>
//                               <span className="sr-only">Add Code</span>
//                             </button>
//                           </div>
//                         </div>

//                         {subsection.data.map((data, dataIndex) => (
//                           <div
//                             key={dataIndex}
//                             className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 ml-4"
//                           >
//                             <div className="flex justify-between items-center mb-2">
//                               <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
//                                 {data.type.charAt(0).toUpperCase() + data.type.slice(1)} Content
//                               </span>
//                               <button
//                                 type="button"
//                                 onClick={() => removeContentData(sectionIndex, subsectionIndex, dataIndex)}
//                                 className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
//                               >
//                                 <i className="fa-solid fa-times"></i>
//                                 <span className="sr-only">Remove Content</span>
//                               </button>
//                             </div>

//                             <input
//                               type="hidden"
//                               {...register(
//                                 `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.type` as const,
//                               )}
//                               value={data.type}
//                             />

//                             <input
//                               type="hidden"
//                               {...register(
//                                 `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.order` as const,
//                               )}
//                               value={dataIndex + 1}
//                             />

//                             {data.type === "text" && (
//                               <div>
//                                 <textarea
//                                   rows={3}
//                                   className="input"
//                                   placeholder="Enter text content..."
//                                   {...register(
//                                     `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.content` as const,
//                                   )}
//                                 ></textarea>
//                               </div>
//                             )}

//                             {data.type === "image" && (
//                               <div className="space-y-2">
//                                 <div className="flex flex-col space-y-2">
//                                   <label className="text-xs text-gray-600 dark:text-gray-400">Image</label>

//                                   {/* Image preview */}
//                                   {data.content && (
//                                     <div className="mb-2">
//                                       <img
//                                         src={data.content || "/placeholder.svg"}
//                                         alt="Preview"
//                                         className="max-h-40 rounded border border-gray-200 dark:border-gray-700"
//                                       />
//                                     </div>
//                                   )}

//                                   {/* Upload button */}
//                                   <div className="flex items-center space-x-2">
//                                     <button
//                                       type="button"
//                                       onClick={() => triggerFileInput(sectionIndex, subsectionIndex, dataIndex)}
//                                       className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-sm flex items-center"
//                                       disabled={!!uploadingImage}
//                                     >
//                                       {uploadingImage &&
//                                       uploadingImage.sectionIndex === sectionIndex &&
//                                       uploadingImage.subsectionIndex === subsectionIndex &&
//                                       uploadingImage.dataIndex === dataIndex ? (
//                                         <>
//                                           <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
//                                           Uploading...
//                                         </>
//                                       ) : (
//                                         <>
//                                           <i className="fa-solid fa-upload mr-2"></i>
//                                           Upload Image
//                                         </>
//                                       )}
//                                     </button>

//                                     {/* Manual URL input option */}
//                                     <span className="text-xs text-gray-500">or</span>
//                                   </div>

//                                   <input
//                                     type="text"
//                                     className="input mt-1"
//                                     placeholder="Enter image URL manually..."
//                                     {...register(
//                                       `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.content` as const,
//                                     )}
//                                   />
//                                 </div>

//                                 <div>
//                                   <label className="text-xs text-gray-600 dark:text-gray-400">Alt Text</label>
//                                   <input
//                                     type="text"
//                                     className="input"
//                                     placeholder="Image description"
//                                     {...register(
//                                       `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.alt_text` as const,
//                                     )}
//                                   />
//                                 </div>
//                                 <div>
//                                   <label className="text-xs text-gray-600 dark:text-gray-400">Caption</label>
//                                   <input
//                                     type="text"
//                                     className="input"
//                                     placeholder="Image caption"
//                                     {...register(
//                                       `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.caption` as const,
//                                     )}
//                                   />
//                                 </div>
//                               </div>
//                             )}

//                             {data.type === "video" && (
//                               <div className="space-y-2">
//                                 <div>
//                                   <label className="text-xs text-gray-600 dark:text-gray-400">Video URL</label>
//                                   <input
//                                     type="text"
//                                     className="input"
//                                     placeholder="https://example.com/video.mp4"
//                                     {...register(
//                                       `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.url` as const,
//                                     )}
//                                   />
//                                 </div>
//                                 <div>
//                                   <label className="text-xs text-gray-600 dark:text-gray-400">Description</label>
//                                   <textarea
//                                     rows={2}
//                                     className="input"
//                                     placeholder="Video description..."
//                                     {...register(
//                                       `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.content` as const,
//                                     )}
//                                   ></textarea>
//                                 </div>
//                               </div>
//                             )}

//                             {data.type === "code" && (
//                               <div className="space-y-2">
//                                 <div>
//                                   <label className="text-xs text-gray-600 dark:text-gray-400">
//                                     Programming Language
//                                   </label>
//                                   <select
//                                     className="input"
//                                     {...register(
//                                       `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.language` as const,
//                                     )}
//                                   >
//                                     <option value="javascript">JavaScript</option>
//                                     <option value="python">Python</option>
//                                     <option value="java">Java</option>
//                                     <option value="csharp">C#</option>
//                                     <option value="cpp">C++</option>
//                                     <option value="php">PHP</option>
//                                     <option value="ruby">Ruby</option>
//                                     <option value="swift">Swift</option>
//                                     <option value="go">Go</option>
//                                     <option value="rust">Rust</option>
//                                     <option value="typescript">TypeScript</option>
//                                     <option value="html">HTML</option>
//                                     <option value="css">CSS</option>
//                                     <option value="sql">SQL</option>
//                                   </select>
//                                 </div>
//                                 <div>
//                                   <label className="text-xs text-gray-600 dark:text-gray-400">Code Snippet</label>
//                                   <textarea
//                                     rows={5}
//                                     className="input font-mono text-sm"
//                                     placeholder="Enter code here..."
//                                     {...register(
//                                       `sections.${sectionIndex}.sub_sections.${subsectionIndex}.data.${dataIndex}.content` as const,
//                                     )}
//                                   ></textarea>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ))}

//                   <button
//                     type="button"
//                     onClick={() => addSubsection(sectionIndex)}
//                     className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 ml-4"
//                   >
//                     <i className="fa-solid fa-plus mr-1"></i>
//                     Add Subsection
//                   </button>
//                 </div>
//               </div>
//             ))}

//             <button
//               type="button"
//               onClick={() =>
//                 appendSection({
//                   title: `Section ${sectionFields.length + 1}`,
//                   order: sectionFields.length + 1,
//                   sub_sections: [
//                     {
//                       title: "New Subsection",
//                       order: 1,
//                       data: [
//                         {
//                           type: "text",
//                           content: "",
//                           order: 1,
//                         },
//                       ],
//                     },
//                   ],
//                 })
//               }
//               className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
//             >
//               <i className="fa-solid fa-plus mr-1"></i>
//               Add Section
//             </button>
//           </div>
//         </div>

//         <div className="flex justify-end space-x-4">
//           <button type="button" onClick={() => navigate("/admin/courses")} className="btn btn-outline">
//             Cancel
//           </button>
//           <button type="submit" disabled={isSubmitting} className="btn btn-primary">
//             {isSubmitting ? (
//               <>
//                 <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
//                 Creating...
//               </>
//             ) : (
//               <>
//                 <i className="fa-solid fa-save mr-2"></i>
//                 Create Course
//               </>
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   )
// }

// export default AdminCourseCreatePage
