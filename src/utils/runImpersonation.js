// /src/utils/runImpersonation.js

import StorageService from "@/utils/storageService";

export const runImpersonation = () => {
  const pending = StorageService.getLocal("pendingImpersonation");
  if (!pending) return false;

  try {
    const {
      impersonatedUser,
      impersonatedToken,
      originalUser,
      originalToken,
      timestamp,
    } = pending;

    if (Date.now() - timestamp > 60000) {
      StorageService.remove("pendingImpersonation");
      return false;
    }

    StorageService.set("user", impersonatedUser, "session");
    StorageService.set("accessToken", impersonatedToken, "session");
    StorageService.set("permissions", impersonatedUser?.permissions || {}, "session");
    StorageService.set("originalUser", originalUser, "session");
    StorageService.set("originalAccessToken", originalToken, "session");

    StorageService.remove("pendingImpersonation");
    console.log(`✅ Impersonation applied for ${impersonatedUser?.fullName}`);
    return true;
  } catch {
    StorageService.remove("pendingImpersonation");
    return false;
  }
};
