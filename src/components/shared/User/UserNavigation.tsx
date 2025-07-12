import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { ROUTES } from "@/routes/constants";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

type userNavigationLink = {
  name: string;
  path: string;
};

const UserNavigation = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const userNavigationLinks: userNavigationLink[] = [
    { name: t("app.navigationLogin"), path: ROUTES.login },
    { name: t("app.navigationRegister"), path: ROUTES.register },
  ];

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-3">
        {userNavigationLinks.map((link: userNavigationLink) => {
          const isActive = link.path === pathname;

          return (
            <NavigationMenuItem key={link.name}>
              <NavigationMenuLink asChild>
                <Link
                  to={link.path}
                  className={`${
                    isActive &&
                    "before:block before:absolute before:-inset-1 before:-skew-y-3  before:bg-pink-500 relative inline-block"
                  }`}
                >
                  <span
                    className={`${
                      isActive ? "relative text-white" : "text-black"
                    }`}
                  >
                    {link.name}
                  </span>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default UserNavigation;
