// src/views/admin/profile/components/General.tsx
import React from "react";
import Card from "components/card";

type User = {
  id: number;
  email: string;
  name: string;
  role: "ADMIN" | "SUPER_ADMIN";
};

const General: React.FC = () => {
  const rawUser = localStorage.getItem("user");
  const user: User | null = rawUser ? JSON.parse(rawUser) : null;

  // Jika tidak ada user, fallback ke data dummy
  const currentUser: User = user || {
    id: 1,
    email: "superadmin@cosmo.com",
    name: "Super Administrator",
    role: "SUPER_ADMIN",
  };

  const isSuperAdmin = currentUser.role === "SUPER_ADMIN";

  return (
    <Card extra="w-full h-full p-3">
      <div className="mt-2 mb-8 w-full">
        <h4 className="px-2 text-xl font-bold text-navy-700 dark:text-white">
          Informasi {isSuperAdmin ? "Super Admin" : "Admin"}
        </h4>
        <p className="mt-2 px-2 text-base text-gray-600">
          Data identitas dan peran pengguna sistem.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 px-2 md:grid-cols-2">
        {/* Nama Lengkap */}
        <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 border border-black/30 dark:!bg-navy-700 dark:border-navy-600">
          <p className="text-sm text-gray-600">Nama Lengkap</p>
          <p className="text-base font-medium text-navy-700 dark:text-white">
            {currentUser.name}
          </p>
        </div>

        {/* Email */}
        <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 border border-black/30 dark:!bg-navy-700 dark:border-navy-600">
          <p className="text-sm text-gray-600">Email</p>
          <p className="text-base font-mono text-navy-700 dark:text-white">
            {currentUser.email}
          </p>
        </div>

        {/* Role */}
        <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 border border-black/30 dark:!bg-navy-700 dark:border-navy-600">
          <p className="text-sm text-gray-600">Role</p>
          <span
            className={`inline-block w-max rounded-full px-2.5 py-1 text-xs font-medium ${
              isSuperAdmin
                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            }`}
          >
            {isSuperAdmin ? "Super Admin" : "Admin"}
          </span>
        </div>

        {/* User ID */}
        <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 border border-black/30 dark:!bg-navy-700 dark:border-navy-600">
          <p className="text-sm text-gray-600">ID Pengguna</p>
          <p className="text-base font-mono text-navy-700 dark:text-white">
            #{currentUser.id}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default General;