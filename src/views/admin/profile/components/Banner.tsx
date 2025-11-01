// src/views/admin/profile/components/Banner.tsx
import React, { useState, useRef } from "react";
import Card from "components/card";
import banner from "assets/img/profile/banner.png";
import { MdEdit, MdCameraAlt } from "react-icons/md";

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

interface BannerProps {
  onUpdate: () => void;
}

const Banner: React.FC<BannerProps> = ({ onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<User>({
    role: "admin",
    nama: "",
    nik: "",
    rt: "",
    rw: "",
    kelurahan: "",
    provinsi: "",
    alamat: "",
    noTelp: "",
    foto: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ambil data dari localStorage
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
        provinsi: "Jawa Barat",
        alamat: "Jl. Merdeka No. 1",
        noTelp: "081234567890",
      };

  const isAdmin = defaultUser.role === "admin";

  // Buka modal
  const openEdit = () => {
    setForm(defaultUser);
    setShowModal(true);
  };

  // Upload foto
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, foto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Simpan
  const handleSave = () => {
    if (!form.nama.trim()) {
      alert("Nama wajib diisi!");
      return;
    }
    localStorage.setItem("currentUser", JSON.stringify(form));
    setShowModal(false);
    onUpdate();
  };

  // Hitung statistik
  const countWarga = () => {
    const ktp = JSON.parse(localStorage.getItem("dataKTP") || "[]");
    return ktp.filter((k: any) => k.rt === defaultUser.rt && k.rw === defaultUser.rw).length;
  };

  const countRTRW = () => {
    const kk = JSON.parse(localStorage.getItem("dataKK") || "[]");
    const rtSet = new Set(kk.map((k: any) => `${k.rt}-${k.rw}`));
    return rtSet.size;
  };

  return (
    <>
      <Card extra="items-center w-full h-full p-[16px] bg-cover relative">
        <button
          onClick={openEdit}
          className="absolute top-8 right-7 z-10 flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs text-black hover:brightness-[90%] active:scale-[0.98] duration-200 transition-colors"
        >
          <MdEdit className="h-4 w-4" />
          Edit Profile
        </button>

        {/* Background */}
        <div
          className="relative mt-1 flex h-32 w-full justify-center rounded-xl bg-cover"
          style={{ backgroundImage: `url(${banner})` }}
        >
          <div className="absolute -bottom-12 flex h-[87px] w-[87px] items-center justify-center rounded-full border-[4px] border-white bg-brand-500 dark:!border-navy-700 overflow-hidden">
            {defaultUser.foto ? (
              <img src={defaultUser.foto} alt="Foto Profil" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white backdrop-blur-sm">
                {defaultUser.nama.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Nama & Jabatan */}
        <div className="mt-16 flex flex-col items-center">
          <h4 className="text-xl font-bold text-navy-700 dark:text-white">{defaultUser.nama}</h4>
          <p className="text-base font-normal text-gray-600">
            {isAdmin ? `Ketua RT ${defaultUser.rt}/RW ${defaultUser.rw}` : "Lurah"}
          </p>
          {defaultUser.nik && (
            <p className="mt-1 text-xs font-mono text-gray-500">NIK: {defaultUser.nik}</p>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 mb-3 flex gap-8 md:!gap-14">
          {isAdmin ? (
            <>
              <div className="flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-navy-700 dark:text-white">{defaultUser.rt || "-"}</p>
                <p className="text-sm font-normal text-gray-600">RT</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-navy-700 dark:text-white">{defaultUser.rw || "-"}</p>
                <p className="text-sm font-normal text-gray-600">RW</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-navy-700 dark:text-white">{countWarga()}</p>
                <p className="text-sm font-normal text-gray-600">Warga</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-navy-700 dark:text-white">{defaultUser.kelurahan || "-"}</p>
                <p className="text-sm font-normal text-gray-600">Kelurahan</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-navy-700 dark:text-white">{defaultUser.provinsi || "-"}</p>
                <p className="text-sm font-normal text-gray-600">Provinsi</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-navy-700 dark:text-white">{countRTRW()}</p>
                <p className="text-sm font-normal text-gray-600">RT/RW</p>
              </div>
            </>
          )}
        </div>

        {/* Role Badge */}
        <div className="mt-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              isAdmin
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
            }`}
          >
            {isAdmin ? "Admin RT/RW" : "Super Admin (Lurah)"}
          </span>
        </div>
      </Card>

      {/* MODAL EDIT – SAMA UNTUK SEMUA ROLE */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">

          {/* OVERLAY GELAP + BLUR */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-[333] w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl dark:bg-navy-800 max-h-[90vh] overflow-y-auto">
            <h3 className="mb-6 text-xl font-bold text-navy-700 dark:text-white">Edit Profile</h3>

            {/* Foto Profil */}
            <div className="mb-6 flex flex-col items-center">
              <div className="relative">
                <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-lg">
                  {form.foto ? (
                    <img src={form.foto} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200 text-4xl font-bold text-gray-500">
                      {form.nama.charAt(0)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white shadow-md hover:bg-brand-600"
                >
                  <MdCameraAlt className="h-5 w-5" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                className="hidden"
              />
              <p className="mt-2 text-xs text-gray-500">Klik ikon kamera untuk ganti foto</p>
            </div>

            {/* FORM GRID 3 KOLOM */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {/* Nama Lengkap */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lengkap *</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  placeholder="Ahmad Fauzi"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "superadmin" })}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                >
                  <option value="admin">Admin RT/RW</option>
                  <option value="superadmin">Super Admin (Lurah)</option>
                </select>
              </div>

              {/* RT */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">RT</label>
                <input
                  type="text"
                  value={form.rt || ""}
                  onChange={(e) => setForm({ ...form, rt: e.target.value })}
                  placeholder="01"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>

              {/* RW */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">RW</label>
                <input
                  type="text"
                  value={form.rw || ""}
                  onChange={(e) => setForm({ ...form, rw: e.target.value })}
                  placeholder="001"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>

              {/* NIK */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">NIK</label>
                <input
                  type="text"
                  value={form.nik || ""}
                  onChange={(e) => setForm({ ...form, nik: e.target.value })}
                  placeholder="3275010101900001"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>

              {/* No. Telepon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">No. Telepon</label>
                <input
                  type="text"
                  value={form.noTelp || ""}
                  onChange={(e) => setForm({ ...form, noTelp: e.target.value })}
                  placeholder="081234567890"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>

              {/* Kelurahan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kelurahan</label>
                <input
                  type="text"
                  value={form.kelurahan || ""}
                  onChange={(e) => setForm({ ...form, kelurahan: e.target.value })}
                  placeholder="Cihapit"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>

              {/* Provinsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Provinsi</label>
                <input
                  type="text"
                  value={form.provinsi || ""}
                  onChange={(e) => setForm({ ...form, provinsi: e.target.value })}
                  placeholder="Jawa Barat"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>

              {/* Alamat – Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alamat</label>
                <input
                  type="text"
                  value={form.alamat || ""}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  placeholder="Jl. Merdeka No. 1"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
            </div>

            {/* Tombol */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white dark:hover:bg-navy-700"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:opacity-50"
                disabled={!form.nama.trim()}
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Banner;