import { useState } from "react";
import { resetPassword } from "../../services/authService";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState<string>("");
  const [reseting, setReseting] = useState<boolean>(false);

  const handlePasswordReset = async () => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    setReseting(true);
    const res = await resetPassword(email);
    if (res.message) {
      setReseting(false);
      setEmail("");
      alert(
        "Password reset link has been sent to your registered email address."
      );
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-primary-900">
        Forgot Password
      </h1>
      <p className="mb-4 text-primary-900">
        Enter your email address to reset your password.
      </p>
      <form className="w-full max-w-sm text-primary-900">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          onChange={(e) => {
            handleEmailChange(e.target.value);
          }}
          value={email}
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          onClick={(e) => {
            e.preventDefault();
            handlePasswordReset();
          }}
        >
          {reseting ? "Sending Reset Link..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
