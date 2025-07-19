import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getConcept, updateConcept } from "../../services/conceptService";

const conceptSchema = z.object({
  concepts: z.array(z.string().min(1, "Concept cannot be empty")).min(1, "At least one concept is required"),
  links: z.array(z.string().url("Must be a valid URL")).min(1, "At least one link is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
});

type ConceptFormData = z.infer<typeof conceptSchema>;

const ConceptEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ConceptFormData>({
    resolver: zodResolver(conceptSchema),
    defaultValues: {
      concepts: [""],
      links: [""],
      description: "",
    },
  });

  const { fields: conceptFields, append: appendConcept, remove: removeConcept } = useFieldArray({
    control,
    name: "concepts",
  });

  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
    control,
    name: "links",
  });

  useEffect(() => {
    const fetchConcept = async () => {
      try {
        setIsLoading(true);
        const concept = await getConcept(id!);
        reset({
          concepts: concept.concepts,
          links: concept.links,
          description: concept.description,
        });
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch concept details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchConcept();
  }, [id, reset]);

  const onSubmit = async (data: ConceptFormData) => {
    // console.log("Submitting concept data:", data);
    setIsSubmitting(true);
    setError(null);
    try {
      await updateConcept(id!, data);
      navigate("/admin/concepts");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update concept. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <i className="fa-solid fa-circle-notch fa-spin text-primary-500 text-2xl"></i>
        <p className="ml-2 text-gray-600">Loading concept...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          <i className="fa-solid fa-lightbulb mr-2 text-primary-500"></i>
          Edit Concept
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Update the concept details</p>
      </div>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Concepts</label>
              <div className="space-y-2">
                {conceptFields.map((field, index) => (
                  <div key={field.id} className="flex items-center">
                    <input
                      type="text"
                      className={`flex-1 rounded-md border ${errors.concepts?.[index] ? "border-red-500" : "border-gray-300"} shadow-sm p-2`}
                      placeholder={`Concept ${index + 1}`}
                      {...register(`concepts.${index}`)}
                    />
                    {conceptFields.length > 1 && (
                      <button type="button" onClick={() => removeConcept(index)} className="ml-2 text-red-500 hover:text-red-700">
                        <i className="fa-solid fa-trash"></i>
                        <span className="sr-only">Remove Concept</span>
                      </button>
                    )}
                  </div>
                ))}
                {errors.concepts && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.concepts.message}</p>}
                <button type="button" onClick={() => appendConcept("")} className="text-sm text-primary-600 hover:text-primary-500 flex items-center">
                  <i className="fa-solid fa-plus mr-1"></i>
                  Add Concept
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Links</label>
              <div className="space-y-2">
                {linkFields.map((field, index) => (
                  <div key={field.id} className="flex items-center">
                    <input
                      type="text"
                      className={`flex-1 rounded-md border ${errors.links?.[index] ? "border-red-500" : "border-gray-300"} shadow-sm p-2`}
                      placeholder={`Link ${index + 1}`}
                      {...register(`links.${index}`)}
                    />
                    {linkFields.length > 1 && (
                      <button type="button" onClick={() => removeLink(index)} className="ml-2 text-red-500 hover:text-red-700">
                        <i className="fa-solid fa-trash"></i>
                        <span className="sr-only">Remove Link</span>
                      </button>
                    )}
                  </div>
                ))}
                {errors.links && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.links.message}</p>}
                <button type="button" onClick={() => appendLink("")} className="text-sm text-primary-600 hover:text-primary-500 flex items-center">
                  <i className="fa-solid fa-plus mr-1"></i>
                  Add Link
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                className={`mt-1 block w-full rounded-md border ${errors.description ? "border-red-500" : "border-gray-300"} shadow-sm p-2`}
                rows={3}
                placeholder="Short description of the concept"
                {...register("description")}
              ></textarea>
              {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>}
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate("/admin/concepts")} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                Updating...
              </>
            ) : (
              "Update Concept"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConceptEditPage;
