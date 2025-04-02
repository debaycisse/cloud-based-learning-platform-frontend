import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

const CourseCard = ({ title, description }) => {
  return (
    <>
      <div className="bg-secondary-1-100 rounded-lg p-2 h-fit flex flex-col items-center justify-center mx-2 sm:w-65 md:w-80 lg:mx-4 w-95">
        <FontAwesomeIcon
          icon={faImage}
          className="text-secondary-2-500 sm:text-6xl md:text-9xl"
        />

        <h5 className="font-bold text-secondary-2-500 sm:text-lg md:text-xl">
          {title.length > 22 ? title.slice(0, 22) + "..." : title}
        </h5>
        
        <p className="text-secondary-1-500">
          {description.length > 25
            ? description.slice(0, 25) + "..."
            : description}
        </p>
      </div>
    </>
  );
};

export default CourseCard;
