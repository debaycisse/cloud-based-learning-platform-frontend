import type React from "react"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAllUsers, deleteUser } from "../../services/userService"
import type { User } from "../../types"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"

const UsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch users using react-query
  const { data: usersData, isLoading, error } = useQuery(["adminUsers"], () => getAllUsers({ limit: 100 }))

  // Delete user mutation
  const deleteUserMutation = useMutation((userId: string) => deleteUser(userId), {
    onSuccess: () => {
      queryClient.invalidateQueries(["adminUsers"])
      toast.success("User deleted successfully")
    },
    onError: (error) => {
      console.error("Delete user error:", error)
      toast.error("Failed to delete user. Please try again.")
    },
  })

  const users: User[] = usersData?.users || []

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (userId: string) => {
    navigate(`/admin/user/${userId}/edit`)
  }

  const handleDelete = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUserMutation.mutate(userId)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-sm text-red-700 dark:text-red-400">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          Failed to load users. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          <i className="fa-solid fa-users mr-2 text-primary-500"></i>
          Manage Users
        </h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage all users in the system.</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="input w-full"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredUsers.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <table className="table-auto w-full text-left">
            <thead>
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2 capitalize">{user.role}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
                      onClick={() => handleEdit(user._id)}
                    >
                      <i className="fa-solid fa-edit mr-1"></i>Edit
                    </button>
                    <button
                      className="text-sm text-red-600 hover:text-red-500 dark:text-red-400 ml-4"
                      onClick={() => handleDelete(user._id)}
                      disabled={deleteUserMutation.isLoading}
                    >
                      <i className="fa-solid fa-trash mr-1"></i>Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No users found.</p>
        </div>
      )}
    </div>
  )
}

export default UsersPage
