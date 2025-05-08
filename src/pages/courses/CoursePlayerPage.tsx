import React from "react";
import { useParams } from "react-router-dom";

const CoursePlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Mock course content (replace with API call or state management)
  const courseContent = {
    id,
    title: "Introduction to React",
    videoUrl: "https://www.example.com/video.mp4", // Replace with actual video URL
    description:
      "This is the course player for the Introduction to React course.",
    resources: [
      {
        id: 1,
        name: "React Documentation",
        link: "https://reactjs.org/docs/getting-started.html",
      },
      {
        id: 2,
        name: "React GitHub Repository",
        link: "https://github.com/facebook/react",
      },
    ],
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">{courseContent.title}</h1>
      <p className="text-gray-700 mb-4">{courseContent.description}</p>
      <div className="mb-6">
        <video
          controls
          className="w-full max-w-4xl mx-auto rounded shadow"
          src={courseContent.videoUrl}
        >
          Your browser does not support the video tag.
        </video>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Resources</h2>
      <ul className="list-disc pl-6">
        {courseContent.resources.map((resource) => (
          <li key={resource.id} className="mb-2">
            <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {resource.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CoursePlayerPage;
