// src/views/admin/profile/components/General.tsx
import React from "react";
import Card from "components/card";

type User = {
  role: "admin" | "superadmin";
  nama: string;
  nik?: string;
  rt?: string;
  rw?: string;
  kelurahan?: string;
  provinsi?: string;
  alamat?: string;
  noTelp?: string;
  foto?: string;
};

const General: React.FC = () => {
  const rawUser = localStorage.getItem("currentUser");
  const user: User = rawUser ? JSON.parse(rawUser) : {};

  const defaultUser: User = user.role
    ? user
    : {
        role: "admin",
        nama: "Ahmad Fauzi",
        nik: "3275010101900001",
        rt: "01",
        rw: "001",
        kelurahan: "Cihapit",
        alamat: "Jl. Merdeka No. 1",
        noTelp: "081234567890",
      };

  const isAdmin = defaultUser.role === "admin";

  return (
    <Card extra="w-full h-full p-3">
      <div className="mt-2 mb-8 w-full">
        <h4 className="px-2 text-xl font-bold text-navy-700 dark:text-white">
          Informasi {isAdmin ? "RT/RW" : "Lurah"}
        </h4>
        <p className="mt-2 px-2 text-base text-gray-600">
          {isAdmin
            ? "Data identitas dan wilayah tanggung jawab RT/RW."
            : "Data identitas dan wilayah administrasi Lurah."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 px-2 md:grid-cols-2">
        <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 border border-black/30 dark:!bg-navy-700 dark:border-navy-600">
          <p className="text-sm text-gray-600">Nama Lengkap</p>
          <p className="text-base font-medium text-navy-700 dark:text-white">{defaultUser.nama}</p>
        </div>

        {defaultUser.nik && (
          <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 border border-black/30 dark:!bg-navy-700 dark:border-navy-600">
            <p className="text-sm text-gray-600">NIK</p>
            <p className="text-base font-mono text-navy-700 dark:text-white">{defaultUser.nik}</p>
          </div>
        )}

        {isAdmin ? (
          <>
            <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 border border-black/30 dark:!bg-navy-700 dark:border-navy-600">
              <p className="text-sm text-gray-600">RT</p>
              <p className="text-base font-medium text-navy-700 dark:text-white">{defaultUser.rt || "-"}</p>
            </div>
            <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 border border-black/30 dark:!bg-navy-700 dark:border-navy-600">
              <p className="text-sm text-gray-600">RW</p>
              <p className="text-base font-medium text-navy-700 dark:text-white">{defaultUser.rw || "-"}</p>
            </div>

            {/* NIK & No. Telp → Sejajar */}
            {defaultUser.nik && (
              <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 border border-black/30 dark:!bg-navy-700 dark:border-navy-600">
                <p className="text-sm text-gray-600">NIK</p>
                <p className="text-base font-mono text-navy-700 dark:text-white">{defaultUser.nik}</p>
              </div>
            )}
            {defaultUser.noTelp && (
              <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 border border-black/30 dark:!bg-navy-700 dark:border-navy-600">
                <p className="text-sm text-gray-600">No. Telepon</p>
                <p className="text-base font-medium text-navy-700 dark:text-white">{defaultUser.noTelp}</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 border border-black/30 dark:!bg-navy-700 dark:border-navy-600">
              <p className="text-sm text-gray-600">Kelurahan</p>
              <p className="text-base font-medium text-navy-700 dark:text-white">{defaultUser.kelurahan || "-"}</p>
            </div>
            {defaultUser.noTelp && (
              <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 border border-black/30 dark:!bg-navy-700 dark:border-navy-600">
                <p className="text-sm text-gray-600">No. Telepon</p>
                <p className="text-base font-medium text-navy-700 dark:text-white">{defaultUser.noTelp}</p>
              </div>
            )}
          </>
        )}

        {defaultUser.alamat && (
          <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 border border-black/30 dark:!bg-navy-700 dark:border-navy-600 md:col-span-2">
            <p className="text-sm text-gray-600">Alamat</p>
            <p className="text-base font-medium text-navy-700 dark:text-white">{defaultUser.alamat}</p>
          </div>
        )}

        {!isAdmin && defaultUser.provinsi && (
          <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 border border-black/30 dark:!bg-navy-700 dark:border-navy-600">
            <p className="text-sm text-gray-600">Provinsi</p>
            <p className="text-base font-medium text-navy-700 dark:text-white">{defaultUser.provinsi}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default General;