import { HiX } from "react-icons/hi";
import { MdPeople } from "react-icons/md";
import routes from "routes";
import Links from "./components/Links";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar = ({ open, onClose }: SidebarProps) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[21vw] max-w-full flex-col overflow-y-auto bg-white pb-10 shadow-2xl transition-transform duration-300 ease-in-out dark:bg-navy-800 dark:text-white xl:translate-x-0 xl:shadow-none ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Close Button (Mobile) */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 xl:hidden"
        aria-label="Tutup sidebar"
      >
        <HiX className="h-6 w-6 text-gray-600 dark:text-white" />
      </button>

      {/* Logo */}
      <div className="mx-auto border-b h-[15%] flex justify-start items-center border-black/50 w-[90%]">
        <div className="flex items-center gap-3 rounded-lg bg-white/70 px-3 backdrop-blur-sm dark:bg-navy-800/70">
          <div className="flex items-center justify-start rounded-md">
            <img src="/logo.jpg" className="w-[60%]" alt="logo-cosmo" />
          </div>
          {/* <h1 className="font-poppins text-xl font-bold uppercase text-navy-700 dark:text-white">
            COSMO <span className="font-medium"></span>
          </h1> */}
        </div>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 overflow-y-auto px-6 py-4">
        <Links routes={routes} />
      </nav>

    </aside>
  );
};

export default Sidebar;