import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import CourseCard from "./CourseCard";

const Main = () => {
  return (
    <>
      {/* Section 1 */}
      <section className="bg-secondary-1-100 max-h-fit min-w-4xl pl-4 pr-4 py-56 sm:py-25 sm:px-8 md:px-40">
        <div className="flex py-8 border rounded-2xl border-secondary-2-500 h-55 sm:h-60 md:h-90">
          {/* The image */}
          <img
            src="/src/assets/section_1_image.png"
            alt="cloud-based learning potential image depiction"
            className="pl-8"
          />
          {/* The Texts */}
          <div className="flex flex-col justify-between mx-8">
            <h2 className="text-3xl text-secondary-2-500 font-bold">
              Unlock Your Learning Potential
            </h2>
            <p className="text-secondary-1-500 text-lg">
              Experience the future of education with our cloud-based learning
              platform. Access personalized resources and track your progress
              anytime, anywhere.
            </p>
          </div>
        </div>
      </section>
      {/* Section 2 */}
      <section className="bg-primary-500 max-h-fit min-w-4xl max-w-full py-36 sm:py-14">
        <div>
          <h2 className="text-3xl text-secondary-2-100 font-bold text-center py-16">
            Why Choose Us?
          </h2>
          <div className="flex flex-col ml-4 mr-4 py-16 sm:h-190 sm:flex-row sm:justify-between">
            {/* The image */}
            <img
              src="/src/assets/section_2_image.png"
              alt="cloud-based learning potential image depiction"
              className="sm:h-120"
            />
            {/* The Texts */}
            <div className="my-16 mr-4 sm:flex sm:flex-col sm:justify-between sm:my-0 sm:max-h-120">
              <h2 className="text-3xl text-secondary-2-100 font-bold my-8 sm:my-0">
                Learn Anywhere
              </h2>
              <p className="text-secondary-2-100 text-lg">
                Access courses from any device with our cloud-based platform and
                enjoy a seamless learning experience. Our platform is designed
                to provide you with the flexibility and convenience you need to
                succeed in your studies. With our cloud-based platform, you can
                access your courses from anywhere, at any time. Whether you're
                on your laptop, tablet, or smartphone, you'll have everything
                you need to succeed at your fingertips.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Section 3 */}
      <section className="bg-secondary-1-100 max-h-fit min-w-4xl max-w-full py-36 sm:py-14">
        <div>
          <h2 className="text-3xl text-secondary-2-400 font-bold text-center py-16">
            Diversed ICT Courses
          </h2>
          <div className="flex flex-col ml-4 mr-4 py-16 sm:h-190 sm:flex-row sm:justify-between">
            {/* The image */}
            <img
              src="/src/assets/section_3_image.png"
              alt="cloud-based learning potential image depiction"
              className="sm:h-120"
            />
            {/* The Texts */}
            <div className="my-16 mr-4 sm:flex sm:flex-col sm:justify-between sm:my-0 sm:max-h-120">
              <h2 className="text-3xl text-secondary-2-400 font-bold my-8 sm:my-0">
                Begin Your Tech Journey Here
              </h2>
              <p className="text-secondary-2-400 text-lg">
                Our platform offers a wide range of courses in information
                communication technology, taught by industry experts. Whether
                you're looking to upskill or start a new career, we have the
                right course for you.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Section 4 */}
      <section className="bg-secondary-2-500 max-h-fit min-w-4xl max-w-full py-36 sm:py-14">
        <div>
          <h2 className="text-3xl text-secondary-2-100 font-bold text-center py-16">
            Certified Instructors
          </h2>
          <div className="flex flex-col ml-4 mr-4 py-16 sm:h-190 sm:flex-row sm:justify-between">
            {/* The image */}
            <img
              src="/src/assets/section_4_image.png"
              alt="cloud-based learning potential image depiction"
              className="sm:h-120"
            />
            {/* The Texts */}
            <div className="my-16 mr-4 sm:flex sm:flex-col sm:justify-between sm:my-0 sm:max-h-120">
              <h2 className="text-3xl text-secondary-2-100 font-bold  my-8 sm:my-0">
                Learn from Industry Experts
              </h2>
              <p className="text-secondary-2-100 text-lg">
                Our instructors are certified professionals with years of
                experience in their fields. They are dedicated to helping you
                succeed and will provide you with the support you need to reach
                your goals.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Section 5 */}
      <section className="bg-secondary-2-100 max-h-fit min-w-4xl max-w-full py-36 sm:py-14">
        <div className="mx-auto text-center">
          <h2 className="text-3xl text-secondary-2-500 font-bold py-10">
            Hear from Our Learners
          </h2>
          <p className="text-secondary-2-500 text-lg pb-16 px-16">
            Our students love our platform! Read their testimonials and see how
            we've helped them achieve their goals.
          </p>
        </div>
        {/* The actual comments - placeholder */}
        <div className="container mx-auto w-130 md:w-120 sm:w-100 text-secondary-2-500">
          <article className="flex flex-col mb-8">
            <div className="flex max-h-12 my-4">
              {/* <img src="" alt="leaner's profile picture" /> Used fontawesome here to hold user's icon */}
              <FontAwesomeIcon icon={faUser} className="text-4xl mr-5" />
              <div className="text-xs">
                <p>Azeez Adebayo, Software Engineer</p>
                <p>Februrary 23, 2025</p>
              </div>
            </div>
            <div>
              <p className="text-lg border border-secondary-2-300 rounded-lg p-2 mt-1">
                "I had a great experience with this platform. The courses were
                well-structured and the instructors were very knowledgeable."
              </p>
            </div>
          </article>
          <article className="flex flex-col mb-8">
            <div className="flex max-h-12 my-4">
              {/* <img src="" alt="leaner's profile picture" /> Used fontawesome here to hold user's icon */}
              <FontAwesomeIcon icon={faUser} className="text-4xl mr-5" />
              <div className="text-xs">
                <p>Olaoluwa Samuel, UI / UX Engineer</p>
                <p>January 7, 2025</p>
              </div>
            </div>
            <div>
              <p className="text-lg border border-secondary-2-300 rounded-lg p-2 mt-1">
                "The platform is very user-friendly and the support team is
                always available to help."
              </p>
            </div>
          </article>
          <article className="flex flex-col mb-8">
            <div className="flex max-h-12 my-4">
              {/* <img src="" alt="leaner's profile picture" /> Used fontawesome here to hold user's icon */}
              <FontAwesomeIcon icon={faUser} className="text-4xl mr-5" />
              <div className="text-xs">
                <p>Fatima Oluwaseun, Data Analyst</p>
                <p>December 18, 2024</p>
              </div>
            </div>
            <div>
              <p className="text-lg border border-secondary-2-300 rounded-lg p-2 mt-1">
                "I highly recommend this platform to anyone looking to learn new
                skills or advance their career."
              </p>
            </div>
          </article>
        </div>
      </section>
      {/* Section 6 */}
      <section className="bg-secondary-2-500 max-h-fit min-w-4xl max-w-full py-36 sm:py-14">
        <div>
          <h2 className="text-3xl text-secondary-2-100 font-bold text-center py-16">
            Courses
          </h2>
          <div className="flex flex-wrap justify-center mb-24 border border-amber-600 gap-2 sm:gap-3 md:gap-8  ">
            {/* className="flex items-center justify-center mb-24" */}
            <CourseCard
              title={"Introduction To Cloud Computing"}
              description={
                "Understand the basic of cloud technology and its benefits."
              }
              className="shrink-0"
            />

            <CourseCard
              title={"Basic Of HTML"}
              description={
                "Learn the building blocks of web technology and how to create a simple webpage."
              }
              className="shrink-0"
            />

            <CourseCard
              title={"Advanced Python Programming"}
              description={
                "Enhance your coding skills with Python and learn advanced programming concepts."
              }
              className="shrink-0"
            />

            <CourseCard
              title={"Understanding CSS"}
              description={
                "Learn how to style your webpages and make them visually appealing."
              }
              className="shrink-0"
            />

            <CourseCard
              title={"Understanding CSS"}
              description={
                "Learn how to style your webpages and make them visually appealing."
              }
              className="shrink-0"
            />

            <CourseCard
              title={"Understanding CSS"}
              description={
                "Learn how to style your webpages and make them visually appealing."
              }
              className="shrink-0"
            />
          </div>
          <div className=" mx-auto mt-28 sm:w-60 md:w-72">
            <Link
              to="/all_courses"
              className=" bg-secondary-2-100 text-lg text-secondary-2-500 rounded-lg hover:bg-secondary-2-400 cursor-pointer active:text-secondary-1-300 sm:p-2 md:p-4"
            >
              View all courses
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Main;
