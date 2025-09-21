import Cookies from "js-cookie";
import { Navigate, useLocation } from "react-router-dom";
import  type { ReactNode } from "react";

interface PrivateRoutesProps {
  children: ReactNode;
}

export const PrivateRoutes = ({ children }: PrivateRoutesProps) => {
  const accessToken = Cookies.get("accessToken");
  const location = useLocation();
  if (accessToken) {
   return <>{children}</>
  }
  return <Navigate to="/" state={{ from: location }} replace />;
};