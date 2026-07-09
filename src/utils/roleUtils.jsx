// utils/roleUtils.js
import Unauthorized from "@/pages/dashboard/Unauthorized";
import { Navigate } from "react-router-dom";

export const hasRequiredRole = (userRole, requiredRoles) => {
  // If no roles are specified, allow access
  if (!requiredRoles || requiredRoles.length === 0) return true;
  
  // If user has no role, deny access
  if (!userRole) return false;
  
  // Check if user's role is in the required roles array
  return requiredRoles.includes(userRole);
};

export const ProtectedRoute = ({ element, roles, guard, user }) => {
  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Check role-based access
  if (!hasRequiredRole(user.role, roles)) {
    return <Unauthorized />;
  }

  return element;
};

export const getVisibleRoutes = (routes, userRole) => {
  if (!routes || !Array.isArray(routes)) return [];
  
  return routes.filter(route => {
    // If no roles specified, route is visible to all
    if (!route.roles || route.roles.length === 0) return true;
    
    // Check if user has required role
    return hasRequiredRole(userRole, route.roles);
  });
};