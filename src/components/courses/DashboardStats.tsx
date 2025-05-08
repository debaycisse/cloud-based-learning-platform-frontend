import type { UserProgress } from "../../types"

interface DashboardStatsProps {
  progress: UserProgress | null
}

const DashboardStats = ({ progress }: DashboardStatsProps) => {
  if (!progress) return null

  const completedCourses = progress.completed_courses.length
  const inProgressCourses = progress.in_progress_courses.length
  const completedAssessments = progress.completed_assessments.length

  const stats = [
    {
      name: "Courses Completed",
      value: completedCourses,
      icon: "fa-solid fa-check-circle",
      color: "text-tertiary-500",
    },
    {
      name: "Courses In Progress",
      value: inProgressCourses,
      icon: "fa-solid fa-clock",
      color: "text-primary-500",
    },
    {
      name: "Assessments Completed",
      value: completedAssessments,
      icon: "fa-solid fa-clipboard-check",
      color: "text-secondary-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center hover:shadow-md transition-shadow"
        >
          <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700 mr-4 ${stat.color}`}>
            <i className={`${stat.icon} text-xl`}></i>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DashboardStats
