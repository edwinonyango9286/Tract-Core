import Cookies from "js-cookie";
import type { ReactNode } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";

interface PublicRoutesProps {
  children?: ReactNode; 
}

export const PublicRoutes = ({ children }: PublicRoutesProps) => {
  const accessToken = Cookies.get("access_token");
  const location = useLocation();
  if (accessToken) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }
  return children ? <>{children}</> : <Outlet />;
};