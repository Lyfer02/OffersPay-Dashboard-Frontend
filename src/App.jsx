import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { ToastContainer } from "react-toastify";
import ImpersonationHandler from "./utils/impersonationHandler";
import { useAuth } from "./pages/auth/authContext";
import PageNotFound from "./widgets/components/PageNotFound";
import Unauthorized from "./pages/dashboard/Unauthorized";

function App() {
  const { user, checking } = useAuth();

  // console.log("🔍 App component - user:", user, "checking:", checking);

  if (checking) {
    // console.log("🔍 App is checking, returning loading");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // console.log("🔍 App rendering routes...");

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <ImpersonationHandler />
      <Routes>
        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard/*"
          element={user ? <Dashboard /> : <Navigate to="/auth/sign-in" replace />}
        />
        
        {/* Auth Routes - redirect to dashboard if already logged in */}
        <Route 
          path="/auth/*" 
          element={user ? <Navigate to="/dashboard/home" replace /> : <Auth />} 
        />
        
        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Root redirect */}
        <Route 
          path="/" 
          element={
            user ? (
              <Navigate to="/dashboard/home" replace />
            ) : (
              <Navigate to="/auth/sign-in" replace />
            )
          } 
        />
        
        {/* Catch all other routes - show PageNotFound instead of redirecting */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;