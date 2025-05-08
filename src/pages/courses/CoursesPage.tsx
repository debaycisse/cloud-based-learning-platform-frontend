import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import courseService from '../../services/courseService'
import CourseCard from '../../components/courses/CourseCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const CoursesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const { data: coursesData, isLoading, error } = useQuery({
    queryKey: ['courses', searchTerm, selectedCategory],
    queryFn: () => courseService.getAllCourses({
      search: searchTerm,
      category: selectedCategory,
      limit: 20,
      skip: 0
    })
  })

  const categories = [
    'Programming',
    'Web Development',
    'Data Science',
    'Machine Learning',
    'Cloud Computing'
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        An error occurred while loading courses
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Explore Courses</h1>
        
        {/* Search and Filter Section */}
        <div className="text-secondary-600 flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded-lg flex-grow"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border rounded-lg w-full md:w-48"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesData?.courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
            />
          ))}
        </div>

        {/* Empty State */}
        {coursesData?.courses.length === 0 && (
          <div className="text-center text-gray-600 p-8">
            <p className="text-xl">No courses found</p>
            <p className="mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CoursesPage