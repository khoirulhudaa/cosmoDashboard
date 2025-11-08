import Dropdown from "components/dropdown";
import { Link } from "react-router-dom";

const Navbar = (props: {
  onOpenSidenav: () => void;
  brandText: string;
  secondary?: boolean | string;
}) => {

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <nav className="sticky border-b border-black/30 top-0 mb-4 z-40 flex flex-row flex-wrap items-center justify-between bg-white/10 px-2 h-[14vh] backdrop-blur-xl dark:bg-[#0b14374d]">
      <div className="ml-[6px]">
        <p className="shrink text-[20px] uppercase text-navy-700 dark:text-white">
          <Link
            to="#"
            className="font-bold capitalize hover:text-navy-700 dark:hover:text-white"
          >
            {"MANAJEMEN COSMO"}
          </Link>
        </p>
      </div>

      <div className="relative mt-[3px] flex h-[61px] w-max flex-grow items-center justify-around gap-2 rounded-full bg-white px-3 py-2 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none md:flex-grow-0 md:gap-1 xl:gap-2">
        <p className="border border-black/50 bg-brand-100/50 text-brand-800 rounded-full mr-2 py-2 px-3">{user.name}</p>
        <Dropdown
          button={
            <img
              className="h-10 w-10 border-2 cursor-pointer active:scale-[0.98] hover:brightness-95 border-brand-100 rounded-full"
              src={'/defaultProfile.png'}
              alt="Elon Musk"
            />
          }
          children={
            <div className="flex h-max pb-3 w-56 flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat shadow-xl dark:!bg-navy-700 dark:text-white dark:shadow-none">
              <div className="mt-3 ml-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    👋 Hey, Adela
                  </p>{" "}
                </div>
              </div>
              <div className="mt-3 h-px w-full bg-gray-200 dark:bg-white/20 " />

              <div className="mt-3 ml-4 flex flex-col">
                <a
                  href="/admin/profile"
                  className="text-sm text-gray-800 dark:text-white hover:dark:text-white"
                >
                  Profile Akun
                </a>
                <a
                  href="/auth/sign-in"
                  className="mt-3 text-sm font-medium text-red-500 hover:text-red-500"
                >
                  Log Out
                </a>
              </div>
            </div>
          }
          classNames={"py-2 top-8 -left-[180px] w-max"}
        />
      </div>
    </nav>
  );
};

export default Navbar;
