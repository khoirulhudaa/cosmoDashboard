import Card from "components/card";
import Widget from "components/widget/Widget";
import React, { useEffect, useMemo, useState } from "react";
import { MdAdd, MdDelete, MdEdit, MdPeople, MdPerson, MdSearch } from "react-icons/md";

// Mapping role frontend ke backend
const roleMap: Record<string, string> = {
  admin: "ADMIN",
  superAdmin: "SUPER_ADMIN",
};

const reverseRoleMap: Record<string, string> = {
  ADMIN: "admin",
  SUPER_ADMIN: "superAdmin",
};

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "superAdmin", label: "Super Admin" },
];

interface Admin {
  id: string;
  nama: string;
  email: string;
  noHp?: string;
  role: string; // "admin" atau "superAdmin"
  aktif: boolean;
}

const API_BASE = "https://vr.kiraproject.id/api/admin/users";

const AdminPage: React.FC = () => {
  const [adminList, setAdminList] = useState<Admin[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nama: "",
    email: "",
    noHp: "",
    role: "admin" as string,
    aktif: true,
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;

  // === REDIRECT JIKA TIDAK ADA TOKEN ===
  useEffect(() => {
    if (!token || !user) {
      window.location.href = "/auth/sign-in";
    }
  }, [token, user]);

  // Fetch all admins
  const fetchAdmins = async () => {
    if (!token) {
      setError("Token tidak ditemukan. Silakan login.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map((item: any) => ({
          id: item.id.toString(),
          nama: item.name,
          email: item.email,
          noHp: item.phone || "",
          role: reverseRoleMap[item.role] || "admin",
          aktif: item.isActive,
        }));
        setAdminList(mapped);
      } else {
        setError(data.message || "Gagal mengambil data");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Filter pencarian
  const filteredData = useMemo(() => {
    return adminList.filter(
      (item) =>
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.role.toLowerCase().includes(search.toLowerCase())
    );
  }, [adminList, search]);

  // Submit form (Create / Update)
  const handleSubmit = async () => {
    if (!form.nama.trim() || !form.email.trim()) {
      alert("Nama dan Email wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      const url = editItem ? `${API_BASE}/${editItem.id}` : API_BASE;
      const method = editItem ? "PUT" : "POST";

      const body: any = {
        name: form.nama,
        role: roleMap[form.role],
        isActive: form.aktif,
      };

      if (!editItem) {
        body.email = form.email;
        body.password = "DefaultPass123!"; // Bisa diganti jadi input
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        await fetchAdmins();
        closeModal();
      } else {
        alert(result.message || "Gagal menyimpan data");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  // Hapus admin
  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus admin ini?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setAdminList((prev) => prev.filter((item) => item.id !== id));
      } else {
        const data = await res.json();
        alert(data.message || "Gagal menghapus");
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  // Buka modal edit
  const openEdit = (item: Admin) => {
    setEditItem(item);
    setForm({
      nama: item.nama,
      email: item.email,
      noHp: item.noHp || "",
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
      role: "admin",
      aktif: true,
    });
  };

  return (
    <div>
      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-sm">Memproses...</p>
          </div>
        </div>
      )}

      {/* Widget Statistik */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4">
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
          title="Super Admin"
          subtitle={adminList.filter((a) => a.role === "superAdmin").length.toString()}
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
                      {loading ? "Memuat data..." : "Belum ada admin terdaftar."}
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
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                            item.role === "superAdmin"
                              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          }`}
                        >
                          {item.role === "superAdmin" ? "Super Admin" : "Admin"}
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
                            disabled={loading}
                          >
                            <MdEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Hapus"
                            disabled={loading}
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
                  disabled={!!editItem}
                />
                {editItem && (
                  <p className="text-xs text-gray-500 mt-1">Email tidak bisa diubah</p>
                )}
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
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
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
                disabled={loading || !form.nama.trim() || (!editItem && !form.email.trim())}
                className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Menyimpan..." : editItem ? "Simpan Perubahan" : "Tambah Admin"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPage;