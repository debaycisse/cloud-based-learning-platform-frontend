import React from "react";
import { Link } from "react-router-dom";

const Menu = ({ isLogin = false }) => {
  return (
    <div className="flex items-center text-secondary-1-500">
      {isLogin && (
        <>
          <Link
            to="/"
            className="p-2 mr-0.5 bg-secondary-1-100 hover:bg-secondary-1-200 text-secondary-1-300 rounded-l-lg active:text-primary-100"
          >
            Home
          </Link>
          <Link
            to="/courses"
            className="p-2 mr-0.5 bg-secondary-1-100 hover:bg-secondary-1-200 text-secondary-1-300 active:text-primary-100"
          >
            Courses
          </Link>
          <Link
            to="/pricing"
            className="p-2 mr-0.5 bg-secondary-1-100 hover:bg-secondary-1-200 text-secondary-1-300 active:text-primary-100"
          >
            Pricing
          </Link>
          <Link
            to="/about-us"
            className="p-2 mr-0.5 bg-secondary-1-100 hover:bg-secondary-1-200 text-secondary-1-300 active:text-primary-100"
          >
            About Us
          </Link>
          <Link
            to="/contact-us"
            className="p-2 mr-0.5 bg-secondary-1-100 hover:bg-secondary-1-200 text-secondary-1-300 active:text-primary-100 rounded-r-lg"
          >
            Contact
          </Link>
        </>
      )}

      {!isLogin && (
        <>
          <Link
            to="/"
            className="p-2 mr-0.5 bg-secondary-1-100 hover:bg-secondary-1-200 text-secondary-1-300 rounded-l-lg active:text-primary-100"
          >
            Home
          </Link>
          <Link
            to="/courses"
            className="p-2 mr-0.5 bg-secondary-1-100 hover:bg-secondary-1-200 text-secondary-1-300 active:text-primary-100"
          >
            Courses
          </Link>
          <Link
            to="/pricing"
            className="p-2 mr-0.5 bg-secondary-1-100 hover:bg-secondary-1-200 text-secondary-1-300 active:text-primary-100"
          >
            Pricing
          </Link>
          <Link
            to="/login-signup"
            className="p-2 mr-0.5 bg-secondary-1-100 hover:bg-secondary-1-200 text-secondary-1-300 active:text-primary-100"
          >
            Login / SignUp
          </Link>
          <Link
            to="/about-us"
            className="p-2 mr-0.5 bg-secondary-1-100 hover:bg-secondary-1-200 text-secondary-1-300 active:text-primary-100"
          >
            About Us
          </Link>
          <Link
            to="/contact-us"
            className="p-2 mr-0.5 bg-secondary-1-100 hover:bg-secondary-1-200 text-secondary-1-300 active:text-primary-100 rounded-r-lg"
          >
            Contact
          </Link>
        </>
      )}
    </div>
  );
};

export default Menu;
