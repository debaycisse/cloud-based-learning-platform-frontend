import { Link } from "react-router-dom"
import type { Course } from "../../types"

interface CourseCardProps {
  course: Course
  resume?: boolean
  percentage?: number
  cooldownElapsed?: boolean
  passedAssessment?: boolean

}


const CourseCard = ({
  course, resume, percentage=0, cooldownElapsed, passedAssessment
}: CourseCardProps) => {
  const img = course.category === 'Programming'? 'https://i.ibb.co/hnZ9kf7/programming.webp' :
    course.category === 'Data Science'? 'https://i.ibb.co/PZm982nX/data-science.webp' :
    course.category === 'Web Development'? 'https://i.ibb.co/8nVQrXVc/web-dev.webp' :
    course.category === 'Mobile Development'? 'https://i.ibb.co/W4dwScpv/mobile-dev.webp' :
    course.category === 'DevOps'? 'https://i.ibb.co/6R6MsRvZ/devops.webp':
    course.category === 'Cloud Computing'? 'https://i.ibb.co/WNP55yFF/cloud-computing.webp' :
    course.category === 'Cybersecurity'? 'https://i.ibb.co/cq9xKY0/cybersecurity.webp':
    course.category === 'Artificial Intelligence'? 'https://i.ibb.co/KpQhxcMf/artificial-intelligence.webp':
    'https://i.ibb.co/63Dv0cm/tech-tools.webp'


  // Is it an in-progress course


  // Is it 

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="relative pb-1/2">
        <img
          src={`${img}`}
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
          {resume === true && percentage >= 0 ? (
            <Link
              to={`/course/${course._id}/learn/${percentage}`}
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              <i className="fa-solid fa-spinner-right mr-1"></i>
              Resume
            </Link>
          ) : passedAssessment === false ? cooldownElapsed === true ? (
            <Link
              to={`/course/${course._id}`}
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              <i className="fa-solid fa-arrow-right mr-1"></i>
              Take Assessment
            </Link>
          ) : (
            <Link
              to={`/course/${course._id}`}
              className="text-sm font-medium text-primary-600 hover:text-primary-500 pointer-events-none opacity-50 dark:text-primary-400"
              onClick={e => e.preventDefault()}
            >
              <i className="fa-solid fa-arrow-right mr-1"></i>
              Take Assessment
            </Link>
          ) : (
            <Link
              to={`/course/${course._id}`}
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              <i className="fa-solid fa-spinner-right mr-1"></i>
              View Details
            </Link>
          )

          }
        </div>
      </div>
    </div>
  )
}

export default CourseCard
