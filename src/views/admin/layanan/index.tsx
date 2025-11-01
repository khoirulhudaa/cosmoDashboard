import Card from "components/card";
import Widget from "components/widget/Widget";
import React, { useEffect, useMemo, useState } from "react";
import { MdAdd, MdDelete, MdEdit, MdRoomService, MdSearch } from "react-icons/md";

type Layanan = {
  id: string;
  nama: string;
  deskripsi: string;
  thumbnail: string;
  aktif: boolean;
};

const LayananPage: React.FC = () => {
  const [layananList, setLayananList] = useState<Layanan[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Layanan | null>(null);
  const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    thumbnail: "",
    aktif: true,
  });
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Load dari localStorage atau gunakan data dummy jika kosong
  useEffect(() => {
    const saved = localStorage.getItem("layananList");
    if (saved && JSON.parse(saved).length > 0) {
      setLayananList(JSON.parse(saved));
    } else {
      // Data dummy jika belum ada
      const dummyData: Layanan[] = [
        {
          id: "1",
          nama: "Pengurusan KTP Baru",
          deskripsi: "Layanan pembuatan KTP elektronik untuk warga baru atau yang belum memiliki KTP.",
          thumbnail: "https://via.placeholder.com/400x200/10b981/ffffff?text=Pengurusan+KTP",
          aktif: true,
        },
        {
          id: "2",
          nama: "Surat Keterangan Domisili",
          deskripsi: "Penerbitan surat keterangan domisili untuk keperluan administrasi, sekolah, atau pekerjaan.",
          thumbnail: "https://via.placeholder.com/400x200/6b7280/ffffff?text=Surat+Domisili",
          aktif: false,
        },
      ];
      setLayananList(dummyData);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("layananList", JSON.stringify(layananList));
  }, [layananList]);

  const filteredData = useMemo(() => {
    return layananList.filter((item) =>
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(search.toLowerCase())
    );
  }, [layananList, search]);

  const handleSubmit = () => {
    if (!form.nama.trim()) {
      alert("Nama layanan wajib diisi!");
      return;
    }

    if (editItem) {
      setLayananList((prev) =>
        prev.map((item) =>
          item.id === editItem.id
            ? { ...item, ...form }
            : item
        )
      );
    } else {
      const newItem: Layanan = {
        id: Date.now().toString(),
        nama: form.nama,
        deskripsi: form.deskripsi,
        thumbnail: thumbnailFile ? URL.createObjectURL(thumbnailFile) : form.thumbnail,
        aktif: form.aktif,
      };
      setLayananList((prev) => [...prev, newItem]);
    }

    setShowModal(false);
    setEditItem(null);
    setForm({ nama: "", deskripsi: "", thumbnail: "", aktif: true });
    setThumbnailPreview("");
    setThumbnailFile(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Hapus layanan ini?")) {
      setLayananList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const openEdit = (item: Layanan) => {
    setEditItem(item);
    setForm({
      nama: item.nama,
      deskripsi: item.deskripsi,
      thumbnail: item.thumbnail,
      aktif: item.aktif,
    });
    setThumbnailPreview(item.thumbnail);
    setShowModal(true);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const preview = URL.createObjectURL(file);
      setThumbnailPreview(preview);
      setForm({ ...form, thumbnail: preview });
    }
  };

  return (
    <div>
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3">
        <Widget icon={<MdRoomService className="h-7 w-7" />} title="Total Layanan" subtitle={layananList.length.toString()} />
        <Widget icon={<MdRoomService className="h-7 w-7" />} title="Aktif" subtitle={layananList.filter((b) => b.aktif).length.toString()} />
        <Widget icon={<MdRoomService className="h-7 w-7" />} title="Nonaktif" subtitle={layananList.filter((b) => !b.aktif).length.toString()} />
      </div>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 ml-[1px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
            <MdRoomService className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">Kelola Layanan</h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
        >
          <MdAdd className="h-5 w-5" />
          Tambah Layanan
        </button>
      </div>

      <div className="mt-5">
        <div className="relative">
          <MdSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau deskripsi layanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
          />
        </div>
      </div>

      <div className="mt-5">
        <Card extra="w-full p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] table-auto">
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
                      Belum ada layanan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-navy-700">
                      <td className="px-4 py-3 font-medium text-navy-700 dark:text-white">{item.nama}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[300px] truncate">{item.deskripsi || "-"}</td>
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
                          <button onClick={() => openEdit(item)} className="text-blue-500 hover:text-blue-700" title="Edit">
                            <MdEdit className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700" title="Hapus">
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        {/* OVERLAY GELAP + BLUR */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
                setShowModal(false);
                setEditItem(null);
                setForm({ nama: "", deskripsi: "", thumbnail: "", aktif: true });
                setThumbnailPreview("");
                setThumbnailFile(null);
            }}
          />
          <Card extra="w-full max-w-lg p-6">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              {editItem ? "Edit" : "Tambah"} Layanan
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Layanan</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
                {thumbnailPreview && (
                  <div className="mt-2">
                    <img src={thumbnailPreview} alt="Preview" className="h-32 w-full object-cover rounded-lg" />
                  </div>
                )}
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
                  Aktif (ditampilkan di website)
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditItem(null);
                  setForm({ nama: "", deskripsi: "", thumbnail: "", aktif: true });
                  setThumbnailPreview("");
                  setThumbnailFile(null);
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

export default LayananPage;