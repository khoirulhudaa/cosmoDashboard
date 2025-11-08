// src/views/admin/profile/components/Banner.tsx
import Card from "components/card";
import { MdEdit } from "react-icons/md";

interface BannerProps {
  onUpdate: () => void;
}

const Banner: React.FC<BannerProps> = ({ onUpdate }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <Card extra="w-full p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
            {user.name || "User"}
          </h2>
          <p className="text-sm text-gray-600">{user.email || "email@domain.com"}</p>
        </div>
        {/* <button
          onClick={onUpdate}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 transition-colors"
        >
          <MdEdit className="h-4 w-4" />
          Edit Profil
        </button> */}
      </div>
    </Card>
  );
};

export default Banner;