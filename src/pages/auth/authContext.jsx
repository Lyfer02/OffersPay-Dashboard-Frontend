import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/api/services/auth.service";
import StorageService from "@/utils/storageService";
import { runImpersonation } from "@/utils/runImpersonation";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

 const [user, setUser] = useState(() => {
    // console.log("🔍 Initializing user state...");
    const applied = runImpersonation();
    // console.log("🔍 Impersonation applied:", applied);
    
    if (applied) {
      const sessionUser = StorageService.getSession("user");
      // console.log("🔍 Session user:", sessionUser);
      return sessionUser;
    }
    const localUser = StorageService.get("user");
    // console.log("🔍 Local user:", localUser);
    return localUser;
  });

  const [permissions, setPermissions] = useState(() => {
    // console.log("🔍 Initializing permissions...");
    if (StorageService.isImpersonating()) {
      return StorageService.getSession("permissions") || {};
    }
    return StorageService.get("permissions") || {};
  });

  const [checking, setChecking] = useState(true);
  
  // console.log("🔍 AuthProvider state:", { user, checking, permissions });


  const isImpersonating = StorageService.isImpersonating();

  /** ✅ Login main */
  const login = (userData, accessToken) => {
    StorageService.set("user", userData, "local");
    StorageService.set("accessToken", accessToken, "local");
    StorageService.set("permissions", userData?.permissions || {}, "local");
    setUser(userData);
    setPermissions(userData?.permissions || {});
  };

  /** ✅ Logout */
  const logout = () => {
    StorageService.clearAll();
    setUser(null);
    setPermissions({});
    setChecking(false); 
    navigate("/auth/sign-in");
  };

  /** ✅ Impersonate */
  const loginAs = (impersonatedUser, impersonatedToken, originalUser, originalToken) => {
    const data = {
      impersonatedUser,
      impersonatedToken,
      originalUser,
      originalToken,
      timestamp: Date.now(),
    };
    StorageService.set("pendingImpersonation", data, "local");
  };

  /** ✅ Exit impersonation */
  const logoutAs = () => {
    const originalUser = StorageService.getSession("originalUser");
    const originalToken = sessionStorage.getItem("originalAccessToken");

    if (originalUser && originalToken) {
      sessionStorage.clear();
      StorageService.set("user", originalUser, "local");
      StorageService.set("accessToken", originalToken, "local");
      StorageService.set("permissions", originalUser?.permissions || {}, "local");

      setUser(originalUser);
      setPermissions(originalUser?.permissions || {});
    } else {
      logout();
    }
  };

  /** ✅ Check session */
const checkSession = async () => {
    // console.log("🔍 Starting session check...");
    
    if (StorageService.isImpersonating()) {
      // console.log("✅ Skipping backend session check — impersonating.");
      setChecking(false);
      return;
    }
    
    const token = StorageService.getLocal("accessToken");
    // console.log("🔍 Token found:", !!token);
    
    if (!token) {
      // console.log("❌ No token found, logging out...");
      logout();
      return;
    }

    try {
      // console.log("🔍 Making session request...");
      const res = await authService.getSession();
      // console.log("🔍 Session response:", res);
      
      const sessionUser = res?.data?.data;
      if (sessionUser) {
        // console.log("✅ Session valid, logging in user...");
          if (sessionUser.status === "inactive") {
    toast.error("Suspicious: Restricted login for your account");
    logout();
    return;
  }
        login(sessionUser, token);
      } else {
        // console.log("❌ Invalid session, logging out...");
        logout();
      }
    } catch (error) {
      // console.log("❌ Session check failed:", error);
      logout();
    } finally {
      // console.log("🔍 Session check complete, setting checking to false");
      setChecking(false);
    }
  };

  useEffect(() => {
    // console.log("🔍 useEffect triggered, calling checkSession...");
    checkSession();
   const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // ✅ Run every 5 minutes
    const interval = setInterval(() => {
      checkSession();
    }, 5 * 60 * 1000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [location.pathname]);


  /** 🔥 Permission helpers */
  const contextValue = {
    user,
    permissions,
    checking,
    token: sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken") || null,
    isImpersonating: StorageService.isImpersonating(),
    login,
    loginAs,
    logoutAs,
    logout,
    canView: permissions.canView || false,
    canEdit: permissions.canEdit || false,
    canDelete: permissions.canDelete || false,
    canCreate: permissions.canCreate || false,
  };

  // console.log("🔍 Rendering AuthProvider children. Checking:", checking);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {!checking && children}
    </AuthContext.Provider>
  );
};