import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "../../context/AuthContext"
import Logo from "../../components/common/Logo"

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string().email("Please enter a valid email address"),
    name: z
      .string()
      .min(3, "Full name must be at least 3 characters")
      .max(50, "Full name must be at most 50 characters")
      .regex(/^[a-zA-Z ]+$/, "Full name can only contain letters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type RegisterFormData = z.infer<typeof registerSchema>

const RegisterPage = () => {
  const { register: registerUser } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      const { userId } = await registerUser(data.email, data.name, data.username, data.password)
      // After successful registration, redirect to preferences page
      navigate("/preferences", { state: { userId } })
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to register. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo className="mx-auto h-12 w-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Create a new account</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
          <div className="mb-4">
              <label htmlFor="name" className="form-label">
                <i className="fa-solid fa-user mr-2 text-gray-500"></i>
                Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                className={`input ${errors.name ? "border-red-500" : ""}`}
                placeholder="Name"
                {...register("name")}
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="username" className="form-label">
                <i className="fa-solid fa-user mr-2 text-gray-500"></i>
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                className={`input ${errors.username ? "border-red-500" : ""}`}
                placeholder="Username"
                {...register("username")}
              />
              {errors.username && <p className="form-error">{errors.username.message}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="form-label">
                <i className="fa-solid fa-envelope mr-2 text-gray-500"></i>
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`input ${errors.email ? "border-red-500" : ""}`}
                placeholder="Email address"
                {...register("email")}
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label">
                <i className="fa-solid fa-lock mr-2 text-gray-500"></i>
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className={`input ${errors.password ? "border-red-500" : ""}`}
                placeholder="Password"
                {...register("password")}
              />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label">
                <i className="fa-solid fa-lock mr-2 text-gray-500"></i>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={`input ${errors.confirmPassword ? "border-red-500" : ""}`}
                placeholder="Confirm Password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div>
            <button type="submit" disabled={isLoading} className="btn btn-primary w-full flex justify-center py-2 px-4">
              {isLoading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                  Creating account...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-user-plus mr-2"></i>
                  Create Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
