import Card from "components/card";
import Widget from "components/widget/Widget";
import React, { useEffect, useMemo, useState } from "react";
import {
  MdAccessibilityNew,
  MdAdd,
  MdArrowForwardIos,
  MdCamera,
  MdCheck,
  MdCheckCircle,
  MdChildCare,
  MdClose,
  MdDelete,
  MdDescription,
  MdEdit,
  MdElderly,
  MdFamilyRestroom,
  MdFemale,
  MdInfo,
  MdMale,
  MdPerson,
  MdSchool,
  MdSearch,
  MdUpload,
  MdWarning,
  MdZoomIn,
  MdSave,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";

type StatusAnggota = "Hidup" | "Meninggal" | "Pindah";

type Anggota = {
  id: string;
  nik: string;
  nama: string;
  jenisKelamin: "L" | "P";
  tempatLahir: string;
  tanggalLahir: string;
  statusKeluarga: string;
  pendidikan: string;
  pekerjaan: string;
  bantuan: string[];
  status: StatusAnggota;
  ktpUrl?: string;
  ktpName?: string;
  ktpType?: string;
  statusKawin: "Belum Kawin" | "Kawin" | "Cerai Hidup" | "Cerai Mati";
  agama: "Islam" | "Kristen" | "Katolik" | "Hindu" | "Buddha" | "Konghucu" | "Lainnya"; // ← BARU
  keterangan: string;
  kelengkapanArsipRT: string[];
  statusWarga: "Tetap" | "Tidak Tetap";
  yatim: boolean;
  piatu: boolean;
};

type KKItem = {
  id: string;
  noKK: string;
  kepalaKeluarga: string;
  alamat: string;
  rt: string;
  rw: string;
  anggota: Anggota[];
  isSementara?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
};

const DAFTAR_BANTUAN = [
  { id: "bst", nama: "BST", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  { id: "bpnt", nama: "BPNT", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  { id: "pkh", nama: "PKH", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  { id: "pip", nama: "PIP", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  { id: "kks", nama: "KKS", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
];

const ARSIP_RT = [
  "KTP", "KK", "Akta Lahir", "Akta Nikah", "Akta Cerai", "Surat Keterangan Domisili", "Surat Kematian"
];

// DATA DEMO LENGKAP DENGAN AGAMA
const DEMO_DATA: KKItem[] = [
  {
    id: "1",
    noKK: "3275010101900001",
    kepalaKeluarga: "Ahmad Fauzi",
    alamat: "Jl. Merdeka No. 10",
    rt: "01",
    rw: "001",
    isSementara: false,
    anggota: [
      {
        id: "a1",
        nik: "3275010101900001",
        nama: "Ahmad Fauzi",
        jenisKelamin: "L",
        tempatLahir: "Bandung",
        tanggalLahir: "1990-01-01",
        statusKeluarga: "Kepala Keluarga",
        pendidikan: "S1 Teknik Informatika",
        pekerjaan: "Programmer",
        bantuan: ["bst", "pkh"],
        status: "Hidup",
        statusKawin: "Kawin",
        agama: "Islam",
        keterangan: "Difabel rungu",
        kelengkapanArsipRT: ["KTP", "KK", "Akta Nikah", "Surat Keterangan Domisili"],
        statusWarga: "Tetap",
        yatim: false,
        piatu: false,
      },
      {
        id: "a2",
        nik: "3275014101950002",
        nama: "Siti Nurhaliza",
        jenisKelamin: "P",
        tempatLahir: "Bandung",
        tanggalLahir: "1995-04-14",
        statusKeluarga: "Istri",
        pendidikan: "S1 Akuntansi",
        pekerjaan: "Ibu Rumah Tangga",
        bantuan: ["bpnt"],
        status: "Hidup",
        statusKawin: "Kawin",
        agama: "Islam",
        keterangan: "Hamil 7 bulan",
        kelengkapanArsipRT: ["KTP", "KK", "Akta Nikah"],
        statusWarga: "Tetap",
        yatim: false,
        piatu: false,
      },
      {
        id: "a3",
        nik: "3275010101150003",
        nama: "Rizky Ahmad",
        jenisKelamin: "L",
        tempatLahir: "Bandung",
        tanggalLahir: "2015-03-20",
        statusKeluarga: "Anak",
        pendidikan: "SD",
        pekerjaan: "-",
        bantuan: ["pip"],
        status: "Hidup",
        statusKawin: "Belum Kawin",
        agama: "Islam",
        keterangan: "",
        kelengkapanArsipRT: ["KTP", "KK", "Akta Lahir"],
        statusWarga: "Tetap",
        yatim: true,
        piatu: false,
      },
      {
        id: "a4",
        nik: "3275010101600004",
        nama: "Budi Santoso",
        jenisKelamin: "L",
        tempatLahir: "Bandung",
        tanggalLahir: "1960-05-10",
        statusKeluarga: "Orang Tua",
        pendidikan: "SMA",
        pekerjaan: "Pensiunan",
        bantuan: [],
        status: "Meninggal",
        statusKawin: "Cerai Mati",
        agama: "Kristen",
        keterangan: "Meninggal 2023",
        kelengkapanArsipRT: ["KTP", "KK", "Surat Kematian"],
        statusWarga: "Tetap",
        yatim: false,
        piatu: false,
      },
    ],
  },
  {
    id: "2",
    noKK: "TEMP-001",
    kepalaKeluarga: "Budi Santoso",
    alamat: "Jl. Sudirman Gg. 5",
    rt: "02",
    rw: "003",
    isSementara: true,
    anggota: [
      {
        id: "a5",
        nik: "3275010202880003",
        nama: "Budi Santoso",
        jenisKelamin: "L",
        tempatLahir: "Jakarta",
        tanggalLahir: "1988-02-02",
        statusKeluarga: "Kepala Keluarga",
        pendidikan: "SMA",
        pekerjaan: "Sopir",
        bantuan: ["bst"],
        status: "Hidup",
        statusKawin: "Belum Kawin",
        agama: "Hindu",
        keterangan: "Warga kontrakan",
        kelengkapanArsipRT: ["KTP"],
        statusWarga: "Tidak Tetap",
        yatim: false,
        piatu: false,
      },
    ],
  },
];

const DataKK: React.FC = () => {
  const [kkFile, setKKFile] = useState<File | null>(null);
  const [kkFileUrl, setKKFileUrl] = useState<string | null>(null);
  const [kkList, setKKList] = useState<KKItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedKK, setSelectedKK] = useState<KKItem | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [ktpFileUrl, setKtpFileUrl] = useState<string | null>(null);
  const [showKKZoom, setShowKKZoom] = useState(false);
  const [showModalKK, setShowModalKK] = useState(false);
  const [editKK, setEditKK] = useState<KKItem | null>(null);
  const [showModalAnggota, setShowModalAnggota] = useState(false);
  const [editAnggota, setEditAnggota] = useState<Anggota | null>(null);
  const [showModalBantuan, setShowModalBantuan] = useState(false);
  const [selectedAnggota, setSelectedAnggota] = useState<Anggota | null>(null);
  const [filterNoKK, setFilterNoKK] = useState<string>("all");
  const [filterRT, setFilterRT] = useState<string>("all");
  
  const [formKK, setFormKK] = useState({
    noKK: "",
    kepalaKeluarga: "",
    alamat: "",
    rt: "",
    rw: "",
    isSementara: false,
  });

  const [formAnggota, setFormAnggota] = useState<Partial<Anggota>>({
    nik: "",
    nama: "",
    jenisKelamin: "L",
    tempatLahir: "",
    tanggalLahir: "",
    statusKeluarga: "Anak",
    pendidikan: "",
    pekerjaan: "",
    bantuan: [],
    status: "Hidup",
    statusKawin: "Belum Kawin",
    agama: "Islam",
    keterangan: "",
    kelengkapanArsipRT: [],
    statusWarga: "Tetap",
    yatim: false,
    piatu: false,
  });

  // Load & Save
  useEffect(() => {
    const saved = localStorage.getItem("dataKK");
    if (saved) {
      setKKList(JSON.parse(saved));
    } else {
      setKKList(DEMO_DATA);
      localStorage.setItem("dataKK", JSON.stringify(DEMO_DATA));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dataKK", JSON.stringify(kkList));
  }, [kkList]);

  const filteredData = useMemo(() => {
    let data = kkList;

    // Filter RT
    if (filterRT !== "all") {
      data = data.filter(k => k.rt === filterRT);
    }

    // Filter No KK
    if (filterNoKK !== "all") {
      data = data.filter(k => k.noKK === filterNoKK);
    }

    // Search
    if (search) {
      data = data.filter(
        (item) =>
          item.noKK.toLowerCase().includes(search.toLowerCase()) ||
          item.kepalaKeluarga.toLowerCase().includes(search.toLowerCase()) ||
          item.alamat.toLowerCase().includes(search.toLowerCase())
      );
    }

    return data;
  }, [kkList, search, filterNoKK, filterRT]);

  const hitungUsia = (tanggalLahir: string): number => {
    if (!tanggalLahir) return 0;
    const birth = new Date(tanggalLahir);
    const today = new Date();
    if (isNaN(birth.getTime())) return 0;
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age < 0 ? 0 : age;
  };

  const kelompokUsia = (usia: number) => {
    if (usia < 5) return { nama: "Balita", icon: <MdChildCare className="h-4 w-4" />, color: "text-pink-600" };
    if (usia < 13) return { nama: "Anak", icon: <MdChildCare className="h-4 w-4" />, color: "text-blue-600" };
    if (usia < 18) return { nama: "Remaja", icon: <MdSchool className="h-4 w-4" />, color: "text-green-600" };
    if (usia < 60) return { nama: "Dewasa", icon: <MdAccessibilityNew className="h-4 w-4" />, color: "text-indigo-600" };
    return { nama: "Lansia", icon: <MdElderly className="h-4 w-4" />, color: "text-gray-600" };
  };

  const getBantuanSummary = (kk: KKItem) => {
    const allBantuan = kk.anggota.flatMap(a => a.bantuan);
    const unique = [...new Set(allBantuan)];
    return unique.map(id => {
      const b = DAFTAR_BANTUAN.find(x => x.id === id)!;
      const count = allBantuan.filter(x => x === id).length;
      return { ...b, count };
    });
  };

  // === KK CRUD ===
  const handleSubmitKK = () => {
    if (!formKK.noKK.trim() || !formKK.kepalaKeluarga.trim() || !formKK.alamat.trim()) {
      alert("No KK, Kepala Keluarga, dan Alamat wajib diisi!");
      return;
    }

    const newKK: KKItem = {
      id: editKK?.id || Date.now().toString(),
      noKK: formKK.noKK.trim(),
      kepalaKeluarga: formKK.kepalaKeluarga.trim(),
      alamat: formKK.alamat.trim(),
      rt: formKK.rt,
      rw: formKK.rw,
      anggota: editKK?.anggota || [],
      isSementara: formKK.isSementara,
      fileUrl: kkFileUrl || editKK?.fileUrl,
      fileName: kkFile?.name || editKK?.fileName,
      fileType: kkFile?.type || editKK?.fileType,
    };

    if (editKK) {
      setKKList(prev => prev.map(i => (i.id === editKK.id ? newKK : i)));
      setSelectedKK(newKK);
    } else {
      setKKList(prev => [...prev, newKK]);
    }

    resetFormKK();
  };

  const resetFormKK = () => {
    setShowModalKK(false);
    setEditKK(null);
    setFormKK({ noKK: "", kepalaKeluarga: "", alamat: "", rt: "", rw: "", isSementara: false });
    setKKFile(null);
    setKKFileUrl(null);
  };

  const handleDeleteKK = (id: string) => {
    if (window.confirm("Hapus KK ini beserta semua anggota?")) {
      setKKList(prev => prev.filter(i => i.id !== id));
      if (selectedKK?.id === id) {
        setSelectedKK(null);
        setShowSidebar(false);
      }
    }
  };

  const openDetail = (kk: KKItem) => {
    const safeKK = {
      ...kk,
      anggota: Array.isArray(kk.anggota) ? kk.anggota : []
    };
    setSelectedKK(safeKK);
    setShowSidebar(true);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setTimeout(() => setSelectedKK(null), 300);
  };

  // === Anggota CRUD ===
  const openTambahAnggota = () => {
    setEditAnggota(null);
    setFormAnggota({
      nik: "",
      nama: "",
      jenisKelamin: "L",
      tempatLahir: "",
      tanggalLahir: "",
      statusKeluarga: "Anak",
      pendidikan: "",
      pekerjaan: "",
      bantuan: [],
      status: "Hidup",
      statusKawin: "Belum Kawin",
      agama: "Islam",
      keterangan: "",
      kelengkapanArsipRT: [],
      statusWarga: "Tetap",
      yatim: false,
      piatu: false,
    });
    setKtpFileUrl(null);
    setShowModalAnggota(true);
  };

  // const openEditAnggota = (anggota: Anggota) => {
  //   setEditAnggota(anggota);
  //   setFormAnggota({ ...anggota });
  //   setKtpFileUrl(anggota.ktpUrl || null);
  //   setShowModalAnggota(true);
  // };

  const navigate = useNavigate();
  const openEditAnggota = (anggota: Anggota) => {
    navigate(`/admin/anggota/edit/${anggota.id}`);
  };

  const handleSubmitAnggota = () => {
    if (!formAnggota.nik?.trim() || !formAnggota.nama?.trim()) {
      alert("NIK dan Nama wajib diisi!");
      return;
    }
    if (!selectedKK) return;

    const newAnggota: Anggota = {
      id: editAnggota?.id || Date.now().toString(),
      nik: formAnggota.nik!,
      nama: formAnggota.nama!,
      jenisKelamin: formAnggota.jenisKelamin!,
      tempatLahir: formAnggota.tempatLahir!,
      tanggalLahir: formAnggota.tanggalLahir!,
      statusKeluarga: formAnggota.statusKeluarga!,
      pendidikan: formAnggota.pendidikan!,
      pekerjaan: formAnggota.pekerjaan!,
      bantuan: formAnggota.bantuan || [],
      status: formAnggota.status!,
      ktpUrl: ktpFileUrl || editAnggota?.ktpUrl,
      ktpName: ktpFile?.name || editAnggota?.ktpName,
      ktpType: ktpFile?.type || editAnggota?.ktpType,
      statusKawin: formAnggota.statusKawin!,
      agama: formAnggota.agama!,
      keterangan: formAnggota.keterangan || "",
      kelengkapanArsipRT: formAnggota.kelengkapanArsipRT || [],
      statusWarga: formAnggota.statusWarga!,
      yatim: formAnggota.yatim || false,
      piatu: formAnggota.piatu || false,
    };

    const updatedKK = {
      ...selectedKK,
      anggota: editAnggota
        ? selectedKK.anggota.map(a => (a.id === editAnggota.id ? newAnggota : a))
        : [...selectedKK.anggota, newAnggota],
    };

    setKKList(prev => prev.map(k => (k.id === selectedKK.id ? updatedKK : k)));
    setSelectedKK(updatedKK);
    setShowModalAnggota(false);
    setEditAnggota(null);
    setKtpFile(null);
    setKtpFileUrl(null);
  };

  const handleDeleteAnggota = (anggotaId: string) => {
    if (!selectedKK || !window.confirm("Hapus anggota ini?")) return;
    const updated = {
      ...selectedKK,
      anggota: selectedKK.anggota.filter(a => a.id !== anggotaId),
    };
    setKKList(prev => prev.map(k => (k.id === selectedKK.id ? updated : k)));
    setSelectedKK(updated);
  };

  const openTagging = (anggota: Anggota) => {
    setSelectedAnggota(anggota);
    setFormAnggota(prev => ({ ...prev, bantuan: anggota.bantuan }));
    setShowModalBantuan(true);
  };

  const saveBantuan = () => {
    if (!selectedKK || !selectedAnggota) return;
    const updatedAnggota = { ...selectedAnggota, bantuan: formAnggota.bantuan || [] };
    const updatedKK = {
      ...selectedKK,
      anggota: selectedKK.anggota.map(a => (a.id === selectedAnggota.id ? updatedAnggota : a)),
    };
    setKKList(prev => prev.map(k => (k.id === selectedKK.id ? updatedKK : k)));
    setSelectedKK(updatedKK);
    setShowModalBantuan(false);
  };

  const handleFileChange = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File terlalu besar! Maksimal 5MB.");
      return;
    }
    setKKFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setKKFileUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleKtpChange = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File KTP terlalu besar! Maksimal 5MB.");
      return;
    }
    setKtpFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setKtpFileUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveAll = () => {
    alert("Semua perubahan berhasil disimpan ke localStorage!");
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowKKZoom(false);
      }
    };
    if (showKKZoom) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [showKKZoom]);

  // === DAFTAR RT YANG ADA ===
  const daftarRT = useMemo(() => {
    const rtSet = new Set<string>();
    kkList.forEach(kk => {
      if (kk.rt) rtSet.add(kk.rt);
    });
    return Array.from(rtSet).sort();
  }, [kkList]);

  return (
    <div className="relative min-h-screen">
      {/* Widget */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Widget icon={<MdFamilyRestroom className="h-7 w-7" />} title="Total KK" subtitle={kkList.length.toString()} />
        <Widget icon={<MdFamilyRestroom className="h-7 w-7" />} title="Resmi" subtitle={kkList.filter(k => !k.isSementara).length.toString()} />
        <Widget icon={<MdFamilyRestroom className="h-7 w-7" />} title="Sementara" subtitle={kkList.filter(k => k.isSementara).length.toString()} />
        <Widget icon={<MdPerson className="h-7 w-7" />} title="Total Anggota" subtitle={kkList.reduce((a, b) => a + b.anggota.length, 0).toString()} />
      </div>

      {/* Header + Filter + Simpan */}
        <div className="mt-8 bg-white p-4 rounded-3xl shadow flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filter RT */}
            <div>
              <label className="block font-medium mb-2 text-gray-700">Filter berdasarkan RT</label>
              <select
                value={filterRT}
                onChange={(e) => setFilterRT(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Semua RT</option>
                {daftarRT.map(rt => (
                  <option key={rt} value={rt}>RT {rt}</option>
                ))}
              </select>
            </div>

            {/* Filter No KK */}
            <div>
              <label className="block font-medium mb-2 text-gray-700">Filter berdasarkan No. KK</label>
              <select
                value={filterNoKK}
                onChange={(e) => setFilterNoKK(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Semua KK</option>
                {kkList.map((kk) => (
                  <option key={kk.noKK} value={kk.noKK}>
                    {kk.noKK} ({kk.alamat.split(",")[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tombol Simpan */}
          <button
            onClick={handleSaveAll}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 text-base font-medium shadow hover:bg-blue-700 transition whitespace-nowrap"
          >
            <MdSave /> Simpan Perubahan
          </button>
        </div>

      {/* Search */}
      <div className="mt-5">
        <div className="relative">
          <MdSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari No KK, nama, atau alamat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
          />
        </div>
      </div>

      {/* CARD LIST */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredData.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-500">
            <MdFamilyRestroom className="mx-auto h-16 w-16 text-gray-300 mb-3" />
            <p>Belum ada data KK.</p>
          </div>
        ) : (
          filteredData.map((item) => {
            const bantuanSummary = getBantuanSummary(item);
            const penerimaBantuan = item.anggota.filter(a => a.bantuan.length > 0).length;
            const hidup = item.anggota.filter(a => a.status === "Hidup").length;
            const meninggal = item.anggota.filter(a => a.status === "Meninggal").length;
            const yatimPiatu = item.anggota.filter(a => a.yatim || a.piatu).length;

            return (
              <div key={item.id} onClick={() => openDetail(item)} className="group relative overflow-hidden rounded-2xl bg-white dark:bg-navy-800 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className={`h-2 ${item.isSementara ? "bg-gradient-to-r from-orange-400 to-orange-600" : "bg-gradient-to-r from-brand-400 to-brand-600"}`} />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-navy-700 dark:text-white flex items-center gap-2">
                        {item.noKK}
                        {item.isSementara && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                            Sementara
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1"><strong>Kepala:</strong> {item.kepalaKeluarga}</p>
                    </div>
                    <MdArrowForwardIos className="h-5 w-5 text-gray-400 group-hover:text-brand-500 transition-colors" />
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <p className="flex items-center gap-2"><MdPerson className="h-4 w-4" /> {item.alamat}</p>
                    <p className="flex items-center gap-2"><MdCheckCircle className="h-4 w-4" /> RT {item.rt} / RW {item.rw}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {["Balita", "Anak", "Remaja", "Dewasa", "Lansia"].map(k => {
                      const count = item.anggota.filter(a => {
                        if (a.status !== "Hidup") return false;
                        const usia = hitungUsia(a.tanggalLahir);
                        if (k === "Balita") return usia < 5;
                        if (k === "Anak") return usia < 13;
                        if (k === "Remaja") return usia < 18;
                        if (k === "Dewasa") return usia < 60;
                        return usia >= 60;
                      }).length;
                      if (count === 0) return null;
                      const { icon, color } = kelompokUsia(k === "Balita" ? 3 : k === "Anak" ? 10 : k === "Remaja" ? 15 : k === "Dewasa" ? 30 : 70);
                      return (
                        <span key={k} className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`}>
                          {icon} {count} {k}
                        </span>
                      );
                    })}
                    {yatimPiatu > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        <MdInfo className="h-3 w-3" /> {yatimPiatu} Yatim/Piatu
                      </span>
                    )}
                  </div>

                  <div className="border-t border-gray-200 dark:border-navy-600 pt-3 mb-3">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">Bantuan: {penerimaBantuan} penerima</p>
                    {bantuanSummary.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">Tidak ada bantuan</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {bantuanSummary.map(b => (
                          <span key={b.id} className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${b.color}`}>
                            {b.nama} ×{b.count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1 text-green-600"><MdCheckCircle /> {hidup} Hidup</span>
                      {meninggal > 0 && <span className="flex items-center gap-1 text-red-600"><MdWarning /> {meninggal} Meninggal</span>}
                    </div>
                    <span className="font-bold text-brand-600 dark:text-brand-400">{item.anggota.length} anggota</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* === SIDEBAR DETAIL === */}
      <div className={`fixed right-0 top-0 h-full w-full md:w-[79vw] bg-white dark:bg-navy-800 shadow-2xl transform transition-transform duration-300 z-50 ${showSidebar ? "translate-x-0" : "translate-x-full"}`}>
        {selectedKK && (
          <div className="h-full overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-navy-700 dark:text-white">DETAIL KK - {selectedKK.noKK}</h3>
              <button onClick={closeSidebar} className="text-gray-500 hover:text-gray-700"><MdClose className="h-6 w-6" /></button>
            </div>

            {/* === PREVIEW FILE KK === */}
            {selectedKK.fileUrl ? (
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <MdDescription className="h-4 w-4" /> Dokumen KK
                </p>
                <div 
                  onClick={() => setShowKKZoom(true)}
                  className="group cursor-zoom-in rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-700 p-3 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-navy-800 border border-dashed border-gray-300 dark:border-navy-600 flex-shrink-0">
                      {selectedKK.fileType?.startsWith("image/") ? (
                        <img src={selectedKK.fileUrl} alt="KK" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <MdDescription className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-700 dark:text-white truncate">
                        {selectedKK.fileName || "Dokumen KK"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedKK.fileType?.includes("pdf") ? "PDF" : "Gambar"}
                      </p>
                    </div>
                    <MdZoomIn className="h-4 w-4 text-gray-400 group-hover:text-brand-500 transition-colors" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-5 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <MdWarning className="h-4 w-4" />
                  Belum ada dokumen KK.
                </p>
              </div>
            )}

            {/* === TOMBOL AKSI KK & TAMBAH ANGGOTA === */}
            <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-3 mb-6">
              <button
                onClick={() => {
                  setEditKK(selectedKK);
                  setFormKK({
                    noKK: selectedKK.noKK,
                    kepalaKeluarga: selectedKK.kepalaKeluarga,
                    alamat: selectedKK.alamat,
                    rt: selectedKK.rt,
                    rw: selectedKK.rw,
                    isSementara: selectedKK.isSementara || false,
                  });
                  setKKFileUrl(selectedKK.fileUrl || null);
                  setShowModalKK(true);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-brand-500 text-brand-500 py-2.5 text-xs font-medium hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
              >
                <MdEdit className="h-3.5 w-3.5" /> Edit KK
              </button>
              <button
                onClick={() => handleDeleteKK(selectedKK.id)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-500 text-red-500 py-2.5 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <MdDelete className="h-3.5 w-3.5" /> Hapus
              </button>
              <button
                onClick={openTambahAnggota}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 text-white py-2.5 text-sm font-medium hover:bg-brand-600 transition-colors shadow-sm"
              >
                <MdAdd className="h-4 w-4" /> Tambah Anggota
              </button>
            </div>

            {/* Daftar Anggota */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(!selectedKK.anggota || selectedKK.anggota.length === 0) ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <MdPerson className="mx-auto h-12 w-12 mb-2 text-gray-300" />
                  <p>Belum ada anggota keluarga.</p>
                  <button onClick={openTambahAnggota} className="mt-3 text-brand-500 hover:underline text-sm">
                    + Tambah anggota pertama
                  </button>
                </div>
              ) : (
                selectedKK.anggota.map(a => {
                  const usia = hitungUsia(a.tanggalLahir || "");
                  const { nama: kelUsia, icon: iconUsia, color: colorUsia } = kelompokUsia(usia);
                  return (
                    <div key={a.id} className={`rounded-xl border p-4 ${a.status === "Meninggal" ? "border-red-300 bg-red-100 dark:bg-red-900/20" : "border-gray-200 dark:border-navy-600"}`}>
                      {/* KTP Preview */}
                      {a.ktpUrl ? (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-navy-700 mb-4 rounded-lg">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">KTP:</p>
                          <div className="relative w-full h-[200px] rounded-md overflow-hidden bg-gray-100 dark:bg-navy-800 shadow-sm">
                            {a.ktpType?.startsWith("image/") ? (
                              <img src={a.ktpUrl} alt="KTP" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="flex h-full items-center justify-center p-4">
                                <a href={a.ktpUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400">
                                  <MdDescription className="h-10 w-10" />
                                  <span className="text-xs max-w-[120px] truncate text-center">{a.ktpName}</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-navy-700 mb-4 rounded-lg">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">KTP:</p>
                          <div onClick={() => openEditAnggota(a)} className="cursor-pointer hover:brightness-75 duration-200 active:scale-[0.98] flex flex-col items-center justify-center h-[200px] border-2 border-dashed border-gray-300 dark:border-navy-600 rounded-md text-gray-500 dark:text-gray-400">
                            <MdCamera className="h-8 w-8" />
                            <p className="text-sm">Belum upload KTP</p>
                          </div>
                        </div>
                      )}

                      {/* Info Anggota */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="rounded-md border border-black/80 bg-blue-100 text-white p-1">
                            {a.jenisKelamin === "L" ? <MdMale className="text-blue-500" /> : <MdFemale className="text-pink-500" />}
                          </div>
                          <strong className="text-navy-700 dark:text-white">{a.nama}</strong>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); openTagging(a); }} className="border border-black/40 rounded-md p-1 px-2 text-xs text-blue-600 hover:underline">Tag</button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditAnggota(a);
                            }}
                            className="border border-black/40 rounded-md p-1 px-2 text-yellow-500"
                          >
                            <MdEdit className="h-4 w-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteAnggota(a.id); }} className="border border-black/40 rounded-md p-1 px-2 text-red-500"><MdDelete className="h-4 w-4" /></button>
                        </div>
                      </div>

                      <p className={`text-sm ${a.status === "Meninggal" ? 'text-red-800' : 'text-gray-600'} dark:text-gray-300`}>NIK: {a.nik}</p>
                      <p className="text-sm">TTL: {a.tempatLahir}, {a.tanggalLahir}</p>
                      <p className="text-sm">Usia: {usia} th</p>

                      {a.status === "Meninggal" && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300"><MdWarning /> Meninggal</span>}
                      {a.status === "Pindah" && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Pindah</span>}

                      <div className={`border-t ${a.status === "Meninggal" ? 'border-red-300' : 'border-black/50'} my-3`}></div>

                      <div className="flex w-full justify-between items-center">
                        <p className="text-sm flex items-center gap-1"><span className={colorUsia}>{iconUsia}</span> {kelUsia}</p>
                      </div>
                      <div className={`flex w-full border-y ${a.status === "Meninggal" ? 'border-red-300' : 'border-black/50'} py-2 mt-2 justify-between items-center`}>
                        <p className={`text-xs ${a.status === "Meninggal" ? 'text-red-800' : 'text-gray-500'}`}>Agama: {a.agama || 'Belum ada'}</p>
                        <p className={`text-xs ${a.status === "Meninggal" ? 'text-red-800' : 'text-gray-500'}`}>Status Kawin: {a.statusKawin}</p>
                      </div>
                      {/* {a.keterangan && <p className="text-xs text-orange-600 italic">Catatan: {a.keterangan}</p>} */}
                      <div className="w-full flex justify-between items-center">
                        {a.statusWarga === "Tidak Tetap" ? <p className="text-xs text-purple-600 mt-2">Warga Tidak Tetap</p> : a.statusWarga === "Tetap" ? <p className="text-xs text-purple-600 mt-2">Warga Tetap</p> : <p></p>}
                        {(a.yatim || a.piatu) && (
                          <p className="text-xs text-purple-700 font-medium">
                            {a.yatim && "Yatim"} {a.yatim && a.piatu && "/"} {a.piatu && "Piatu"}
                          </p>
                        )}
                      </div>

                      <div className={`mt-2 border-b border-black/50 pb-2 text-xs ${a.status === "Meninggal" ? 'text-red-800' : 'text-gray-500'}`}>
                        Arsip RT: {(a.kelengkapanArsipRT || []).length} dokumen
                        {(a.kelengkapanArsipRT || []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {a.kelengkapanArsipRT.map(doc => (
                              <span key={doc} className="inline-flex items-center gap-1 text-green-600"><MdCheck className="h-3 w-3" /> {doc}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bantuan */}
                      {(a.bantuan || []).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {a.bantuan.map(bId => {
                            const b = DAFTAR_BANTUAN.find(x => x.id === bId);
                            return b ? <span key={bId} className={`rounded-full px-2 py-0.5 text-xs font-medium ${b.color}`}>{b.nama}</span> : null;
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {showSidebar && <div onClick={closeSidebar} className="fixed inset-0 bg-black/30 z-40 transition-opacity" />}

      {/* === MODAL TAMBAH/EDIT ANGGOTA === */}
      {/* {showModalAnggota && selectedKK && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowModalAnggota(false); setEditAnggota(null); setKtpFile(null); setKtpFileUrl(null); }} />
          <div className="relative z-10 w-full max-w-[80vw] mx-4 overflow-y-auto max-h-screen">
            <Card extra="p-6 rounded-2xl shadow-2xl bg-white dark:bg-navy-800">
              <h3 className="mb-5 text-xl font-bold text-navy-700 dark:text-white">{editAnggota ? "Edit" : "Tambah"} Anggota</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="NIK" value={formAnggota.nik || ""} onChange={e => setFormAnggota({ ...formAnggota, nik: e.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
                    <input placeholder="Nama Lengkap" value={formAnggota.nama || ""} onChange={e => setFormAnggota({ ...formAnggota, nama: e.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <select value={formAnggota.jenisKelamin} onChange={e => setFormAnggota({ ...formAnggota, jenisKelamin: e.target.value as "L" | "P" })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white">
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                    <input placeholder="Tempat Lahir" value={formAnggota.tempatLahir || ""} onChange={e => setFormAnggota({ ...formAnggota, tempatLahir: e.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" value={formAnggota.tanggalLahir || ""} onChange={e => setFormAnggota({ ...formAnggota, tanggalLahir: e.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
                    <select value={formAnggota.statusKeluarga} onChange={e => setFormAnggota({ ...formAnggota, statusKeluarga: e.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white">
                      <option>Kepala Keluarga</option>
                      <option>Istri</option>
                      <option>Anak</option>
                      <option>Orang Tua</option>
                    </select>
                  </div>

                  <select value={formAnggota.status} onChange={e => setFormAnggota({ ...formAnggota, status: e.target.value as StatusAnggota })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white">
                    <option value="Hidup">Hidup</option>
                    <option value="Meninggal">Meninggal</option>
                    <option value="Pindah">Pindah</option>
                  </select>

                  <select value={formAnggota.statusWarga} onChange={e => setFormAnggota({ ...formAnggota, statusWarga: e.target.value as "Tetap" | "Tidak Tetap" })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white">
                    <option value="Tetap">Warga Tetap</option>
                    <option value="Tidak Tetap">Warga Tidak Tetap</option>
                  </select>

                  <div className="flex gap-6 border border-gray-300 rounded-xl py-[12px] px-5">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formAnggota.yatim || false} onChange={e => setFormAnggota({ ...formAnggota, yatim: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-brand-500" />
                      <span className="text-sm">Yatim</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formAnggota.piatu || false} onChange={e => setFormAnggota({ ...formAnggota, piatu: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-brand-500" />
                      <span className="text-sm">Piatu</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload KTP (Opsional - JPG, PNG, PDF)</label>
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-navy-600 rounded-xl p-6 text-center cursor-pointer hover:border-brand-500 transition-colors"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleKtpChange(file); }}
                    onClick={() => document.getElementById("ktpInput")?.click()}
                  >
                    {ktpFileUrl || editAnggota?.ktpUrl ? (
                      <div className="space-y-3">
                        {(ktpFile?.type.startsWith("image/") || editAnggota?.ktpType?.startsWith("image/")) ? (
                          <img src={ktpFileUrl || editAnggota?.ktpUrl} alt="Preview KTP" className="mx-auto max-h-48 rounded-lg shadow-md" />
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-blue-600">
                            <MdDescription className="h-12 w-12" />
                            <span className="text-sm">{ktpFile?.name || editAnggota?.ktpName}</span>
                          </div>
                        )}
                        <button onClick={e => { e.stopPropagation(); setKtpFile(null); setKtpFileUrl(null); }} className="text-red-600 text-sm hover:underline">Hapus KTP</button>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <MdUpload className="mx-auto h-12 w-12 mb-2" />
                        <p className="text-sm">Klik atau drag KTP ke sini</p>
                        <p className="text-xs mt-1">Opsional - Max 5MB</p>
                      </div>
                    )}
                    <input id="ktpInput" type="file" accept="image/*,.pdf" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) handleKtpChange(file); }} />
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg text-sm text-amber-800 dark:text-amber-300">
                    <strong>Catatan:</strong> Status Kawin, Pendidikan, Pekerjaan, Keterangan, dan Arsip RT diedit di halaman <strong>Detail Anggota</strong>.
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-black/50 pt-6 grid grid-cols-2 gap-3 w-full">
                <button onClick={() => { setShowModalAnggota(false); setEditAnggota(null); setKtpFile(null); setKtpFileUrl(null); }} className="rounded-xl border border-gray-300 px-5 py-2.5 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white font-medium">Batal</button>
                <button onClick={handleSubmitAnggota} className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-white font-medium shadow-md hover:shadow-lg">Simpan</button>
              </div>
            </Card>
          </div>
        </div>
      )} */}

      {/* === MODAL TAMBAH/EDIT KK === */}
      {showModalKK && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetFormKK} />
          <div className="relative z-10 w-full max-w-[70vw] mx-4">
            <Card extra="p-6 rounded-2xl shadow-2xl bg-white dark:bg-navy-800">
              <div className="w-full border-b border-black/40 mb-6">
                <h3 className="mb-5 text-xl font-bold text-navy-700 dark:text-white">{editKK ? "Edit" : "Tambah"} Kartu Keluarga</h3>
              </div>
              <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                <div className="gap-4 grid grid-cols-1">
                  <div className="gap-3 md:grid grid-cols-2">
                    <input placeholder="No KK" value={formKK.noKK} onChange={e => setFormKK({ ...formKK, noKK: e.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
                    <input placeholder="Kepala Keluarga" value={formKK.kepalaKeluarga} onChange={e => setFormKK({ ...formKK, kepalaKeluarga: e.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
                  </div>
                  <input placeholder="Alamat" value={formKK.alamat} onChange={e => setFormKK({ ...formKK, alamat: e.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
                  <div className="md:grid grid-cols-2 gap-3">
                    <input placeholder="RT" value={formKK.rt} onChange={e => setFormKK({ ...formKK, rt: e.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
                    <input placeholder="RW" value={formKK.rw} onChange={e => setFormKK({ ...formKK, rw: e.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
                  </div>
                  <label className="flex items-center gap-2 border border-gray-300 rounded-lg px-4">
                    <input type="checkbox" checked={formKK.isSementara} onChange={e => setFormKK({ ...formKK, isSementara: e.target.checked })} className="h-5 w-5 rounded border-gray-300 text-brand-500" />
                    <span className="text-sm font-medium">KK Sementara</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Foto / Scan KK (PDF, JPG, PNG)</label>
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-navy-600 rounded-xl p-6 text-center cursor-pointer hover:border-brand-500 transition-colors"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFileChange(file); }}
                    onClick={() => document.getElementById("fileInput")?.click()}
                  >
                    {kkFileUrl || editKK?.fileUrl ? (
                      <div className="space-y-3">
                        {(kkFile?.type.startsWith("image/") || editKK?.fileType?.startsWith("image/")) ? (
                          <img src={kkFileUrl || editKK?.fileUrl} alt="Preview KK" className="mx-auto max-h-48 rounded-lg shadow-md" />
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-blue-600">
                            <MdDescription className="h-12 w-12" />
                            <span className="text-sm">{kkFile?.name || editKK?.fileName}</span>
                          </div>
                        )}
                        <button onClick={e => { e.stopPropagation(); setKKFile(null); setKKFileUrl(null); }} className="text-red-600 text-sm hover:underline">Hapus File</button>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <MdUpload className="mx-auto h-12 w-12 mb-2" />
                        <p className="text-sm">Klik atau drag file ke sini</p>
                        <p className="text-xs mt-1">Max 5MB</p>
                      </div>
                    )}
                    <input id="fileInput" type="file" accept="image/*,.pdf" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) handleFileChange(file); }} />
                  </div>
                </div>
              </div>
              <div className="border-t border-black/40 pt-6 mt-6 grid grid-cols-2 justify-between gap-3">
                <button onClick={resetFormKK} className="rounded-xl border border-gray-300 px-5 py-2.5 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white font-medium transition-colors">Batal</button>
                <button onClick={handleSubmitKK} className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-white font-medium shadow-md hover:shadow-lg transform hover:brightness-90 transition-all">Simpan</button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* === MODAL ZOOM DOKUMEN KK === */}
      {showKKZoom && selectedKK?.fileUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowKKZoom(false)}>
          <div className="relative w-full max-w-5xl max-h-full bg-white dark:bg-navy-800 rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
              <p className="text-sm font-medium text-white truncate max-w-md">{selectedKK.fileName}</p>
              <button onClick={() => setShowKKZoom(false)} className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                <MdClose className="h-5 w-5 text-white" />
              </button>
            </div>
            <div className="h-full max-h-[90vh] overflow-auto">
              {selectedKK.fileType?.startsWith("image/") ? (
                <img src={selectedKK.fileUrl} alt="KK Zoom" className="w-full h-auto max-h-[90vh] object-contain" />
              ) : (
                <iframe src={selectedKK.fileUrl} className="w-full h-[90vh] border-0" title="KK PDF" />
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent text-right">
              <p className="text-xs text-white/80">Klik di luar atau tekan <kbd className="px-1.5 py-0.5 rounded bg-white/20 text-xs">ESC</kbd> untuk keluar</p>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL TAGGING BANTUAN === */}
      {showModalBantuan && selectedAnggota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="absolute inset-0 bg-black backdrop-blur-md" onClick={() => setShowModalBantuan(false)} />
          <Card extra="w-full max-w-md p-6 rounded-2xl shadow-xl relative z-10">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">Tag Bantuan - {selectedAnggota.nama}</h3>
            <div className="space-y-2 mb-6">
              {DAFTAR_BANTUAN.map(b => (
                <label key={b.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-navy-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAnggota.bantuan?.includes(b.id) || false}
                    onChange={e => {
                      setFormAnggota(prev => ({
                        ...prev,
                        bantuan: e.target.checked
                          ? [...(prev.bantuan || []), b.id]
                          : (prev.bantuan || []).filter(x => x !== b.id),
                      }));
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-sm">{b.nama}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 justify-end border-t border-gray-200 dark:border-navy-600 pt-4">
              <button onClick={() => setShowModalBantuan(false)} className="rounded-xl border border-gray-300 px-5 py-2.5 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white font-medium">
                Batal
              </button>
              <button onClick={saveBantuan} className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-white font-medium shadow-md hover:shadow-lg">
                Simpan
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DataKK;