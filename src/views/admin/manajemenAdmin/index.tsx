import Card from "components/card";
import Widget from "components/widget/Widget";
import React, { useEffect, useMemo, useState } from "react";
import { MdAdd, MdDelete, MdEdit, MdPeople, MdPerson, MdSearch } from "react-icons/md";

type Role =
  | "Superadmin"
  | "Ketua RW"
  | "Sekretaris RW"
  | "Ketua Kader"
  | "Sekretaris Kader"
  | "Ketua RT"
  | "Sekretaris RT";

interface Admin {
  id: string;
  nama: string;
  email: string;
  noHp: string;
  role: Role;
  aktif: boolean;
}

const roleOptions: { value: Role; label: string }[] = [
  { value: "Superadmin", label: "Superadmin" },
  { value: "Ketua RW", label: "Ketua RW" },
  { value: "Sekretaris RW", label: "Sekretaris RW" },
  { value: "Ketua Kader", label: "Ketua Kader" },
  { value: "Sekretaris Kader", label: "Sekretaris Kader" },
  { value: "Ketua RT", label: "Ketua RT" },
  { value: "Sekretaris RT", label: "Sekretaris RT" },
];

const AdminPage: React.FC = () => {
  const [adminList, setAdminList] = useState<Admin[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Admin | null>(null);
  const [form, setForm] = useState({
    nama: "",
    email: "",
    noHp: "",
    role: "Ketua RT" as Role,
    aktif: true,
  });

  // Load dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("adminList");
    if (saved && JSON.parse(saved).length > 0) {
      setAdminList(JSON.parse(saved));
    } else {
      const dummyData: Admin[] = [
        {
          id: "1",
          nama: "Ahmad Fauzi",
          email: "ahmad@rw01.com",
          noHp: "081234567890",
          role: "Superadmin",
          aktif: true,
        },
        {
          id: "2",
          nama: "Siti Nurhaliza",
          email: "siti.rt02@rw01.com",
          noHp: "085678901234",
          role: "Ketua RT",
          aktif: false,
        },
      ];
      setAdminList(dummyData);
    }
  }, []);

  // Simpan ke localStorage
  useEffect(() => {
    localStorage.setItem("adminList", JSON.stringify(adminList));
  }, [adminList]);

  // Filter pencarian
  const filteredData = useMemo(() => {
    return adminList.filter(
      (item) =>
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.role.toLowerCase().includes(search.toLowerCase())
    );
  }, [adminList, search]);

  // Submit form
  const handleSubmit = () => {
    if (!form.nama.trim() || !form.email.trim()) {
      alert("Nama dan Email wajib diisi!");
      return;
    }

    if (editItem) {
      setAdminList((prev) =>
        prev.map((item) =>
          item.id === editItem.id ? { ...item, ...form } : item
        )
      );
    } else {
      const newAdmin: Admin = {
        id: Date.now().toString(),
        ...form,
      };
      setAdminList((prev) => [...prev, newAdmin]);
    }

    closeModal();
  };

  // Hapus admin
  const handleDelete = (id: string) => {
    if (window.confirm("Hapus admin ini?")) {
      setAdminList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Buka modal edit
  const openEdit = (item: Admin) => {
    setEditItem(item);
    setForm({
      nama: item.nama,
      email: item.email,
      noHp: item.noHp,
      role: item.role,
      aktif: item.aktif,
    });
    setShowModal(true);
  };

  // Tutup modal
  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({
      nama: "",
      email: "",
      noHp: "",
      role: "Ketua RT",
      aktif: true,
    });
  };

  return (
    <div>
      {/* Widget Statistik */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4">
        <Widget
          icon={<MdPeople className="h-7 w-7" />}
          title="Total Admin"
          subtitle={adminList.length.toString()}
        />
        <Widget
          icon={<MdPeople className="h-7 w-7" />}
          title="Aktif"
          subtitle={adminList.filter((a) => a.aktif).length.toString()}
        />
        <Widget
          icon={<MdPeople className="h-7 w-7" />}
          title="Nonaktif"
          subtitle={adminList.filter((a) => !a.aktif).length.toString()}
        />
        <Widget
          icon={<MdPerson className="h-7 w-7" />}
          title="Superadmin"
          subtitle={adminList.filter((a) => a.role === "Superadmin").length.toString()}
        />
      </div>

      {/* Header + Tombol Tambah */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
            <MdPeople className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">
            Kelola Admin Data
          </h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 transition-colors"
        >
          <MdAdd className="h-5 w-5" />
          Tambah Admin
        </button>
      </div>

      {/* Pencarian */}
      <div className="mt-5">
        <div className="relative">
          <MdSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, email, atau role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white"
          />
        </div>
      </div>

      {/* Tabel Data */}
      <div className="mt-5">
        <Card extra="w-full p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-navy-600">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">
                    NAMA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">
                    EMAIL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">
                    NO. HP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">
                    ROLE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">
                    STATUS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">
                    AKSI
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-gray-500"
                    >
                      Belum ada admin terdaftar.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-700/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-navy-700 dark:text-white">
                        {item.nama}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {item.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {item.noHp || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                                ["Superadmin", "Ketua RW", "Ketua Kader", "Ketua RT"].includes(item.role)
                                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            }`}
                            >
                            {item.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            item.aktif
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {item.aktif ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Edit"
                          >
                            <MdEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Hapus"
                          >
                            <MdDelete className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <Card extra="w-full max-w-md p-6 relative">
            <h3 className="mb-5 text-xl font-bold text-navy-700 dark:text-white">
              {editItem ? "Edit" : "Tambah"} Admin
            </h3>

            <div className="space-y-4">
              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  placeholder="contoh@email.com"
                />
              </div>

              {/* No HP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  No. HP (Opsional)
                </label>
                <input
                  type="text"
                  value={form.noHp}
                  onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  placeholder="08123456789"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Aktif */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="aktif"
                  checked={form.aktif}
                  onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <label htmlFor="aktif" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Aktif (bisa login)
                </label>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white dark:hover:bg-navy-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.nama.trim() || !form.email.trim()}
                className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editItem ? "Simpan Perubahan" : "Tambah Admin"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPage;