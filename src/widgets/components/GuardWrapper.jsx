// src/components/GuardWrapper.jsx
import { useAuth } from "@/pages/auth/authContext";
import { Navigate } from "react-router-dom";

const GuardWrapper = ({ guard, roles = [], children }) => {
  const { user } = useAuth();

  if (guard === "public") return children;
  if (guard === "private" && !user) return <Navigate to="/sign-in" />;
  if (guard === "protected" && (!user || !roles.includes(user.role))) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default GuardWrapper;
