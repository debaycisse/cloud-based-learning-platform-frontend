import React from "react";
import { UserProgress } from "../../types/index";

interface DashboardStatsProps {
  progress: UserProgress | null;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ progress }) => {
  if (!progress) {
    return null; // If no progress data is available, return nothing
  }

  const completedCoursesCount = progress.completed_courses.length;
  const inProgressCoursesCount = [progress.in_progress_courses].length;
  const completedAssessmentsCount = progress.completed_assessments.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Completed Courses */}
      <div className="card p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
          Completed Course(s)
        </h3>
        <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
          {completedCoursesCount}
        </p>
      </div>

      {/* In-Progress Courses */}
      <div className="card p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
          In-Progress Course(s)
        </h3>
        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
          {inProgressCoursesCount}
        </p>
      </div>

      {/* Completed Assessments */}
      <div className="card p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
          Completed Assessment(s)
        </h3>
        <p className="text-2xl font-bold text-green-900 dark:text-green-200">
          {completedAssessmentsCount}
        </p>
      </div>
    </div>
  );
};

export default DashboardStats;