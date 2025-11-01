// src/layouts/admin/index.tsx
import Footer from "components/footer/Footer";
import Navbar from "components/navbar";
import Sidebar from "components/sidebar";
import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import routes from "routes";

export default function Admin(props: { [x: string]: any }) {
  const { ...rest } = props;
  const location = useLocation();
  const [open, setOpen] = React.useState(true);
  const [currentRoute] = React.useState("Main Dashboard");

  React.useEffect(() => {
    const handleResize = () => {
      // Auto-collapse jika lebar < 1200px (termasuk saat zoom)
      if (window.innerWidth < 1200) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    getActiveRoute(routes);
  }, [location.pathname]);

  const getActiveRoute = (routes: RoutesType[]): string => {
    for (let i = 0; i < routes.length; i++) {
      if (window.location.href.indexOf(routes[i].layout + "/" + routes[i].path) !== -1) {
        return routes[i].name;
      }
    }
    return "Main Dashboard";
  };

  const getActiveNavbar = (routes: RoutesType[]): boolean => {
    for (let i = 0; i < routes.length; i++) {
      if (window.location.href.indexOf(routes[i].layout + "/" + routes[i].path) !== -1) {
        return routes[i].secondary || false;
      }
    }
    return false;
  };

  const getRoutes = (routes: any[]): any[] => {
    const routeElements: any[] = [];

    const traverse = (route: any, parentKey = "") => {
      const key = `${parentKey}-${route.path}`;
      if (route.layout === "/admin" && route.component) {
        routeElements.push(
          <Route path={`/${route.path}`} element={route.component} key={key} />
        );
      }
      if (route.subRoutes?.length) {
        route.subRoutes.forEach((sub: any) => traverse(sub, key));
      }
    };

    routes.forEach((route) => traverse(route));
    return routeElements;
  };

  document.documentElement.dir = "ltr";

  return (
    <div className="flex h-full w-full">
      {/* SIDEBAR */}
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* MAIN CONTENT */}
      <div className="h-full w-full bg-lightPrimary dark:!bg-navy-900 flex-1">
        <main
          className={`
            mx-3 h-full px-2 flex-none transition-all duration-200
            ${open ? "xl:ml-[21vw]" : "xl:ml-0"}
          `}
        >
          <div className="h-full flex flex-col">
            {/* Navbar */}
            <Navbar
              onOpenSidenav={() => setOpen(true)}
              brandText={currentRoute}
              secondary={getActiveNavbar(routes)}
              {...rest}
            />

            {/* Content */}
            <div className="flex-1 mx-auto w-full max-w-full p-2 md:p-4">
              <Routes>
                {getRoutes(routes)}
                <Route path="/" element={<Navigate to="/admin/default" replace />} />
              </Routes>
            </div>

            {/* Footer */}
            <div className="p-3">
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}