import Card from "components/card";
import Widget from "components/widget/Widget";
import React, { useEffect, useMemo, useState } from "react";
import { MdAdd, MdCheck, MdDelete, MdEdit, MdHourglassEmpty, MdMail, MdSearch } from "react-icons/md";

// === TIPE DATA ===
type StatusPengajuan = "Menunggu" | "Diproses" | "Disetujui" | "Ditolak";

type PengajuanSurat = {
  id: string;
  noPengajuan: string;
  namaWarga: string;
  nik: string;
  jenisSurat: string;
  keterangan: string;
  tanggalPengajuan: string;
  status: StatusPengajuan;
  catatanAdmin?: string;
};

// Daftar jenis surat (bisa diambil dari localStorage atau API)
const JENIS_SURAT_LIST = [
  "Surat Keterangan Domisili",
  "Surat Keterangan Usaha",
  "Surat Keterangan Tidak Mampu (SKTM)",
  "Surat Keterangan Kelahiran",
  "Surat Keterangan Kematian",
  "Surat Keterangan Ahli Waris",
  "Surat Pengantar SKCK",
  "Surat Pengantar Nikah",
  "Surat Pengantar untuk instansi lain",
  "Surat Pengantar Legalisasi",
  "Surat Izin Rame-rame",
  "Surat Permohonan",
];

// === KOMPONEN UTAMA ===
const PengajuanSuratPage: React.FC = () => {
  const [pengajuanList, setPengajuanList] = useState<PengajuanSurat[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusPengajuan | "Semua">("Semua");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<PengajuanSurat | null>(null);
  const [showDetail, setShowDetail] = useState<PengajuanSurat | null>(null);

  const [form, setForm] = useState({
    namaWarga: "",
    nik: "",
    jenisSurat: JENIS_SURAT_LIST[0],
    keterangan: "",
  });

  // Load dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pengajuanSuratList");
    if (saved && JSON.parse(saved).length > 0) {
      setPengajuanList(JSON.parse(saved));
    } else {
      // Dummy data
      const dummy: PengajuanSurat[] = [
        {
          id: "1",
          noPengajuan: "SURAT-2025-001",
          namaWarga: "Budi Santoso",
          nik: "3275012345678901",
          jenisSurat: "Surat Keterangan Domisili",
          keterangan: "Untuk pendaftaran sekolah anak",
          tanggalPengajuan: "2025-10-30",
          status: "Diproses",
          catatanAdmin: "Dokumen lengkap, sedang diproses",
        },
        {
          id: "2",
          noPengajuan: "SURAT-2025-002",
          namaWarga: "Siti Aminah",
          nik: "3275019876543210",
          jenisSurat: "Surat Pengantar SKCK",
          keterangan: "Untuk melamar pekerjaan",
          tanggalPengajuan: "2025-10-29",
          status: "Menunggu",
        },
      ];
      setPengajuanList(dummy);
    }
  }, []);

  // Save ke localStorage
  useEffect(() => {
    localStorage.setItem("pengajuanSuratList", JSON.stringify(pengajuanList));
  }, [pengajuanList]);

  // Generate nomor pengajuan otomatis
  const generateNoPengajuan = () => {
    const year = new Date().getFullYear();
    const count = pengajuanList.length + 1;
    return `SURAT-${year}-${count.toString().padStart(3, "0")}`;
  };

  // Filter data
  const filteredData = useMemo(() => {
    return pengajuanList.filter((item) => {
      const matchesSearch =
        item.namaWarga.toLowerCase().includes(search.toLowerCase()) ||
        item.nik.includes(search) ||
        item.noPengajuan.includes(search) ||
        item.jenisSurat.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === "Semua" || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [pengajuanList, search, filterStatus]);

  // Handle submit pengajuan baru
  const handleSubmit = () => {
    if (!form.namaWarga.trim() || !form.nik.trim()) {
      alert("Nama dan NIK wajib diisi!");
      return;
    }

    const newPengajuan: PengajuanSurat = {
      id: Date.now().toString(),
      noPengajuan: generateNoPengajuan(),
      namaWarga: form.namaWarga,
      nik: form.nik,
      jenisSurat: form.jenisSurat,
      keterangan: form.keterangan,
      tanggalPengajuan: new Date().toISOString().split("T")[0],
      status: "Menunggu",
    };

    setPengajuanList((prev) => [...prev, newPengajuan]);
    setShowModal(false);
    setForm({ namaWarga: "", nik: "", jenisSurat: JENIS_SURAT_LIST[0], keterangan: "" });
  };

  // Update status
  const updateStatus = (id: string, status: StatusPengajuan, catatan?: string) => {
    setPengajuanList((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status, catatanAdmin: catatan || item.catatanAdmin }
          : item
      )
    );
  };

  // Hapus pengajuan
  const handleDelete = (id: string) => {
    if (window.confirm("Hapus pengajuan ini?")) {
      setPengajuanList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Widget
  const stats = useMemo(() => {
    return {
      total: pengajuanList.length,
      menunggu: pengajuanList.filter((p) => p.status === "Menunggu").length,
      diproses: pengajuanList.filter((p) => p.status === "Diproses").length,
      selesai: pengajuanList.filter((p) => p.status === "Disetujui" || p.status === "Ditolak").length,
    };
  }, [pengajuanList]);

  return (
    <div>
      {/* Widget Summary */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4">
        <Widget
          icon={<MdMail className="h-7 w-7" />}
          title="Total Pengajuan"
          subtitle={stats.total.toString()}
        />
        <Widget
          icon={<MdHourglassEmpty className="h-7 w-7" />}
          title="Menunggu"
          subtitle={stats.menunggu.toString()}
        />
        <Widget
          icon={<MdEdit className="h-7 w-7" />}
          title="Diproses"
          subtitle={stats.diproses.toString()}
        />
        <Widget
          icon={<MdCheck className="h-7 w-7" />}
          title="Selesai"
          subtitle={stats.selesai.toString()}
        />
      </div>

      {/* Header + Tombol Ajukan */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 ml-[1px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
            <MdMail className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">
            Pengajuan Surat Warga
          </h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
        >
          <MdAdd className="h-5 w-5" />
          Ajukan Surat
        </button>
      </div>

      {/* Search + Filter */}
      <div className="mt-5 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, NIK, no pengajuan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
        >
          <option value="Semua">Semua Status</option>
          <option value="Menunggu">Menunggu</option>
          <option value="Diproses">Diproses</option>
          <option value="Disetujui">Disetujui</option>
          <option value="Ditolak">Ditolak</option>
        </select>
      </div>

      {/* Tabel */}
      <div className="mt-5">
        <Card extra="w-full p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-navy-600">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">
                    NO PENGAJUAN
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">
                    WARGA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">
                    JENIS SURAT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">
                    TANGGAL
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
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                      Belum ada pengajuan surat.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-navy-700">
                      <td className="px-4 py-3 font-medium text-navy-700 dark:text-white">
                        {item.noPengajuan}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <div className="font-medium">{item.namaWarga}</div>
                          <div className="text-xs text-gray-500">{item.nik}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {item.jenisSurat}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {item.tanggalPengajuan}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            item.status === "Menunggu"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                              : item.status === "Diproses"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              : item.status === "Disetujui"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setShowDetail(item)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Lihat Detail"
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

      {/* Modal Ajukan Surat */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowModal(false);
              setForm({ namaWarga: "", nik: "", jenisSurat: JENIS_SURAT_LIST[0], keterangan: "" });
            }}
          />
          <Card extra="w-full max-w-md p-6">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              Ajukan Surat Baru
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={form.namaWarga}
                  onChange={(e) => setForm({ ...form, namaWarga: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  NIK
                </label>
                <input
                  type="text"
                  value={form.nik}
                  onChange={(e) => setForm({ ...form, nik: e.target.value.replace(/\D/g, "").slice(0, 16) })}
                  placeholder="16 digit NIK"
                  maxLength={16}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Jenis Surat
                </label>
                <select
                  value={form.jenisSurat}
                  onChange={(e) => setForm({ ...form, jenisSurat: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                >
                  {JENIS_SURAT_LIST.map((jenis) => (
                    <option key={jenis} value={jenis}>
                      {jenis}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Keterangan (Opsional)
                </label>
                <textarea
                  value={form.keterangan}
                  onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  placeholder="Contoh: Untuk pendaftaran sekolah anak"
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setForm({ namaWarga: "", nik: "", jenisSurat: JENIS_SURAT_LIST[0], keterangan: "" });
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.namaWarga.trim() || !form.nik.trim()}
                className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:opacity-50"
              >
                Ajukan
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Detail & Update Status */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDetail(null)}
          />
          <Card extra="w-full max-w-lg p-6">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              Detail Pengajuan
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">No Pengajuan:</span> {showDetail.noPengajuan}
              </div>
              <div>
                <span className="font-medium">Nama:</span> {showDetail.namaWarga}
              </div>
              <div>
                <span className="font-medium">NIK:</span> {showDetail.nik}
              </div>
              <div>
                <span className="font-medium">Jenis Surat:</span> {showDetail.jenisSurat}
              </div>
              <div>
                <span className="font-medium">Tanggal:</span> {showDetail.tanggalPengajuan}
              </div>
              {showDetail.keterangan && (
                <div>
                  <span className="font-medium">Keterangan:</span> {showDetail.keterangan}
                </div>
              )}
              <div className="mt-4">
                <label className="block font-medium mb-1">Update Status</label>
                <div className="flex gap-2 flex-wrap">
                  {(["Menunggu", "Diproses", "Disetujui", "Ditolak"] as StatusPengajuan[]).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => {
                          if (status === "Ditolak") {
                            const alasan = prompt("Alasan penolakan:");
                            if (alasan) updateStatus(showDetail.id, status, alasan);
                          } else {
                            updateStatus(showDetail.id, status);
                          }
                          setShowDetail(null);
                        }}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          showDetail.status === status
                            ? "bg-brand-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-navy-600 dark:text-gray-300"
                        }`}
                      >
                        {status}
                      </button>
                    )
                  )}
                </div>
              </div>
              {showDetail.catatanAdmin && (
                <div className="mt-3 p-2 bg-gray-50 dark:bg-navy-700 rounded text-xs">
                  <span className="font-medium">Catatan:</span> {showDetail.catatanAdmin}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetail(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white"
              >
                Tutup
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PengajuanSuratPage;