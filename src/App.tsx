import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/common/ProtectedRoute"
import ErrorBoundary from "./components/common/ErrorBoundary"

// Layouts
import MainLayout from "./layouts/MainLayout"
import AdminLayout from "./layouts/AdminLayout"

// Public pages
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import PreferencesPage from "./pages/auth/PreferencesPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"

// Learner pages
import DashboardPage from "./pages/dashboard/DashboardPage"
import CoursesPage from "./pages/courses/CoursesPage"
import CourseDetailPage from "./pages/courses/CourseDetailPage"
import CoursePlayerPage from "./pages/courses/CoursePlayerPage"
import MyCoursesPage from "./pages/courses/MyCoursesPage"
import AssessmentPage from "./pages/assessment/AssessmentPage"
import AssessmentResultPage from "./pages/assessment/AssessmentResultPage"
import ProfilePage from "./pages/dashboard/ProfilePage"
import ProgressPage from "./pages/dashboard/ProgressPage"
import SupportPage from "./pages/SupportPage"

// Admin pages
import AdminDashboardPage from "./pages/admin/DashboardPage"
import AdminCoursesPage from "./pages/admin/CoursesPage"
import AdminCourseCreatePage from "./pages/admin/CourseCreatePage"
import AdminCourseEditPage from "./pages/admin/CourseEditPage"
import AdminUsersPage from "./pages/admin/UsersPage"
import AdminUserEditPage from "./pages/admin/UserEditPage"
import AdminAssessmentsPage from "./pages/admin/AssessmentsPage"
import AdminAssessmentCreatePage from "./pages/admin/AssessmentCreatePage"
import AdminAssessmentEditPage from "./pages/admin/AssessmentEditPage"
import AdminQuestionsPage from "./pages/admin/QuestionsPage"
import AdminQuestionCreatePage from "./pages/admin/QuestionCreatePage"
import AdminQuestionEditPage from "./pages/admin/QuestionEditPage"

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Protected learner routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/course/:id" element={<CourseDetailPage />} />
                <Route path="/course/:id/learn" element={<CoursePlayerPage />} />

                <Route path="/course/:id/course/:id/learn" element={<CoursePlayerPage />} />

                <Route path="/my-courses" element={<MyCoursesPage />} />
                <Route path="/assessment/:id" element={<AssessmentPage />} />

                <Route path="/course/:id/assessment/:id" element={<AssessmentPage />} />

                <Route path="/assessment/:id/result" element={<AssessmentResultPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/support" element={<SupportPage />} />
              </Route>
            </Route>

            {/* Protected admin routes */}
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/courses" element={<AdminCoursesPage />} />
                <Route path="/admin/course/create" element={<AdminCourseCreatePage />} />
                <Route path="/admin/course/:id/edit" element={<AdminCourseEditPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/user/:userId/edit" element={<AdminUserEditPage />} />
                <Route path="/admin/assessments" element={<AdminAssessmentsPage />} />
                <Route path="/admin/assessment/create" element={<AdminAssessmentCreatePage />} />
                <Route path="/admin/assessment/:id/edit" element={<AdminAssessmentEditPage />} />
                <Route path="/admin/questions" element={<AdminQuestionsPage />} />
                <Route path="/admin/question/create" element={<AdminQuestionCreatePage />} />
                <Route path="/admin/question/:id/edit" element={<AdminQuestionEditPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
