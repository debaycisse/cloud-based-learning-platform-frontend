import type React from "react"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import { getUserById, updateUser } from "../../services/userService"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { toast } from "react-hot-toast"

const UserEditPage = () => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  })

  // Fetch user data
  const {
    isLoading,
    error,
  } = useQuery(["user", userId], () => getUserById(userId || ""), {
    enabled: !!userId,
    onSuccess: (data) => {
      setFormData({
        name: data.user.name || "",
        email: data.user.email || "",
        role: data.user.role || "learner",
      })
    },
  })

  // Update user mutation
  const updateUserMutation = useMutation(

    (data: { userId: string; userData: any }) => updateUser(data.userId, data.userData),
    {
      onSuccess: () => {
        toast.success("User updated successfully")
        navigate("/admin/users")
      },
      onError: (error) => {
        console.error("Update user error:", error)
        toast.error("Failed to update user. Please try again.")
      },
    },
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    updateUserMutation.mutate({
      userId,
      userData: formData,
    })
  }

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-sm text-red-700 dark:text-red-400">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          Failed to load user data. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          <i className="fa-solid fa-user-edit mr-2 text-primary-500"></i>
          Edit User
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Update user information and role.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            >
              <option value="learner">Learner</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={updateUserMutation.isLoading}
            >
              {updateUserMutation.isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserEditPage
