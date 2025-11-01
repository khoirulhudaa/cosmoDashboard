// src/views/admin/pengaduan/index.tsx
import Card from "components/card";
import Widget from "components/widget/Widget";
import React, { useEffect, useMemo, useState } from "react";
import { MdAdd, MdCancel, MdCheckCircle, MdDelete, MdEdit, MdPending, MdReport, MdSearch } from "react-icons/md";

type Pengaduan = {
  id: string;
  nik: string;
  nama: string;
  judul: string;
  isi: string;
  status: "Menunggu" | "Diproses" | "Selesai" | "Ditolak";
  tanggalLapor: string;
  tanggalSelesai?: string;
};

const PengaduanPage: React.FC = () => {
  const [pengaduanList, setPengaduanList] = useState<Pengaduan[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTanggal, setFilterTanggal] = useState(""); // Hanya satu tanggal
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Pengaduan | null>(null);

  const [form, setForm] = useState({
    nik: "",
    judul: "",
    isi: "",
    status: "Menunggu" as Pengaduan["status"],
  });

  // Load dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pengaduanList");
    if (saved && JSON.parse(saved).length > 0) {
      setPengaduanList(JSON.parse(saved));
    } else {
      const ktpData = localStorage.getItem("dataKTP");
      if (!ktpData) {
        const dummyKTP = [
          { nik: "3275010101900001", nama: "Ahmad Subardi", alamat: "Jl. Cempaka No. 1" },
          { nik: "3275010202850002", nama: "Siti Nurhaliza", alamat: "Jl. Melati No. 5" },
          { nik: "3275010303800003", nama: "Rudi Hartono", alamat: "Jl. Anggrek No. 10" },
        ];
        localStorage.setItem("dataKTP", JSON.stringify(dummyKTP));
      }

      const dummyPengaduan: Pengaduan[] = [
        {
          id: "1",
          nik: "3275010101900001",
          nama: "Ahmad Subardi",
          judul: "Jalan Rusak di Depan Rumah",
          isi: "Jalan depan rumah saya berlubang dan sangat berbahaya bagi anak-anak. Mohon segera diperbaiki.",
          status: "Diproses",
          tanggalLapor: "2025-10-25",
        },
        {
          id: "2",
          nik: "3275010202850002",
          nama: "Siti Nurhaliza",
          judul: "Lampu Jalan Mati",
          isi: "Lampu jalan di gang sebelah rumah sudah 3 hari mati. Malam hari sangat gelap dan rawan kecelakaan.",
          status: "Menunggu",
          tanggalLapor: "2025-10-28",
        },
        {
          id: "3",
          nik: "3275010303800003",
          nama: "Rudi Hartono",
          judul: "Sampah Menumpuk di Pojok Gang",
          isi: "Sampah sudah 1 minggu tidak diangkut. Bau dan lalat mulai mengganggu. Tolong segera ditangani.",
          status: "Selesai",
          tanggalLapor: "2025-10-20",
          tanggalSelesai: "2025-10-23",
        },
      ];
      setPengaduanList(dummyPengaduan);
    }
  }, []);

  // Simpan ke localStorage
  useEffect(() => {
    localStorage.setItem("pengaduanList", JSON.stringify(pengaduanList));
  }, [pengaduanList]);

  // Ambil nama dari NIK
  const getNamaFromNIK = (nik: string): string => {
    const ktpData = localStorage.getItem("dataKTP");
    if (!ktpData) return "Tidak Diketahui";
    const ktpList = JSON.parse(ktpData);
    const warga = ktpList.find((k: any) => k.nik === nik);
    return warga?.nama || "Tidak Diketahui";
  };

  // Filter: Search + Status + Tanggal (satu tanggal)
  const filteredData = useMemo(() => {
    return pengaduanList
      .filter((item) => {
        const matchesSearch =
          item.nik.includes(search) ||
          item.nama.toLowerCase().includes(search.toLowerCase()) ||
          item.judul.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = filterStatus === "all" || item.status === filterStatus;

        const matchesTanggal = !filterTanggal || item.tanggalLapor === filterTanggal;

        return matchesSearch && matchesStatus && matchesTanggal;
      })
      .sort((a, b) => new Date(b.tanggalLapor).getTime() - new Date(a.tanggalLapor).getTime());
  }, [pengaduanList, search, filterStatus, filterTanggal]);

  // Statistik
  const stats = useMemo(() => {
    const total = pengaduanList.length;
    const menunggu = pengaduanList.filter((p) => p.status === "Menunggu").length;
    const diproses = pengaduanList.filter((p) => p.status === "Diproses").length;
    const selesai = pengaduanList.filter((p) => p.status === "Selesai").length;
    const ditolak = pengaduanList.filter((p) => p.status === "Ditolak").length;
    return { total, menunggu, diproses, selesai, ditolak };
  }, [pengaduanList]);

  // Handle submit
  const handleSubmit = () => {
    if (!form.nik || !form.judul || !form.isi) {
      alert("NIK, Judul, dan Isi Pengaduan wajib diisi!");
      return;
    }

    const nama = getNamaFromNIK(form.nik);
    if (nama === "Tidak Diketahui") {
      alert("NIK tidak ditemukan di Data KTP. Pastikan warga sudah terdaftar.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    if (editItem) {
      setPengaduanList((prev) =>
        prev.map((item) =>
          item.id === editItem.id
            ? {
                ...item,
                ...form,
                nama,
                tanggalSelesai: form.status === "Selesai" && !item.tanggalSelesai ? today : item.tanggalSelesai,
              }
            : item
        )
      );
    } else {
      const newItem: Pengaduan = {
        id: Date.now().toString(),
        nik: form.nik,
        judul: form.judul,
        isi: form.isi,
        status: form.status,
        nama,
        tanggalLapor: today,
      };
      setPengaduanList((prev) => [...prev, newItem]);
    }

    resetModal();
  };

  const resetModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({ nik: "", judul: "", isi: "", status: "Menunggu" });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Hapus pengaduan ini?")) {
      setPengaduanList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const openEdit = (item: Pengaduan) => {
    setEditItem(item);
    setForm({
      nik: item.nik,
      judul: item.judul,
      isi: item.isi,
      status: item.status,
    });
    setShowModal(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div>
      {/* Widget Summary */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        <Widget icon={<MdReport className="h-7 w-7" />} title="Total" subtitle={stats.total.toString()} />
        <Widget icon={<MdPending className="h-7 w-7 text-yellow-500" />} title="Menunggu" subtitle={stats.menunggu.toString()} />
        <Widget icon={<MdPending className="h-7 w-7 text-blue-500" />} title="Diproses" subtitle={stats.diproses.toString()} />
        <Widget icon={<MdCheckCircle className="h-7 w-7 text-green-500" />} title="Selesai" subtitle={stats.selesai.toString()} />
        <Widget icon={<MdCancel className="h-7 w-7 text-red-500" />} title="Ditolak" subtitle={stats.ditolak.toString()} />
      </div>

      {/* Header + Tambah */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 ml-[1px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
            <MdReport className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">Kelola Pengaduan Warga</h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
        >
          <MdAdd className="h-5 w-5" />
          Tambah Pengaduan
        </button>
      </div>

      {/* Filter: Search + Status + Tanggal */}
      <div className="mt-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          {/* Search */}
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari NIK, nama, atau judul..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
            />
          </div>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-48 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-navy-700 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
          >
            <option value="all">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditolak">Ditolak</option>
          </select>

          {/* Filter Tanggal + Reset */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Tanggal Pengaduan
              </label>
              <input
                type="date"
                value={filterTanggal}
                onChange={(e) => setFilterTanggal(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilterTanggal("")}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600 whitespace-nowrap"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        </div>

      {/* Tabel */}
      <div className="mt-5">
        <Card extra="w-full p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-navy-600">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">TANGGAL</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">NIK</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">NAMA</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">JUDUL</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">STATUS</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                      Belum ada pengaduan yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-navy-700">
                      <td className="px-4 py-3 text-xs font-mono">{formatDate(item.tanggalLapor)}</td>
                      <td className="px-4 py-3 font-mono text-sm">{item.nik}</td>
                      <td className="px-4 py-3 font-medium text-navy-700 dark:text-white">{item.nama}</td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate" title={item.judul}>
                        {item.judul}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            item.status === "Menunggu"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                              : item.status === "Diproses"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              : item.status === "Selesai"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {item.status === "Menunggu" && <MdPending className="h-3 w-3" />}
                          {item.status === "Diproses" && <MdPending className="h-3 w-3" />}
                          {item.status === "Selesai" && <MdCheckCircle className="h-3 w-3" />}
                          {item.status === "Ditolak" && <MdCancel className="h-3 w-3" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(item)} className="text-blue-500 hover:text-blue-700 transition-colors">
                            <MdEdit className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 transition-colors">
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
          <Card extra="relative w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              {editItem ? "Edit" : "Tambah"} Pengaduan
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">NIK</label>
                <input
                  type="text"
                  value={form.nik}
                  onChange={(e) => setForm({ ...form, nik: e.target.value })}
                  placeholder="3275010101900001"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Nama: <strong>{getNamaFromNIK(form.nik)}</strong>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Judul Pengaduan</label>
                <input
                  type="text"
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  placeholder="Jalan rusak di depan rumah"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Isi Pengaduan</label>
                <textarea
                  value={form.isi}
                  onChange={(e) => setForm({ ...form, isi: e.target.value })}
                  rows={4}
                  placeholder="Tolong perbaiki jalan..."
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
              {editItem && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Pengaduan["status"] })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  >
                    <option value="Menunggu">Menunggu</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={resetModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white dark:hover:bg-navy-700"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.nik || !form.judul || !form.isi}
                className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editItem ? "Simpan" : "Lapor"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PengaduanPage;