import { Routes, Route, Navigate } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import { useAuth } from "@/pages/auth/authContext";
import PageNotFound from "@/widgets/components/PageNotFound";
import { ProtectedRoute } from "@/utils/roleUtils";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;
  const { user } = useAuth();

  const renderRoutes = (routesList) => {
    return routesList.flatMap(({ layout, pages }) => {
      if (layout === "dashboard") {
        return pages.flatMap((page) => {
          // Check if the page has nested pages
          if (page.pages) {
            // Add routes for nested pages with full path
            const subRoutes = page.pages.map((subPage) => (
              <Route 
                key={`${page.name}-${subPage.name}`}
                path={`${page.path}${subPage.path}`} 
                element={
                  <ProtectedRoute
                    element={subPage.element} 
                    roles={subPage.roles} 
                    guard={subPage.guard} 
                    user={user}
                  />
                }
              />
            ));

            return [...subRoutes];
          }
          // Regular route
          return (
            <Route 
              key={page.name}
              path={page.path} 
              element={
                <ProtectedRoute 
                  element={page.element} 
                  roles={page.roles} 
                  guard={page.guard} 
                  user={user}
                />
              }
            />
          );
        });
      }
      return [];
    });
  };

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav
        routes={routes}
        brandName="OffersPay Dashboard"
        brandImg={
          "/img/icon.png"
          // sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />
        {/* <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </IconButton> */}
        <Routes>
          {renderRoutes(routes)}
          {/* Default redirect for /dashboard to /dashboard/home */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute 
                element={<Navigate to="/dashboard/home" replace />} 
                roles={["admin", "manager"]} 
                guard="protected" 
                user={user}
              />
            } 
          />
          {/* Catch-all route for invalid dashboard paths */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        <div className="text-blue-gray-600">
          <Footer />
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;