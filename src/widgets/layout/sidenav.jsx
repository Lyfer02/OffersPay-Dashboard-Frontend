import PropTypes from "prop-types";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PowerIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/pages/auth/authContext";
import { authService } from "@/api/services/auth.service";
import { toast } from "react-toastify";
import { hasRequiredRole, getVisibleRoutes } from "@/utils/roleUtils";

export function Sidenav({ brandImg, brandName, routes }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const role = user?.role;

  // Loading state while role is being determined
  if (!role) {
    return (
      <aside className="fixed inset-0 z-50 my-4 ml-4 w-72 rounded-xl bg-white shadow-lg border border-blue-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <Typography variant="small" color="blue-gray" className="font-medium">
            Loading...
          </Typography>
        </div>
      </aside>
    );
  }

  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const sidenavRef = useRef(null);

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  // Check if user has access to any sub-page using utility function
  const hasAccessToAnySubPage = (pages) => {
    if (!pages || pages.length === 0) return false;
    return pages.some((subPage) => 
      subPage.visible !== false && hasRequiredRole(role, subPage.roles)
    );
  };

  // Filter routes based on user role and visibility using utility functions
  const getAccessibleRoutes = () => {
    return routes.map(route => ({
      ...route,
      pages: getVisibleRoutes(route.pages.filter(page => {
        // Skip if explicitly hidden
        if (page.visible === false) return false;
        
        // For pages with sub-pages, check if user has access to any sub-page
        if (page.pages) {
          // Filter sub-pages using utility function
          const visibleSubPages = getVisibleRoutes(page.pages.filter(subPage => 
            subPage.visible !== false
          ), role);
          
          // Only show parent if it has visible sub-pages
          return visibleSubPages.length > 0;
        }
        
        // For regular pages, will be filtered by getVisibleRoutes
        return true;
      }), role)
    })).filter(route => route.pages.length > 0);
  };

  // Auto-expand parent if a subpage is active
  useEffect(() => {
    const expanded = {};
    routes.forEach(({ layout, pages }) => {
      pages.forEach((page) => {
        if (page.pages) {
          const match = page.pages.some(
            (subPage) => currentPath === `/${layout}${page.path}${subPage.path}`
          );
          if (match) expanded[page.name] = true;
        }
      });
    });
    setOpenDropdowns(expanded);
  }, [currentPath, routes]);

  // Close sidebar on outside click (for mobile)
  useEffect(() => {
    function handleClickOutside(event) {
      if (openSidenav && window.innerWidth < 1280) {
        if (sidenavRef.current && !sidenavRef.current.contains(event.target)) {
          setOpenSidenav(dispatch, false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openSidenav, dispatch]);

  // Allow only one dropdown open at a time
  const toggleDropdown = (name) => {
    setOpenDropdowns((prev) => ({
      [name]: !prev[name],
    }));
  };

  const renderPageItem = (page, layout) => {
    // Dropdown parent
    if (page.pages) {
      // Use utility function to get accessible sub-pages
      const accessibleSubPages = getVisibleRoutes(
        page.pages.filter(subPage => subPage.visible !== false), 
        role
      );
      
      if (accessibleSubPages.length === 0) return null;

      const isParentActive = page.pages.some(
        (subPage) => currentPath === `/${layout}${page.path}${subPage.path}`
      );
      const isOpen = openDropdowns[page.name];

      return (
        <li key={page.name} className="mb-1">
          <div
            onClick={() => toggleDropdown(page.name)}
            className={`flex items-center justify-between cursor-pointer px-4 py-2 rounded-lg 
              transition-all duration-200 group
              ${
                isParentActive
                  ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md"
                  : "hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-600 hover:shadow-sm"
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`${isParentActive ? "text-white" : "text-blue-gray-700"} group-hover:text-white transition-colors`}>
                {page.icon}
              </div>
              <Typography
                className={`text-sm font-medium capitalize ${isParentActive ? "text-white" : "group-hover:text-white"} transition-colors`}
              >
                {page.name}
              </Typography>
            </div>
            {isOpen ? (
              <ChevronDownIcon className="h-4 w-4 text-white transition-transform duration-200" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-blue-gray-400 group-hover:text-white transition-colors" />
            )}
          </div>

          {isOpen && (
            <ul className="pl-6 py-1 transition-all duration-300 ease-in-out">
              {accessibleSubPages.map((subPage) => (
                <li key={subPage.name} className="my-1">
                  <NavLink to={`/${layout}${page.path}${subPage.path}`}>
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "gradient" : "text"}
                        color={isActive ? sidenavColor : "blue-gray"}
                        className={`flex items-center gap-3 px-4 py-2 text-left text-sm capitalize w-full
                          transition-all duration-150 ease-in-out
                          ${
                            isActive
                              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-sm"
                              : "hover:bg-blue-gray-50 hover:shadow-sm"
                          }`}
                        fullWidth
                      >
                        <Typography color="inherit" className="font-medium">
                          {subPage.name}
                        </Typography>
                      </Button>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    }

    // Regular link - role checking is already done by getVisibleRoutes
    return (
      <li key={page.name}>
        <NavLink to={`/${layout}${page.path}`}>
          {({ isActive }) => (
            <Button
              variant={isActive ? "gradient" : "text"}
              color={isActive ? sidenavColor : "blue-gray"}
              className={`flex items-center gap-3 px-4 py-2 text-left text-sm capitalize w-full
                transition-all duration-150 ease-in-out
                ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-sm"
                    : "hover:bg-blue-gray-50 hover:shadow-sm"
                }`}
              fullWidth
            >
              <div className={`${isActive ? "text-white" : "text-blue-gray-600"} transition-colors`}>
                {page.icon}
              </div>
              <Typography color="inherit" className="font-medium">
                {page.name}
              </Typography>
            </Button>
          )}
        </NavLink>
      </li>
    );
  };

  const LogoutUser = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts
    
    try {
      setIsLoggingOut(true);
      const res = await authService.logout();
      logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Failed to logout User:', error);
      toast.error('Failed to Logout');
      setIsLoggingOut(false);
    }
  };

  // Get accessible routes using utility function
  const accessibleRoutes = getAccessibleRoutes();

  // Show warning if no routes are accessible
  if (accessibleRoutes.length === 0 || accessibleRoutes.every(route => route.pages.length === 0)) {
    return (
      <aside className="fixed inset-0 z-50 my-4 ml-4 w-72 rounded-xl bg-white shadow-lg border border-red-100 flex items-center justify-center">
        <div className="text-center p-4">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <Typography variant="h6" color="red" className="font-medium mb-1">
            Access Restricted
          </Typography>
          <Typography variant="small" color="blue-gray" className="text-center">
            You don't have access to any dashboard features. Please contact your administrator.
          </Typography>
          <Button
            variant="outlined"
            color="red"
            size="sm"
            onClick={LogoutUser}
            className="mt-3"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      ref={sidenavRef}
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 w-72 rounded-xl transition-transform duration-300 
      xl:translate-x-0 overflow-y-auto scrollbar-hide border border-blue-gray-100 flex flex-col`}
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={brandImg}
            alt={brandName}
            className="h-10 w-10 rounded-full object-cover shadow-md"
          />
          <Link to="/" className="no-underline">
            <Typography
              variant="h6"
              color={sidenavType === "dark" ? "white" : "blue-gray"}
              className="font-semibold"
            >
              {brandName}
            </Typography>
          </Link>
        </div>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-gray-600" />
        </IconButton>
      </div>

      {/* Routes */}
      <div className="flex-1 p-4">
        {accessibleRoutes.map(({ layout, title, pages }, key) => (
          <ul key={key} className="mb-4 flex flex-col gap-1">
            {title && (
              <li className="mx-3.5 mt-4 mb-2">
                <Typography
                  variant="small"
                  color={sidenavType === "dark" ? "white" : "blue-gray"}
                  className="font-black uppercase opacity-75"
                >
                  {title}
                </Typography>
              </li>
            )}
            {pages.map((page) => renderPageItem(page, layout)).filter(Boolean)}
          </ul>
        ))}
      </div>

      {/* User Info & Logout */}
      <div className="p-2 border-t border-blue-gray-100">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3">
            <Avatar
              src={user?.avatar || "/img/noimage.jpg"}
              alt={user?.name}
              size="sm"
              className="border border-blue-gray-100"
            />
            <div>
              <Typography variant="small" className="font-medium text-blue-gray-700">
                {user?.name || "User"}
              </Typography>
              <Typography variant="small" className="text-xs text-blue-gray-500 capitalize">
                {user?.role}
              </Typography>
            </div>
          </div>
          <IconButton
            variant="text"
            color="red"
            size="sm"
            onClick={LogoutUser}
            disabled={isLoggingOut}
            className="hover:bg-red-50 transition-colors"
          >
            <PowerIcon className={`h-5 w-5 ${isLoggingOut ? 'animate-spin' : ''}`} />
          </IconButton>
        </div>
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/pattern.png",
  brandName: "OffersPay Dashboard",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidenav.jsx";

export default Sidenav;