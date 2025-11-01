import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import Card from "components/card";
import Widget from "components/widget/Widget";
import React, { useEffect, useMemo, useState } from "react";
import { MdAdd, MdArticle, MdDelete, MdEdit, MdSearch } from "react-icons/md";

type Berita = {
  id: string;
  judul: string;
  isi: string;
  thumbnail: string;
  tanggal: string;
  aktif: boolean;
};

const BeritaPage: React.FC = () => {
  const [beritaList, setBeritaList] = useState<Berita[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Berita | null>(null);
  const [form, setForm] = useState({
    judul: "",
    isi: "",
    thumbnail: "",
    aktif: true,
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Load dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("beritaList");
    if (saved && JSON.parse(saved).length > 0) {
      setBeritaList(JSON.parse(saved));
    } else {
      const dummyData: Berita[] = [
        {
          id: "1",
          judul: "Pembukaan Posko Bantuan Banjir RW 001",
          isi: "<p>Dalam rangka penanganan banjir yang melanda wilayah RW 001, kami membuka posko bantuan di Balai RW. Warga diimbau untuk melapor jika membutuhkan bantuan pangan atau tempat pengungsian sementara.</p>",
          thumbnail: "https://via.placeholder.com/600x300/ef4444/ffffff?text=Posko+Bantuan+Banjir",
          tanggal: "2025-10-20",
          aktif: true,
        },
        {
          id: "2",
          judul: "Jadwal Gotong Royong Mingguan",
          isi: "<p>Setiap Sabtu pukul 07.00 WIB, seluruh warga RW 001 diharapkan ikut serta dalam kegiatan gotong royong membersihkan lingkungan. Mari jaga kebersihan dan keindahan kampung kita bersama.</p>",
          thumbnail: "https://via.placeholder.com/600x300/10b981/ffffff?text=Gotong+Royong",
          tanggal: "2025-10-18",
          aktif: false,
        },
      ];
      setBeritaList(dummyData);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("beritaList", JSON.stringify(beritaList));
  }, [beritaList]);

  const filteredData = useMemo(() => {
    return beritaList.filter((item) =>
      item.judul.toLowerCase().includes(search.toLowerCase()) ||
      item.isi.toLowerCase().replace(/<[^>]*>/g, "").includes(search.toLowerCase())
    );
  }, [beritaList, search]);

  const handleSubmit = () => {
    if (!form.judul.trim() || !form.isi.trim()) {
      alert("Judul dan isi berita wajib diisi!");
      return;
    }

    if (editItem) {
      setBeritaList((prev) =>
        prev.map((item) =>
          item.id === editItem.id
            ? {
                ...item,
                ...form,
                tanggal: new Date().toISOString().split("T")[0],
              }
            : item
        )
      );
    } else {
      const newItem: Berita = {
        id: Date.now().toString(),
        judul: form.judul,
        isi: form.isi,
        thumbnail: thumbnailFile ? URL.createObjectURL(thumbnailFile) : form.thumbnail,
        tanggal: new Date().toISOString().split("T")[0],
        aktif: form.aktif,
      };
      setBeritaList((prev) => [...prev, newItem]);
    }

    resetModal();
  };

  const resetModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({ judul: "", isi: "", thumbnail: "", aktif: true });
    setThumbnailFile(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Hapus berita ini?")) {
      setBeritaList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const openEdit = (item: Berita) => {
    setEditItem(item);
    setForm({
      judul: item.judul,
      isi: item.isi,
      thumbnail: item.thumbnail,
      aktif: item.aktif,
    });
    setThumbnailFile(null);
    setShowModal(true);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setForm({ ...form, thumbnail: URL.createObjectURL(file) });
    }
  };

  return (
    <div>
      {/* Widget Stats */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3">
        <Widget icon={<MdArticle className="h-7 w-7" />} title="Total Berita" subtitle={beritaList.length.toString()} />
        <Widget icon={<MdArticle className="h-7 w-7" />} title="Aktif" subtitle={beritaList.filter((b) => b.aktif).length.toString()} />
        <Widget icon={<MdArticle className="h-7 w-7" />} title="Nonaktif" subtitle={beritaList.filter((b) => !b.aktif).length.toString()} />
      </div>

      {/* Header + Tambah Button */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 ml-[1px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
            <MdArticle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">Kelola Berita</h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
        >
          <MdAdd className="h-5 w-5" />
          Tambah Berita
        </button>
      </div>

      {/* Search */}
      <div className="mt-5">
        <div className="relative">
          <MdSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari judul atau isi berita..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-5">
        <Card extra="w-full p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-navy-600">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">JUDUL</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">TANGGAL</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">STATUS</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                      Belum ada berita.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-navy-700">
                      <td className="px-4 py-3 font-medium text-navy-700 dark:text-white max-w-[300px] truncate">
                        {item.judul}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.tanggal}</td>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={resetModal}
          />
          <Card extra="relative w-full max-w-[80vw] p-6">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              {editItem ? "Edit" : "Tambah"} Berita
            </h3>

            <div className="space-y-4">
              {/* Judul */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Judul Berita</label>
                <input
                  type="text"
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>

              {/* Isi Berita - CKEditor */}
              <div className="mt-1 border border-gray-300 rounded-lg dark:border-navy-600">
                <div className="ck-editor-container">
                  <CKEditor
                    editor={ClassicEditor as any}
                    data={form.isi}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setForm({ ...form, isi: data });
                    }}
                    config={{
                      toolbar: [
                        'heading', '|',
                        'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|',
                        'outdent', 'indent', '|',
                        'blockQuote', 'insertTable', 'mediaEmbed', 'undo', 'redo'
                      ],
                      removePlugins: ['Title']  // Tambahkan ini → fix React 19
                    }}
                  />
                </div>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-500 file:text-white hover:file:bg-brand-600"
                />
                {thumbnailFile && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    File terpilih: <span className="font-medium">{thumbnailFile.name}</span>
                  </p>
                )}
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
                  Aktif (ditampilkan di website)
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={resetModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.judul.trim() || !form.isi.trim()}
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

export default BeritaPage;