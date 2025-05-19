import React from "react";

const RegisterationInfoPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-primary-900">
        Verify Your Email
      </h1>
      <p className="text-primary-900 text-center max-w-md">
        Thank you for registering! <br />
        Please check your email inbox and click on the verification link we sent you to complete your registration.
        <br />
        If you don't see the email, please check your spam or junk folder.
      </p>
    </div>
  );
};

export default RegisterationInfoPage;