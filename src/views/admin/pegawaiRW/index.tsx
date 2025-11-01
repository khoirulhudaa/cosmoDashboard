import React, { useState, useEffect, useMemo } from "react";
import Widget from "components/widget/Widget";
import Card from "components/card";
import { MdPeople, MdAdd, MdEdit, MdDelete, MdSearch, MdPhone, MdEmail, MdUpload } from "react-icons/md";

type PegawaiRW = {
  id: string;
  nama: string;
  jabatan: string;
  telepon: string;
  email: string;
  aktif: boolean;
  fotoUrl?: string; // base64
  fotoName?: string;
  fotoType?: string;
};

const PegawaiRWPage: React.FC = () => {
  const [pegawaiList, setPegawaiList] = useState<PegawaiRW[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<PegawaiRW | null>(null);
  const [form, setForm] = useState({
    nama: "",
    jabatan: "",
    telepon: "",
    email: "",
    aktif: true,
  });
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  // Load dari localStorage atau gunakan data dummy jika kosong
  useEffect(() => {
    const saved = localStorage.getItem("pegawaiRWList");
    if (saved && JSON.parse(saved).length > 0) {
      setPegawaiList(JSON.parse(saved));
    } else {
      const dummyData: PegawaiRW[] = [
        {
          id: "1",
          nama: "H. Ahmad Subardi",
          jabatan: "Ketua RW",
          telepon: "081234567890",
          email: "ahmad.subardi@rw001.com",
          aktif: true,
          fotoUrl: "/pria1.jpg", // Pria
        },
        {
          id: "2",
          nama: "M. Rudi Hartono",
          jabatan: "Sekretaris RW",
          telepon: "082345678901",
          email: "rudi.hartono@rw001.com",
          aktif: true,
          fotoUrl: "/pria2.jpg", // Pria
        },
        {
          id: "3",
          nama: "Drs. Slamet Riyadi",
          jabatan: "Bendahara RW",
          telepon: "083456789012",
          email: "slamet.riyadi@rw001.com",
          aktif: false,
          fotoUrl: "/pria1.jpg", // Pria
        },
      ];
      setPegawaiList(dummyData);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pegawaiRWList", JSON.stringify(pegawaiList));
  }, [pegawaiList]);

  const filteredData = useMemo(() => {
    return pegawaiList.filter((item) =>
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.jabatan.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [pegawaiList, search]);

  const handleFileChange = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File terlalu besar! Maksimal 5MB.");
      return;
    }
    setFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!form.nama.trim() || !form.jabatan.trim()) {
      alert("Nama dan jabatan wajib diisi!");
      return;
    }

    const newItem: PegawaiRW = {
      id: editItem?.id || Date.now().toString(),
      nama: form.nama,
      jabatan: form.jabatan,
      telepon: form.telepon,
      email: form.email,
      aktif: form.aktif,
      fotoUrl: fotoUrl || editItem?.fotoUrl,
      fotoName: fotoFile?.name || editItem?.fotoName,
      fotoType: fotoFile?.type || editItem?.fotoType,
    };

    if (editItem) {
      setPegawaiList((prev) => prev.map((i) => (i.id === editItem.id ? newItem : i)));
    } else {
      setPegawaiList((prev) => [...prev, newItem]);
    }

    resetForm();
  };

  const resetForm = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({ nama: "", jabatan: "", telepon: "", email: "", aktif: true });
    setFotoFile(null);
    setFotoUrl(null);
  };

  const openEdit = (item: PegawaiRW) => {
    setEditItem(item);
    setForm({
      nama: item.nama,
      jabatan: item.jabatan,
      telepon: item.telepon,
      email: item.email,
      aktif: item.aktif,
    });
    setFotoUrl(item.fotoUrl || null);
    setShowModal(true);
  };

  return (
    <div>
      {/* Widget */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-2">
        <Widget icon={<MdPeople className="h-7 w-7" />} title="Total Pegawai" subtitle={pegawaiList.length.toString()} />
        <Widget icon={<MdPeople className="h-7 w-7" />} title="Aktif" subtitle={pegawaiList.filter((b) => b.aktif).length.toString()} />
      </div>

      {/* Header */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 ml-[1px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
            <MdPeople className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">Kelola Pegawai RW</h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-white hover:shadow-lg transform hover:scale-105 transition-all"
        >
          <MdAdd className="h-5 w-5" />
          Tambah Pegawai
        </button>
      </div>

      {/* Search */}
      <div className="mt-5">
        <div className="relative">
          <MdSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, jabatan, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white"
          />
        </div>
      </div>

      {/* CARD GRID */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {filteredData.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-500">
            <MdPeople className="mx-auto h-16 w-16 text-gray-300 mb-3" />
            <p>Belum ada pegawai RW.</p>
          </div>
        ) : (
          filteredData.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-navy-800 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`h-2 ${item.aktif ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-gray-400 to-gray-600"}`} />

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {item.fotoUrl ? (
                      <img src={item.fotoUrl} alt={item.nama} className="h-12 w-12 rounded-md object-cover shadow-md" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-navy-700 flex items-center justify-center">
                        <MdPeople className="h-7 w-7 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-lg font-bold text-navy-700 dark:text-white">{item.nama}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{item.jabatan}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300">
                      <MdEdit className="h-4 w-4" />
                    </button>
                    <button onClick={() => { if (window.confirm("Hapus pegawai ini?")) setPegawaiList(prev => prev.filter(i => i.id !== item.id)); }} className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300">
                      <MdDelete className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {item.telepon && (
                    <p className="flex items-center gap-2">
                      <MdPhone className="h-4 w-4 text-green-600" />
                      {item.telepon}
                    </p>
                  )}
                  {item.email && (
                    <p className="flex items-center gap-2">
                      <MdEmail className="h-4 w-4 text-blue-600" />
                      {item.email}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-navy-600">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${item.aktif ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}>
                    {item.aktif ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        {/* OVERLAY GELAP + BLUR */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={resetForm}
          />
          <Card extra="w-full max-w-lg p-6 rounded-2xl shadow-2xl bg-white dark:bg-navy-800">
            <h3 className="mb-5 text-xl font-bold text-navy-700 dark:text-white">
              {editItem ? "Edit" : "Tambah"} Pegawai RW
            </h3>

            {/* Upload Foto */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Foto Pegawai (Opsional)</label>
              <div
                className="border-2 border-dashed border-gray-300 dark:border-navy-600 rounded-xl p-6 text-center cursor-pointer hover:border-brand-500 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFileChange(file); }}
                onClick={() => document.getElementById("fotoRWInput")?.click()}
              >
                {fotoUrl ? (
                  <div className="space-y-3">
                    <img src={fotoUrl} alt="Preview" className="mx-auto h-32 w-32 rounded-full object-cover shadow-md" />
                    <button onClick={(e) => { e.stopPropagation(); setFotoFile(null); setFotoUrl(null); }} className="text-red-600 text-sm hover:underline">
                      Hapus Foto
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <MdUpload className="mx-auto h-12 w-12 mb-2" />
                    <p className="text-sm">Klik atau drag foto ke sini</p>
                    <p className="text-xs mt-1">Max 5MB</p>
                  </div>
                )}
                <input id="fotoRWInput" type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileChange(file); }} />
              </div>
            </div>

            <div className="space-y-4">
              <input placeholder="Nama Lengkap" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
              <input placeholder="Jabatan" value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
              <input placeholder="Telepon" value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
              <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.aktif} onChange={(e) => setForm({ ...form, aktif: e.target.checked })} className="h-5 w-5 rounded border-gray-300 text-brand-500" />
                <span className="text-sm font-medium">Aktif</span>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={resetForm} className="rounded-xl border border-gray-300 px-5 py-2.5 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white font-medium transition-colors">Batal</button>
              <button onClick={handleSubmit} className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-white font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all">Simpan</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PegawaiRWPage;