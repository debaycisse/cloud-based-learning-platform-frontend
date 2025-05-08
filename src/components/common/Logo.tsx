import { Link } from "react-router-dom"

interface LogoProps {
  className?: string
}

const Logo = ({ className = "" }: LogoProps) => {
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <div className="h-8 w-8 text-primary-600 flex items-center justify-center">
        <i className="fa-solid fa-graduation-cap text-xl"></i>
      </div>
      <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">CBLP</span>
    </Link>
  )
}

export default Logo
