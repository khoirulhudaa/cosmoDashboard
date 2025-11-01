import { useState, useCallback, useMemo } from "react";
import { MdArrowDropDown, MdArrowDropUp } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import DashIcon from "components/icons/DashIcon";

interface Route {
  name: string;
  path: string;
  layout: string;
  icon?: React.ReactNode;
  subRoutes?: Route[];
}

interface LinksProps {
  routes: Route[];
}

const Links = ({ routes }: LinksProps) => {
  const location = useLocation();

  // Inisialisasi: semua submenu terbuka secara default
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    routes.forEach((r) => {
      if (r.subRoutes?.length) init[r.name] = true;
    });
    return init;
  });

  // Cek apakah route aktif
  const isActiveRoute = useCallback(
    (path: string) => location.pathname.includes(path),
    [location.pathname]
  );

  // Toggle submenu
  const toggleMenu = useCallback((name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  // Filter hanya layout yang diizinkan
  const filteredRoutes = useMemo(
    () =>
      routes.filter((route) =>
        ["/admin", "/auth", "/rtl"].includes(route.layout)
      ),
    [routes]
  );

  // Render rekursif menu
  const renderLinks = (items: Route[], depth = 0): JSX.Element[] => {
    return items
    .filter((route) => {
      return route.name && (route.icon || route.subRoutes?.length);
    })
    .map((route, idx) => {
      const key = `${depth}-${idx}`;
      const hasSub = !!route.subRoutes?.length;
      const isOpen = openMenus[route.name] ?? false;
      const isActive = isActiveRoute(route.path);

      if (hasSub) {
        return (
          <div key={key} className="mb-2">
            {/* Menu Header */}
            <button
              onClick={() => toggleMenu(route.name)}
              className={`
                flex w-full items-center rounded-md px-3 py-2 text-left transition-colors
                hover:bg-gray-100 dark:hover:bg-navy-700
                ${isActive ? "bg-gray-50 dark:bg-navy-700" : ""}
              `}
              aria-expanded={isOpen}
              aria-controls={`submenu-${key}`}
            >
              <span
                className={`${
                  isActive
                    ? "text-brand-500 dark:text-white"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {route.icon ?? <DashIcon />}
              </span>
              <span
                className={`
                  ml-3 flex-1 text-sm font-medium
                  ${isActive ? "text-navy-700 dark:text-white" : "text-gray-700 dark:text-gray-300"}
                `}
              >
                {route.name}
              </span>
              <span className="text-gray-500">
                {isOpen ? <MdArrowDropUp /> : <MdArrowDropDown />}
              </span>
            </button>

            {/* Submenu */}
            <div
              id={`submenu-${key}`}
              className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
              `}
            >
              <div className="ml-9 mt-1 space-y-1 border-l-2 border-gray-200 pl-4 dark:border-white/20">
                {renderLinks(route.subRoutes!, depth + 1)}
              </div>
            </div>
          </div>
        );
      }

      // Item tanpa submenu
      return (
        <Link
          key={key}
          to={`${route.layout}/${route.path}`}
          className="block"
        >
          <div
            className={`
              relative mb-4 border border-black/20 overflow-hidden backdrop-blur-2xl shadow-lg rounded-xl flex items-center px-3 py-3 pb-4 transition-colors
              hover:brightness-95
              ${isActive ? "bg-blue-100 dark:bg-navy-700 text-blue-800" : ""}
            `}
          >
            <span
              className={`${
                isActive
                  ? "text-brand-400 dark:text-white font-bold"
                  : "text-gray-600 dark:text-gray-400 font-medium"
              }`}
            >
              {route.icon ?? <DashIcon />}
            </span>
            <span
              className={`
                ml-4 text-sm
                ${isActive ? "font-bold text-navy-700 dark:text-white" : "font-medium text-gray-700 dark:text-gray-300"}
              `}
            >
              {route.name}
            </span>

            {/* Indikator aktif */}
            {isActive && (
              <div className="absolute right-0 top-0 h-full w-1 rounded-l-lg bg-brand-400" />
            )}
          </div>
        </Link>
      );
    });
  };

  return <ul className="space-y-1">{renderLinks(filteredRoutes)}</ul>;
};

export default Links;