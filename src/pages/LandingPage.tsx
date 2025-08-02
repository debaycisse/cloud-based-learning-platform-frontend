import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getPopularCourses } from "../services/courseService"
import type { Course } from "../types"
import CourseCard from "../components/courses/CourseCard"
import LoadingSpinner from "../components/common/LoadingSpinner"

const LandingPage = () => {
  const [popularCourses, setPopularCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        setLoading(true)
        const { courses } = await getPopularCourses(5)
        setPopularCourses(courses)
      } catch (error) {
        console.error("Failed to fetch popular courses:", error);
        throw error;
      } finally {
        setLoading(false)
      }
    }

    fetchPopularCourses()
  }, [])

  const imgSrc = new URL('../assets/images/learning_illustration.png', import.meta.url).href;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-400 to-primary-600 text-white py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Unlock Your Learning Potential</h1>
              <p className="text-lg md:text-xl mb-8 max-w-lg">
                Personalized learning paths, interactive courses, and skill assessments to help you achieve your goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-md hover:bg-white/10 transition-colors text-center"
                >
                  Get Started
                </Link>
                <Link
                  to="/courses"
                  className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-md hover:bg-white/10 transition-colors text-center"
                >
                  Browse Courses
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src={imgSrc}
                alt="Learning illustration"
                className="rounded-lg max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary-50 dark:bg-secondary-900">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Platform</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-secondary-100 dark:bg-secondary-800 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-secondary-500/20 rounded-full flex items-center justify-center mb-4">
                <i className="fa-solid fa-graduation-cap text-secondary-500 text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Learning</h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                Customized learning paths based on your skills, goals, and learning style.
              </p>
            </div>

            <div className="bg-secondary-100 dark:bg-secondary-800 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-secondary-500/20 rounded-full flex items-center justify-center mb-4">
                <i className="fa-solid fa-chart-line text-secondary-500 text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Your Progress</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor your learning journey with detailed progress tracking and analytics.
              </p>
            </div>

            <div className="bg-secondary-100 dark:bg-secondary-800 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-secondary-500/20 rounded-full flex items-center justify-center mb-4">
                <i className="fa-solid fa-certificate text-secondary-500 text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Skill Assessments</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Validate your knowledge with comprehensive assessments and get detailed feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-16 bg-tertiary-50 text-tertiary-600">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Popular Courses</h2>
            <Link to="/courses" className="text-primary-700 hover:underline font-medium">
              View All Courses
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-tertiary-600 text-white">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of learners who have already transformed their skills and careers with our platform.
          </p>
          <Link
            to="/register"
            className="px-8 py-3 bg-primary-50 text-tertiary-600 font-medium rounded-md hover:bg-gray-100 transition-colors inline-block"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
