import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById, completeCourse } from "../../services/courseService";

interface Course {
  title: string;
  description: string;
  category: string;
  prerequisites: string[];
  content: {
    sections: Section[];
    tags: string[];
  };
  difficulty: string;
  created_at: string;
  updated_at: string;
  enrollment_count: number;
  enrolled_users: string[];
  completed_users: string[];
}

interface Section {
  section_id: string;
  title: string;
  order: number;
  sub_sections: SubSection[];
}

interface SubSection {
  subsection_id: string;
  title: string;
  order: number;
  data: Data[];
}

interface Data {
  data_id: string;
  order: number;
  type: "text" | "image";
  content: string;
}

const CoursePlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!id) {
          setError("Course ID is missing.");
          setLoading(false);
          return;
        }

        const response = await getCourseById(id); // Fetch course data from the backend
        setCourse(response.course);
      } catch (err) {
        setError("Failed to load course data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleNextSection = () => {
    if (course && currentSectionIndex < course.content.sections.length - 1) {
      setCurrentSectionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleCompleteCourse = async () => {
    alert("Congratulations! You have completed this course.");
    // Add logic to mark the course as complete in the backend
    try {
      setLoading(true)
      const markComplete = await completeCourse(id)
      if (markComplete.message) {
        // navigate to courses
        navigate('/courses')
      } else {
        navigate(`/course/${id}/learn`)
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading course...</div>;
  }

  if (error || !course) {
    return (
      <div className="text-center py-10 text-red-500">
        {error || "Course not found."}
      </div>
    );
  }

  const currentSection = course.content.sections[currentSectionIndex];

  return (
    <div className="p-4">
      {/* Course Title and Description */}
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-gray-700 mb-4 dark:text-gray-50">{course.description}</p>

      {/* Current Section */}
      <div className="space-y-8">
        <div key={currentSection.section_id} className="border-b pb-4">
          <h2 className="text-2xl font-semibold mb-4">{currentSection.title}</h2>

          {/* Sub-Sections */}
          {currentSection.sub_sections.map((subSection) => (
            <div key={subSection.subsection_id} className="pl-4 mb-6">
              <h3 className="text-xl font-medium mb-2">{subSection.title}</h3>

              {/* Data (Text or Images) */}
              {subSection.data.map((data) => (
                <div key={data.data_id} className="mb-4">
                  {data.type === "text" ? (
                    <p className="text-gray-800 dark:text-gray-50">{data.content}</p>
                  ) : data.type === "image" ? (
                    <img
                      src={data.content}
                      alt={`Content for ${subSection.title}`}
                      className="rounded shadow max-w-full h-auto"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {currentSectionIndex > 0 && (
          <button
            onClick={handlePreviousSection}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Previous Section
          </button>
        )}
        {currentSectionIndex < course.content.sections.length - 1 ? (
          <button
            onClick={handleNextSection}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Next Section
          </button>
        ) : (
          <button
            onClick={handleCompleteCourse}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Complete Course
          </button>
        )}
      </div>

      {/* Tags */}
      {course.content.tags.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {course.content.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePlayerPage;



// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { getCourseById } from "../../services/courseService"; // Assuming this service fetches course data

// interface Course {
//   title: string;
//   description: string;
//   category: string;
//   prerequisites: string[];
//   content: {
//     sections: Section[];
//     tags: string[];
//   };
//   difficulty: string;
//   created_at: string;
//   updated_at: string;
//   enrollment_count: number;
//   enrolled_users: string[];
//   completed_users: string[];
// }

// interface Section {
//   section_id: string;
//   title: string;
//   order: number;
//   sub_sections: SubSection[];
// }

// interface SubSection {
//   subsection_id: string;
//   title: string;
//   order: number;
//   data: Data[];
// }

// interface Data {
//   data_id: string;
//   order: number;
//   type: "text" | "image";
//   content: string;
// }

// const CoursePlayerPage: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const [course, setCourse] = useState<Course | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchCourse = async () => {
//       try {
//         if (!id) {
//           setError("Course ID is missing.");
//           setLoading(false);
//           return;
//         }

//         const response = await getCourseById(id); // Fetch course data from the backend
//         setCourse(response.course);
//       } catch (err) {
//         setError("Failed to load course data. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCourse();
//   }, [id]);

//   if (loading) {
//     return <div className="text-center py-10">Loading course...</div>;
//   }

//   if (error || !course) {
//     return (
//       <div className="text-center py-10 text-red-500">
//         {error || "Course not found."}
//       </div>
//     );
//   }

//   return (
//     <div className="p-4">
//       {/* Course Title and Description */}
//       <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
//       <p className="text-gray-700 mb-4 dark:text-gray-50">{course.description}</p>

//       {/* Course Sections */}
//       <div className="space-y-8">
//         {course.content.sections.map((section) => (
//           <div key={section.section_id} className="border-b pb-4">
//             <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>

//             {/* Sub-Sections */}
//             {section.sub_sections.map((subSection) => (
//               <div key={subSection.subsection_id} className="pl-4 mb-6">
//                 <h3 className="text-xl font-medium mb-2">{subSection.title}</h3>

//                 {/* Data (Text or Images) */}
//                 {subSection.data.map((data) => (
//                   <div key={data.data_id} className="mb-4">
//                     {data.type === "text" ? (
//                       <p className="text-gray-800 dark:text-gray-50">{data.content}</p>
//                     ) : data.type === "image" ? (
//                       <img
//                         src={data.content}
//                         alt={`Content for ${subSection.title}`}
//                         className="rounded shadow max-w-full h-auto"
//                       />
//                     ) : null}
//                   </div>
//                 ))}
//               </div>
//             ))}
//           </div>
//         ))}
//       </div>

//       {/* Tags */}
//       {course.content.tags.length > 0 && (
//         <div className="mt-8">
//           <h3 className="text-lg font-semibold mb-2">Tags:</h3>
//           <div className="flex flex-wrap gap-2">
//             {course.content.tags.map((tag, index) => (
//               <span
//                 key={index}
//                 className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
//               >
//                 {tag}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CoursePlayerPage;




// import React from "react";
// import { useParams } from "react-router-dom";

// const CoursePlayerPage: React.FC = () => {
//   const { id } = useParams<{ id: string }>();

//   // Mock course content (replace with API call or state management)
//   const courseContent = {
//     id,
//     title: "Introduction to React",
//     videoUrl: "https://www.example.com/video.mp4", // Replace with actual video URL
//     description:
//       "This is the course player for the Introduction to React course.",
//     resources: [
//       {
//         id: 1,
//         name: "React Documentation",
//         link: "https://reactjs.org/docs/getting-started.html",
//       },
//       {
//         id: 2,
//         name: "React GitHub Repository",
//         link: "https://github.com/facebook/react",
//       },
//     ],
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-3xl font-bold mb-4">{courseContent.title}</h1>
//       <p className="text-gray-700 mb-4">{courseContent.description}</p>
//       <div className="mb-6">
//         <video
//           controls
//           className="w-full max-w-4xl mx-auto rounded shadow"
//           src={courseContent.videoUrl}
//         >
//           Your browser does not support the video tag.
//         </video>
//       </div>
//       <h2 className="text-2xl font-semibold mb-4">Resources</h2>
//       <ul className="list-disc pl-6">
//         {courseContent.resources.map((resource) => (
//           <li key={resource.id} className="mb-2">
//             <a
//               href={resource.link}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-blue-500 hover:underline"
//             >
//               {resource.name}
//             </a>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default CoursePlayerPage;
