import { ROUTES } from "@/routes/constants";
import { Link } from "react-router-dom";
import { LanguageSwitcher } from "./LanguageSwitcher";

const Logo = () => {
  return (
    <div className="font-['Mynerve'] font-bold text-lg md:text-3xl">
      <div className="flex items-center gap-1">
        <Link to={ROUTES.home}>tasker</Link>
        <LanguageSwitcher />
      </div>
    </div>
  );
};

export default Logo;
