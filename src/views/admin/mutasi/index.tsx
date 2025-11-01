import Card from "components/card";
import Widget from "components/widget/Widget";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MdAdd, MdBabyChangingStation, MdClose, MdDelete, MdDownload,
  MdEdit,
  MdSearch, MdSwapHoriz, MdWhatsapp
} from "react-icons/md";

type MutasiType = "Pindah Masuk" | "Pindah Keluar" | "Meninggal" | "Lahir" | "Pisah KK";

type MutasiItem = {
  id: string;
  tanggal: string;
  jenis: MutasiType;
  kkId: string;
  kkTujuanId: string;
  nik: string;
  nama: string;
  rt: string;
  rw: string;
  keterangan: string;
  alamatBaru?: string;
  asal?: string;
};

type Anggota = {
  id: string;
  nik: string;
  nama: string;
  status: "Hidup" | "Meninggal" | "Pindah";
  jenisKelamin: "L" | "P";
  tanggalLahir: string;
  statusKeluarga: string;
};

type KKItem = {
  id: string;
  noKK: string;
  kepalaKeluarga: string;
  alamat: string;
  rt: string;
  rw: string;
  anggota: Anggota[];
};

const MutasiPenduduk: React.FC = () => {
  const [mutasiList, setMutasiList] = useState<MutasiItem[]>([]);
  const [kkList, setKKList] = useState<KKItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("all");
  const [filterBulan, setFilterBulan] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MutasiItem | null>(null);
  const printLaporanRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<any>({
    tanggal: new Date().toISOString().split("T")[0],
    jenis: "Pindah Keluar" as MutasiType,
    kkId: "",
    kkTujuanId: "",
    nik: "",
    nama: "",
    rt: "",
    rw: "",
    keterangan: "",
    alamatBaru: "",
    asal: "",
  });

  // === LOAD DATA ===
  useEffect(() => {
    const savedKK = localStorage.getItem("dataKK");
    const savedMutasi = localStorage.getItem("mutasiList");
    if (savedKK) setKKList(JSON.parse(savedKK));
    if (savedMutasi) setMutasiList(JSON.parse(savedMutasi));
  }, []);

  // === SAVE DATA ===
  useEffect(() => {
    localStorage.setItem("mutasiList", JSON.stringify(mutasiList));
  }, [mutasiList]);

  useEffect(() => {
    localStorage.setItem("dataKK", JSON.stringify(kkList));
  }, [kkList]);

  // === DAFTAR KK ===
  const daftarKK = useMemo(() => {
    return kkList.map(kk => ({
      id: kk.id,
      label: `${kk.noKK} - ${kk.kepalaKeluarga} (RT ${kk.rt}/RW ${kk.rw})`,
      rt: kk.rt,
      rw: kk.rw,
    }));
  }, [kkList]);

  // === ANGGOTA HIDUP DI KK ASAL ===
  const anggotaDiKK = useMemo(() => {
    if (!form.kkId) return [];
    const kk = kkList.find(k => k.id === form.kkId);
    return kk?.anggota.filter(a => a.status === "Hidup") || [];
  }, [form.kkId, kkList]);

  // === FILTER DATA ===
  const filteredData = useMemo(() => {
    return mutasiList.filter(item => {
      const matchSearch = item.nama.toLowerCase().includes(search.toLowerCase()) || item.nik.includes(search);
      const matchJenis = filterJenis === "all" || item.jenis === filterJenis;
      const matchBulan = !filterBulan || item.tanggal.startsWith(filterBulan);
      return matchSearch && matchJenis && matchBulan;
    });
  }, [mutasiList, search, filterJenis, filterBulan]);

  // === SUBMIT MUTASI ===
  const handleSubmit = () => {
    if (!form.nik || !form.nama) return alert("NIK dan Nama wajib diisi!");
    if (!form.kkId) return alert("Pilih KK Asal!");
    if (!form.kkTujuanId && ["Pindah Masuk", "Lahir", "Pisah KK"].includes(form.jenis)) {
      return alert("Pilih KK Tujuan!");
    }

    const kkAsal = kkList.find(k => k.id === form.kkId);
    const kkTujuan = kkList.find(k => k.id === form.kkTujuanId);
    if (!kkAsal || !kkTujuan) return;

    const newMutasi: MutasiItem = {
      id: editItem?.id || Date.now().toString(),
      tanggal: form.tanggal,
      jenis: form.jenis,
      kkId: form.kkId,
      kkTujuanId: form.kkTujuanId,
      nik: form.nik,
      nama: form.nama,
      rt: kkAsal.rt,
      rw: kkAsal.rw,
      keterangan: form.keterangan,
      alamatBaru: form.alamatBaru,
      asal: form.asal,
    };

    let updatedKK = [...kkList];

    if (["Pindah Keluar", "Pisah KK", "Meninggal"].includes(form.jenis)) {
      const anggota = anggotaDiKK.find(a => a.nik === form.nik);
      if (!anggota) return;

      updatedKK = updatedKK.map(k =>
        k.id === form.kkId
          ? { ...k, anggota: k.anggota.filter(a => a.nik !== form.nik) }
          : k
      );

      if (form.jenis !== "Meninggal") {
        const anggotaBaru = { ...anggota, id: Date.now().toString() };
        updatedKK = updatedKK.map(k =>
          k.id === form.kkTujuanId
            ? { ...k, anggota: [...k.anggota, anggotaBaru] }
            : k
        );
      }
    }

    else if (["Pindah Masuk", "Lahir"].includes(form.jenis)) {
      const newAnggota: Anggota = {
        id: Date.now().toString(),
        nik: form.nik,
        nama: form.nama,
        status: "Hidup",
        jenisKelamin: "L",
        tanggalLahir: form.tanggal,
        statusKeluarga: form.jenis === "Lahir" ? "Anak" : "Anggota",
      };
      updatedKK = updatedKK.map(k =>
        k.id === form.kkTujuanId ? { ...k, anggota: [...k.anggota, newAnggota] } : k
      );
    }

    setMutasiList(editItem
      ? prev => prev.map(m => m.id === editItem.id ? newMutasi : m)
      : prev => [...prev, newMutasi]
    );
    setKKList(updatedKK);
    resetModal();
  };

  const resetModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({
      tanggal: new Date().toISOString().split("T")[0],
      jenis: "Pindah Keluar",
      kkId: "", kkTujuanId: "", nik: "", nama: "", rt: "", rw: "",
      keterangan: "", alamatBaru: "", asal: ""
    });
  };

  // === KIRIM WA ===
  const kirimWA = (item: MutasiItem) => {
    const kk = kkList.find(k => k.id === item.kkId || k.id === item.kkTujuanId);
    const msg = encodeURIComponent(
      `Notifikasi Mutasi\n\n*Jenis:* ${item.jenis}\n*NIK:* ${item.nik}\n*Nama:* ${item.nama}\n*RT/RW:* ${item.rt}/${item.rw}\n*Tanggal:* ${item.tanggal}\n\nHarap segera diperiksa.`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  // === LAPORAN BULANAN (PDF BISA DIBUKA) ===
  const laporanBulanan = async () => {
    const bulan = filterBulan || new Date().toISOString().slice(0, 7);
    const data = mutasiList.filter(m => m.tanggal.startsWith(bulan));

    if (data.length === 0) {
        alert("Tidak ada data untuk bulan ini.");
        return;
    }

    if (!printLaporanRef.current) return;

    try {
        const canvas = await html2canvas(printLaporanRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: true, // Tambahkan ini
        });

        // GUNAKAN JPEG, BUKAN PNG
        const imgData = canvas.toDataURL("image/jpeg", 0.95); // 0.95 = kualitas tinggi
        const pdf = new jsPDF("p", "mm", "a4");

        const imgWidth = 190;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 10;

        pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;

        // Jika konten terlalu panjang, tambah halaman baru
        while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 20;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
        }

        pdf.save(`Laporan_Mutasi_${bulan}.pdf`);
    } catch (err) {
        console.error("Error generate PDF:", err);
        alert("Gagal generate laporan. Pastikan data tersedia dan coba lagi.");
    }
    };

  const getJenisIcon = (jenis: any) => {
    const icons: any = {
      "Masuk": <MdSwapHoriz className="h-4 w-4 text-green-600" />,
      "Keluar": <MdSwapHoriz className="h-4 w-4 text-orange-600 rotate-180" />,
      "Meninggal": <MdClose className="h-4 w-4 text-red-600" />,
      "Lahir": <MdBabyChangingStation className="h-4 w-4 text-blue-600" />,
      "Pisah KK": <MdSwapHoriz className="h-4 w-4 text-purple-600" />,
    };
    return icons[jenis];
  };

  return (
    <div>
      {/* Widget */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
        {/* <Widget icon={<MdPeople className="h-7 w-7" />} title="Total" subtitle={mutasiList.length.toString()} /> */}
        {["Masuk", "Keluar", "Meninggal", "Lahir", "Pisah KK"].map(j => (
          <Widget key={j} icon={getJenisIcon(j as MutasiType)} title={j} subtitle={mutasiList.filter(m => m.jenis === j).length.toString()} />
        ))}
      </div>

      {/* Header */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
            <MdSwapHoriz className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">Mutasi Penduduk</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={laporanBulanan} className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600">
            <MdDownload className="h-5 w-5" /> Laporan
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600">
            <MdAdd className="h-5 w-5" /> Tambah
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="mt-5 flex flex-col gap-4 md:flex-row">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Cari NIK / Nama..." value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
        </div>
        <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white">
          <option value="all">Semua Jenis</option>
          {["Pindah Masuk", "Pindah Keluar", "Meninggal", "Lahir", "Pisah KK"].map(j => <option key={j} value={j}>{j}</option>)}
        </select>
        <input type="month" value={filterBulan} onChange={e => setFilterBulan(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
      </div>

      {/* Tabel */}
      <div className="mt-5">
        <Card extra="w-full p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-navy-600">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">TANGGAL</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">JENIS</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">NIK</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">NAMA</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">KK</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(item => {
                  const kkAsal = kkList.find(k => k.id === item.kkId);
                  const kkTujuan = kkList.find(k => k.id === item.kkTujuanId);
                  return (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-navy-700">
                      <td className="px-4 py-3 text-sm">{item.tanggal}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getJenisIcon(item.jenis)}
                          <span className="text-sm font-medium">{item.jenis}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">{item.nik}</td>
                      <td className="px-4 py-3 font-medium">{item.nama}</td>
                      <td className="px-4 py-3 text-xs">
                        {kkAsal?.noKK} to {kkTujuan?.noKK}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => kirimWA(item)} title="WA" className="text-blue-600 hover:text-blue-800"><MdWhatsapp className="h-5 w-5" /></button>
                          <button onClick={() => { setEditItem(item); setForm({ ...item }); setShowModal(true); }} className="text-blue-500 hover:text-blue-700"><MdEdit className="h-5 w-5" /></button>
                          <button onClick={() => setMutasiList(prev => prev.filter(m => m.id !== item.id))} className="text-red-500 hover:text-red-700"><MdDelete className="h-5 w-5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetModal} />
          <Card extra="relative w-full max-w-2xl p-6">
            <h3 className="mb-4 text-xl font-bold">Mutasi Penduduk</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Tanggal</label>
                <input type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium">Jenis</label>
                <select value={form.jenis} onChange={e => setForm({ ...form, jenis: e.target.value as MutasiType, kkId: "", kkTujuanId: "", nik: "", nama: "" })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white">
                  <option value="Pindah Keluar">Pindah Keluar</option>
                  <option value="Pindah Masuk">Pindah Masuk</option>
                  <option value="Meninggal">Meninggal</option>
                  <option value="Lahir">Lahir</option>
                  <option value="Pisah KK">Pisah KK</option>
                </select>
              </div>

              {["Pindah Keluar", "Meninggal", "Pisah KK"].includes(form.jenis) && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">KK Asal</label>
                  <select value={form.kkId} onChange={e => setForm({ ...form, kkId: e.target.value, nik: "", nama: "" })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white">
                    <option value="">Pilih KK</option>
                    {daftarKK.map(kk => <option key={kk.id} value={kk.id}>{kk.label}</option>)}
                  </select>
                </div>
              )}

              {["Pindah Masuk", "Lahir", "Pisah KK"].includes(form.jenis) && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">KK Tujuan {form.jenis === "Lahir" ? "(Orang Tua)" : ""}</label>
                  <select value={form.kkTujuanId} onChange={e => setForm({ ...form, kkTujuanId: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white">
                    <option value="">Pilih KK</option>
                    {daftarKK.map(kk => <option key={kk.id} value={kk.id}>{kk.label}</option>)}
                  </select>
                </div>
              )}

              {["Pindah Keluar", "Meninggal", "Pisah KK"].includes(form.jenis) && form.kkId && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Pilih Anggota</label>
                  <select value={form.nik} onChange={e => {
                    const a = anggotaDiKK.find(x => x.nik === e.target.value);
                    if (a) setForm({ ...form, nik: a.nik, nama: a.nama });
                  }} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white">
                    <option value="">Pilih</option>
                    {anggotaDiKK.map(a => <option key={a.id} value={a.nik}>{a.nik} - {a.nama}</option>)}
                  </select>
                </div>
              )}

              {["Pindah Masuk", "Lahir"].includes(form.jenis) && form.kkTujuanId && (
                <>
                  <input placeholder="NIK" value={form.nik} onChange={e => setForm({ ...form, nik: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
                  <input placeholder="Nama Lengkap" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
                </>
              )}

              {form.jenis === "Pindah Keluar" && <input placeholder="Alamat Tujuan" value={form.alamatBaru} onChange={e => setForm({ ...form, alamatBaru: e.target.value })} className="md:col-span-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />}
              {form.jenis === "Pindah Masuk" && <input placeholder="Asal Daerah" value={form.asal} onChange={e => setForm({ ...form, asal: e.target.value })} className="md:col-span-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />}
              <textarea placeholder="Keterangan" value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} rows={2} className="md:col-span-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={resetModal} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white">Batal</button>
              <button onClick={handleSubmit} className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600">Simpan</button>
            </div>
          </Card>
        </div>
      )}

      {/* LAPORAN PDF (HIDDEN) */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div ref={printLaporanRef} className="p-8 bg-white">
          <h1 className="text-2xl font-bold text-center mb-6">
            LAPORAN MUTASI PENDUDUK
          </h1>
          <p className="text-center mb-6">Bulan: {filterBulan || new Date().toISOString().slice(0, 7)}</p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">No</th>
                <th className="text-left p-2">Tanggal</th>
                <th className="text-left p-2">Jenis</th>
                <th className="text-left p-2">NIK</th>
                <th className="text-left p-2">Nama</th>
                <th className="text-left p-2">KK Asal</th>
                <th className="text-left p-2">KK Tujuan</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, i) => {
                const kkAsal = kkList.find(k => k.id === item.kkId);
                const kkTujuan = kkList.find(k => k.id === item.kkTujuanId);
                return (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{item.tanggal}</td>
                    <td className="p-2">{item.jenis}</td>
                    <td className="p-2">{item.nik}</td>
                    <td className="p-2">{item.nama}</td>
                    <td className="p-2">{kkAsal?.noKK || "-"}</td>
                    <td className="p-2">{kkTujuan?.noKK || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-8 text-right">Kepala RT</p>
        </div>
      </div>
    </div>
  );
};

export default MutasiPenduduk;