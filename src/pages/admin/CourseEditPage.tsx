import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseById, updateCourse } from "../../services/courseService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Course } from "../../types";

const CourseEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<Course>>({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    prerequisites: [],
    content: {
      sections: [],
      tags: [],
    },
  });

  const {
    data: course,
    isLoading,
    error,
  } = useQuery(["course", id], () => getCourseById(id as string), {
    enabled: !!id,
  });

  useEffect(() => {
    if (course) {
      setFormData(course.course);
    }
  }, [course]);

  const updateMutation = useMutation(
    (updatedCourse: Partial<Course>) =>
      updateCourse(id as string, updatedCourse),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["course", id]);
        queryClient.invalidateQueries(["adminCourses"]);
        navigate("/admin/courses");
      },
    }
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePrerequisitesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const prerequisites = e.target.value.split(",").map((item) => item.trim());
    setFormData((prev) => ({
      ...prev,
      prerequisites,
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(",").map((item) => item.trim());
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        tags,
        sections: prev.content?.sections || [], // Ensure sections is always an array
      },
    }));
  };

  // const handleSectionChange = (
  //   sectionIndex: number,
  //   field: keyof CourseSection,
  //   value: string
  // ) => {
  //   setFormData((prev) => {
  //     // Create a copy of the existing sections array or an empty array if it doesn't exist
  //     const currentSections = prev.content?.sections || [];
      
  //     // Make sure the section at the specified index exists
  //     const updatedSections = [...currentSections];
      
  //     // If the section doesn't exist yet, initialize it
  //     if (!updatedSections[sectionIndex]) {
  //       updatedSections[sectionIndex] = {} as CourseSection;
  //     }
      
  //     // Update the specific field of the section
  //     updatedSections[sectionIndex] = {
  //       ...updatedSections[sectionIndex],
  //       [field]: value
  //     };
      
  //     return {
  //       ...prev,
  //       content: {
  //         ...prev.content,
  //         sections: updatedSections,
  //         tags: prev.content?.tags || []  // Preserve tags
  //       }
  //     };
  //   });
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4">
        <p className="text-sm text-red-700 dark:text-red-400">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          Failed to load course. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          <i className="fa-solid fa-edit mr-2 text-primary-500"></i>
          Edit Course
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="form-label">
                Course Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="">Select Category</option>
                <option value="Programming">Programming</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Machine Learning">Machine Learning</option>
              </select>
            </div>

            <div>
              <label htmlFor="difficulty" className="form-label">
                Difficulty Level
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="">Select Difficulty</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label htmlFor="prerequisites" className="form-label">
                Prerequisites (comma-separated)
              </label>
              <input
                type="text"
                id="prerequisites"
                name="prerequisites"
                value={formData.prerequisites?.join(", ")}
                onChange={handlePrerequisitesChange}
                className="input"
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input min-h-[100px]"
              required
            />
          </div>

          <div className="mt-6">
            <label htmlFor="tags" className="form-label">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.content?.tags.join(", ")}
              onChange={handleTagsChange}
              className="input"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/admin/courses")}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={updateMutation.isLoading}
          >
            {updateMutation.isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fa-solid fa-save mr-2"></i>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseEditPage;
