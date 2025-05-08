import { Link } from "react-router-dom"
import type { Course } from "../../types"

interface CourseCardProps {
  course: Course
}

const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="relative pb-1/2">
        <img
          src={`https://source.unsplash.com/random/800x600?${course.category}`}
          alt={course.title}
          className="absolute h-full w-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h3>
          <span className="badge badge-primary">{course.difficulty}</span>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{course.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <i className="fa-solid fa-layer-group mr-1 text-gray-500 dark:text-gray-400"></i>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {course.content.sections.length} sections
            </span>
          </div>
          <Link
            to={`/course/${course._id}`}
            className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            <i className="fa-solid fa-arrow-right mr-1"></i>
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CourseCard
