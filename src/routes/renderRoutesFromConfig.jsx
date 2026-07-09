// /src/routes/renderRoutesFromConfig.js
import GuardWrapper from "@/widgets/components/GuardWrapper";
import { Route, Navigate } from "react-router-dom";

/**
 * Recursively flattens and renders route config into <Route /> elements.
 * @param {Array} routes - Your full route config from routes.jsx
 * @returns JSX <Route /> list
 */
export const renderRoutesFromConfig = (routes) => {
  const allRoutes = [];

  const buildRoutes = (basePath = "", pages = []) => {
    pages.forEach((route) => {
      const fullPath = [basePath, route.path].join("/").replace(/\/+/g, "/");

      const wrappedElement = (
        <GuardWrapper guard={route.guard} roles={route.roles} permissions={route.permissions}>
          {route.element}
        </GuardWrapper>
      );

      if (route.element) {
        allRoutes.push(
          <Route key={fullPath} path={fullPath} element={wrappedElement} />
        );
      }

      if (route.pages) {
        buildRoutes(fullPath, route.pages);
      }
    });
  };

  routes.forEach(({ layout, pages }) => {
    if (layout === "dashboard") {
      buildRoutes("", pages);
    }
  });

  allRoutes.push(
    <Route key="fallback" path="*" element={<Navigate to="/dashboard/home" replace />} />
  );

  return allRoutes;
};

