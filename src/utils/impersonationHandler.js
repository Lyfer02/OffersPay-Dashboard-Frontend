import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import StorageService from "@/utils/storageService";

const ImpersonationHandler = () => {
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const isImpersonated = urlParams.get("impersonated");
    const token = urlParams.get("token");
    const userId = urlParams.get("uid");
    const userName = urlParams.get("uname"); // Optionally pass name

    if (isImpersonated === "true" && token && userId) {
      // Fake a minimal user object or fetch full user info
      const user = {
        _id: userId,
        fullName: userName || "Impersonated User",
        role: "user",
        permissions: {
          canView: true,
          canEdit: false,
          canDelete: false,
          canCreate: false,
        },
      };

      StorageService.set("user", user, "session");
      StorageService.set("accessToken", token, "session");
      StorageService.set("permissions", user.permissions, "session");
      console.log(`✅ Impersonation applied for ${user.fullName}`);

      // Clean URL
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location]);

  return null;
};

export default ImpersonationHandler;
