// src/views/admin/profile/ProfileOverview.tsx
import Banner from "./components/Banner";
import General from "./components/General";
import { useEffect, useState } from "react";

const ProfileOverview = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;

  // === REDIRECT JIKA TIDAK ADA TOKEN ===
  useEffect(() => {
    if (!token || !user) {
      window.location.href = "/auth/sign-in";
    }
  }, [token, user]);

  const handleProfileUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex w-full flex-col gap-5">
      {/* Banner */}
      <div className="w-full flex h-fit flex-col gap-5 lg:grid lg:grid-cols-12">
        <div className="col-span-12 lg:!mb-0">
          <Banner key={`banner-${refreshKey}`} onUpdate={handleProfileUpdate} />
        </div>
      </div>

      {/* General Info */}
      <div className="grid h-full grid-cols-1 gap-5 lg:!grid-cols-12">
        <div className="col-span-5 lg:col-span-12 lg:mb-0 3xl:col-span-5">
          <General key={`general-${refreshKey}`} />
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;