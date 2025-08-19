import { ROUTES } from "@/routes/constants";
import { Link } from "react-router-dom";
import { LanguageSwitcher } from "./LanguageSwitcher";

const Logo = () => {
  return (
    <div className="font-['Mynerve'] font-bold text-lg md:text-3xl">
      <div className="flex items-center gap-1">
        <Link to={ROUTES.home}>tasker</Link>
        <LanguageSwitcher />
        <GlobalListIcon size={24} />
      </div>
    </div>
  );
};

export default Logo;

const GlobalListIcon = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 6H3" strokeWidth="2" />
    <path d="M7 12H3" strokeWidth="2" />
    <path d="M7 18H3" strokeWidth="2" />

    {/* Globus */}
    <circle
      cx="16"
      cy="13"
      r="5"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    {/* Kontynenty */}
    <path d="M13 10l2 2-1 2-1-1z" fill="currentColor" />
    <path d="M16 9l2 1 1 2-1 1-1-1-1-1 0-2z" fill="currentColor" />
    <path d="M13 16l2 1 1-1 0 0-1 1z" fill="currentColor" />
    <circle cx="15" cy="11" r="0.1" fill="currentColor" />
    <circle cx="18" cy="15" r="0.3" fill="currentColor" />
  </svg>
);
