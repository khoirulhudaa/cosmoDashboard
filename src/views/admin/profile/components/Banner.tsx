import Card from "components/card";

interface BannerProps {
  onUpdate: () => void;
}

const Banner: React.FC<BannerProps> = ({ onUpdate }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <Card extra="w-full p-6 rounded-[20px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
            {user.name || "User"}
          </h2>
          <p className="text-sm text-gray-600">{user.email || "email@domain.com"}</p>
        </div>
      </div>
    </Card>
  );
};

export default Banner;