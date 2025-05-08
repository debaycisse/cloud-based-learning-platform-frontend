import type { LearningPath } from "../../types"

interface LearningPathCardProps {
  path: LearningPath
}

const LearningPathCard = ({ path }: LearningPathCardProps) => {
  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex items-start">
          <div className="mr-4 text-tertiary-500 text-2xl">
            <i className="fa-solid fa-road"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{path.title}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{path.description}</p>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  <i className="fa-solid fa-book mr-1"></i>
                  {path.courses.length} courses
                </span>
                <button className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
                  <i className="fa-solid fa-arrow-right mr-1"></i>
                  View Path
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {path.target_skills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="badge badge-tertiary">
                    {skill}
                  </span>
                ))}
                {path.target_skills.length > 3 && (
                  <span className="badge bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    +{path.target_skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearningPathCard
