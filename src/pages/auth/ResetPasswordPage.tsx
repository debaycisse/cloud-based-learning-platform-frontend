import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { verifyResetToken, updatePassword } from "../../services/authService";

const ResetPasswordPage = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = React.useState<string>("");
    const [confirmPassword, setConfirmPassword] = React.useState<string>("");
    const [resetToken, setResetToken] = React.useState<string>("");

    useEffect(() => {
        if (token) {
            setResetToken(token);
        } else {
            alert("Invalid or missing token. Redirecting to reapply for password reset.");
            navigate("/forgot-password");
        }
    }, []);

    const handlePasswordChange = (value: string) => {
        setNewPassword(value);
    };

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
    };

    const handleSubmit = async (newPassword: string, confirmPassword: string): Promise<void> => {
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match. Please try again.");
            return;
        }

        if (newPassword.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        if (!(await verifyResetToken(resetToken)).is_valid) {
            alert("Invalid or expired token. Please request a new password reset.");
            navigate("/forgot-password");
            return;
        }

        // Check for capital letters, numbers, and special characters
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            alert("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
            return;
        }

        // Call the API to update the password
        const updateResponse = await updatePassword(resetToken, newPassword);
        if (!updateResponse.message) {
            alert("Failed to reset password. Please try again.");
            navigate("/forgot-password");
            return;
        }

        alert("Your password has been reset successfully! Login to continue.");
        // Redirect to login page
        setNewPassword("");
        setConfirmPassword("");
        navigate("/login");
        

    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await handleSubmit(newPassword, confirmPassword);
    };

    
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      <p className="mb-4">Please enter your new password.</p>
      {/* Add form for resetting password here */}
      <form className="w-full max-w-sm" onSubmit={(e) => handleFormSubmit(e)}>
        <input
          type="password"
          placeholder="New Password"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          onChange={(e) => handlePasswordChange(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
