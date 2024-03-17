import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu';
import { ROUTES } from '@/routes/constants';
import { Link, useLocation } from 'react-router-dom';

type userNavigationLink = {
  name: string;
  path: string;
};

const userNavigationLinks: userNavigationLink[] = [
  { name: 'Login', path: ROUTES.login },
  { name: 'Register', path: ROUTES.register },
];

const UserNavigation = () => {
  const { pathname } = useLocation();
  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-3">
        {userNavigationLinks.map((link: userNavigationLink) => {
          const isActive = link.path === pathname;

          return (
            <NavigationMenuItem key={link.name}>
              <NavigationMenuLink asChild>
                <Link to={link.path} className={`${isActive && 'before:block before:absolute before:-inset-1 before:-skew-y-3  before:bg-pink-500 relative inline-block'}`}>
                  <span className={`${isActive ? 'relative text-white' : 'text-black'}`}>{link.name}</span>
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
