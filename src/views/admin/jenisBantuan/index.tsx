import Card from "components/card";
import React, { useEffect, useMemo, useState } from "react";
import { MdAdd, MdCategory, MdDelete, MdEdit, MdSearch } from "react-icons/md";

// === TIPE DATA ===
type JenisBantuan = {
  id: string;
  nama: string;
  deskripsi: string;
  aktif: boolean;
};

// === KOMPONEN UTAMA ===
const JenisBantuanPage: React.FC = () => {
  const [jenisList, setJenisList] = useState<JenisBantuan[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<JenisBantuan | null>(null);

  const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    aktif: true,
  });

  // Load dari localStorage
 // Load dari localStorage atau gunakan data dummy jika kosong
useEffect(() => {
  const saved = localStorage.getItem("jenisBantuanList");
  if (saved && JSON.parse(saved).length > 0) {
    setJenisList(JSON.parse(saved));
  } else {
    // Data dummy jika belum ada
    const dummyData: JenisBantuan[] = [
      {
        id: "1",
        nama: "Bantuan Pangan",
        deskripsi: "Bantuan berupa sembako, beras, minyak, dan kebutuhan pokok lainnya untuk warga kurang mampu.",
        aktif: true,
      },
      {
        id: "2",
        nama: "Bantuan Kesehatan",
        deskripsi: "Bantuan berupa obat-obatan, biaya rumah sakit, atau alat kesehatan untuk warga sakit.",
        aktif: false,
      },
    ];
    setJenisList(dummyData);
  }
}, []);

  // Save ke localStorage
  useEffect(() => {
    localStorage.setItem("jenisBantuanList", JSON.stringify(jenisList));
  }, [jenisList]);

  // Filter data
  const filteredData = useMemo(() => {
    return jenisList.filter((item) =>
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(search.toLowerCase())
    );
  }, [jenisList, search]);

  // Handle submit
  const handleSubmit = () => {
    if (!form.nama.trim()) {
      alert("Nama jenis bantuan wajib diisi!");
      return;
    }

    if (editItem) {
      setJenisList((prev) =>
        prev.map((item) =>
          item.id === editItem.id
            ? { ...item, ...form }
            : item
        )
      );
    } else {
      const newItem: JenisBantuan = {
        id: Date.now().toString(),
        nama: form.nama,
        deskripsi: form.deskripsi,
        aktif: form.aktif,
      };
      setJenisList((prev) => [...prev, newItem]);
    }

    setShowModal(false);
    setEditItem(null);
    setForm({ nama: "", deskripsi: "", aktif: true });
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (window.confirm("Hapus jenis bantuan ini?")) {
      setJenisList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Open edit
  const openEdit = (item: JenisBantuan) => {
    setEditItem(item);
    setForm({
      nama: item.nama,
      deskripsi: item.deskripsi,
      aktif: item.aktif,
    });
    setShowModal(true);
  };

  return (
    <div>
      {/* Header + Tombol Tambah */}
      <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 ml-[1px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
            <MdCategory className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">Kelola Jenis Bantuan</h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
        >
          <MdAdd className="h-5 w-5" />
          Tambah Jenis
        </button>
      </div>

      {/* Search */}
      <div className="mt-5">
        <div className="relative">
          <MdSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
          />
        </div>
      </div>

      {/* Tabel Manual */}
      <div className="mt-5">
        <Card extra="w-full p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-navy-600">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">NAMA</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">DESKRIPSI</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">STATUS</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                      Belum ada jenis bantuan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-navy-700">
                      <td className="px-4 py-3 font-medium text-navy-700 dark:text-white">{item.nama}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.deskripsi || "-"}</td>
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
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit"
                          >
                            <MdEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700"
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
          {/* OVERLAY GELAP + BLUR */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setShowModal(false);
              setEditItem(null);
              setForm({ nama: "", deskripsi: "", aktif: true });
            }}
          />
          <Card extra="w-full max-w-md p-6">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              {editItem ? "Edit" : "Tambah"} Jenis Bantuan
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Jenis</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Contoh: Bantuan Pangan"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  placeholder="Jelaskan jenis bantuan ini..."
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="aktif"
                  checked={form.aktif}
                  onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <label htmlFor="aktif" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Aktif (bisa dipilih di form penerima)
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditItem(null);
                  setForm({ nama: "", deskripsi: "", aktif: true });
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.nama.trim()}
                className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {editItem ? "Simpan" : "Tambah"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default JenisBantuanPage;