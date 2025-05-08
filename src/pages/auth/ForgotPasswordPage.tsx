import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../services/authService";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");

  const handlePasswordReset = async () => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    const res = await resetPassword(email);
    if (res.reset_token) {
    setEmail("");
    alert("Password reset link has been sent to your email address.");

    // navigate to reset password success page
    navigate(`/reset-password/${res.reset_token}`);
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
      <p className="mb-4">Enter your email address to reset your password.</p>
      <form className="w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          onChange={(e) => {
            handleEmailChange(e.target.value);
          }}
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          onClick={(e) => {
            e.preventDefault();
            handlePasswordReset();
          }}
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
