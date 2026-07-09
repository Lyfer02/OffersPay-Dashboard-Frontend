import { useAuth } from "@/pages/auth/authContext";


export const userCanAccess = () => {
  const { user } = useAuth();
  const permissions = user?.permissions || {};

  return {
    canView: permissions.canView,
    canEdit: permissions.canEdit,
    canDelete: permissions.canDelete,
    canCreate: permissions.canCreate,
  };
};