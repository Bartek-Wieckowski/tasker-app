import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/routes/constants";
import { Navigate, Outlet } from "react-router-dom";
import Loader from "./Loader";

type RouteGuardProps = {
  requireAuth?: boolean;
  children?: React.ReactNode;
};

export default function RouteGuard({
  requireAuth = false,
  children,
}: RouteGuardProps) {
  const { isAuth, isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  if (requireAuth) {
    if (!isAuth) {
      return <Navigate to={ROUTES.login} replace />;
    }
  } else {
    if (isAuth) {
      return <Navigate to={ROUTES.home} replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}
