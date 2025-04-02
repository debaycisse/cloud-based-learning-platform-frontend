import React from "react";
import Menu from "./Menu";
import { Link } from "react-router-dom";
import Main from "./Main";

const Home = () => {
  return (
    <>
      {/* Header content of the page */}
      <header className="bg-secondary-1-500 pt-8 pb-56 min-w-4xl max-w-4xl sm:max-w-full sm:pb-8">
        <div className="py-4 px-4 flex justify-evenly">
          <Link to="/">
            <img
              src="/src/assets/home_page_icon.png"
              alt="Homepage Logo"
              className="h-10 w-8"
            />
          </Link>
          <Menu />
        </div>
        <div className="my-16 px-16">
          <h2 className="text-lg text-center text-white">
            Discover a personalized learning experience that adapts to your
            unique needs, helping you thrive at your own pace...
          </h2>
        </div>
        <div className="container mx-auto flex justify-center">
          <button className="bg-secondary-2-100 p-4 rounded-lg text-secondary-2-500 hover:bg-secondary-2-400 cursor-pointer active:text-secondary-1-200">
            Get Started
          </button>
        </div>
      </header>
      {/* Main content of the page */}
      <main>
        <Main />
      </main>
      {/* Footer part of the page */}
      <footer></footer>
    </>
  );
};

export default Home;
