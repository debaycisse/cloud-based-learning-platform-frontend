import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getAllCourses } from "../../services/courseService";
import { getAssessments } from "../../services/assessmentService";
import { getAllUsers } from "../../services/userService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Course, Assessment, User } from "../../types";

const AdminDashboardPage = () => {
  // Fetch courses for stats
  const {
    data: coursesData,
    isLoading: isCoursesLoading,
    error: coursesError,
  } = useQuery(["adminCourses"], () => getAllCourses({ limit: 100 }));

  // Fetch assessments for stats
  const {
    data: assessmentsData,
    isLoading: isAssessmentsLoading,
    error: assessmentsError,
  } = useQuery(["adminAssessments"], () => getAssessments());

  // Fetch assessments results for stats
  // const {
  //   data: assessmentsResultsData,
  //   isLoading: isAssessmentsResultsLoading,
  //   error: assessmentsResultsError,
  // } = useQuery(["adminAssessmentsResults"], () =>
  //   getAssessmentResultAverage(assessmentsData?.assessments[0]._id || "")
  // );

  // Fetch users for stats
  const {
    data: usersData,
    isLoading: isUsersLoading,
    error: usersError,
  } = useQuery(["adminUsers"], () => getAllUsers({ limit: 100 }));

  if (isCoursesLoading || isAssessmentsLoading || isUsersLoading) {
    return <LoadingSpinner />;
  }

  if (coursesError || assessmentsError || usersError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-sm text-red-700 dark:text-red-400">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          Failed to load dashboard data. Please try again later.
        </p>
      </div>
    );
  }

  const courses: Course[] = coursesData?.courses || [];
  const assessments: Assessment[] = assessmentsData?.assessments || [];
  const users: User[] = usersData?.users || [];

  // Dashboard stats
  const stats = {
    totalUsers: users.length,
    totalCourses: courses.length,
    totalAssessments: assessments.length,
    completedCourses: courses.reduce(
      (acc, course) => acc + (course.completed_users.length > 0 ? 1 : 0),
      0
    )
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          <i className="fa-solid fa-gauge mr-2 text-primary-500"></i>
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of platform metrics and activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Users
          </h3>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalUsers}
            </div>
          </div>
          <div className="mt-4 flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <Link
              to="/admin/users"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              View all
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Courses
          </h3>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalCourses}
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">
                {stats.completedCourses} completions
              </span>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <Link
              to="/admin/courses"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              View all
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Assessments
          </h3>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalAssessments}
            </div>
          </div>
          <div className="mt-4 flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <Link
              to="/admin/assessments"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              View all
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
