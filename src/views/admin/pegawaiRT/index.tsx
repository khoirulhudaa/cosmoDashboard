import Card from "components/card";
import Widget from "components/widget/Widget";
import React, { useEffect, useMemo, useState } from "react";
import { MdAdd, MdDelete, MdGroup, MdPhone, MdSearch, MdUpload } from "react-icons/md";

type Pegawai = {
  nama: string;
  telepon: string;
  aktif: boolean;
  fotoUrl?: string;
  fotoName?: string;
  fotoType?: string;
};

type PegawaiRT = {
  id: string;
  nomorRT: string;
  ketua?: Pegawai;
  sekretaris?: Pegawai;
  bendahara?: Pegawai;
};

const PegawaiRTPage: React.FC = () => {
  const [rtList, setRtList] = useState<PegawaiRT[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editRT, setEditRT] = useState<PegawaiRT | null>(null);

  const [form, setForm] = useState({
    nomorRT: "",
    ketuaNama: "", ketuaTelepon: "", ketuaAktif: true, ketuaFoto: null as File | null, ketuaFotoUrl: null as string | null,
    sekretarisNama: "", sekretarisTelepon: "", sekretarisAktif: true, sekretarisFoto: null as File | null, sekretarisFotoUrl: null as string | null,
    bendaharaNama: "", bendaharaTelepon: "", bendaharaAktif: true, bendaharaFoto: null as File | null, bendaharaFotoUrl: null as string | null,
  });

  // Load dari localStorage atau gunakan data dummy jika kosong
  useEffect(() => {
    const saved = localStorage.getItem("pegawaiRTList");
    if (saved && JSON.parse(saved).length > 0) {
      setRtList(JSON.parse(saved));
    } else {
      const dummyData: PegawaiRT[] = [
        {
          id: "1",
          nomorRT: "RT 01",
          ketua: {
            nama: "Budi Santoso",
            telepon: "081234567890",
            aktif: true,
            fotoUrl: "/pria1.jpg", // Pria
          },
          sekretaris: {
            nama: "Ahmad Fauzi",
            telepon: "082345678901",
            aktif: true,
            fotoUrl: "/pria2.jpg", // Pria
          },
          bendahara: {
            nama: "Joko Widodo",
            telepon: "083456789012",
            aktif: false,
            fotoUrl: "/pria1.jpg", // Pria
          },
        },
        {
          id: "2",
          nomorRT: "RT 02",
          ketua: {
            nama: "Joko Widodo",
            telepon: "081987654321",
            aktif: true,
            fotoUrl: "https://i.pravatar.cc/150?img=12",
          },
          sekretaris: {
            nama: "Rina Susanti",
            telepon: "082198765432",
            aktif: true,
            fotoUrl: "https://i.pravatar.cc/150?img=8",
          },
          bendahara: undefined,
        },
      ];
      setRtList(dummyData);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pegawaiRTList", JSON.stringify(rtList));
  }, [rtList]);

  const filteredData = useMemo(() => {
    return rtList.filter((rt) =>
      rt.nomorRT.includes(search) ||
      rt.ketua?.nama.toLowerCase().includes(search.toLowerCase()) ||
      rt.sekretaris?.nama.toLowerCase().includes(search.toLowerCase()) ||
      rt.bendahara?.nama.toLowerCase().includes(search.toLowerCase())
    );
  }, [rtList, search]);

  const getTotalAktif = () => {
    let count = 0;
    rtList.forEach((rt) => {
      if (rt.ketua?.aktif) count++;
      if (rt.sekretaris?.aktif) count++;
      if (rt.bendahara?.aktif) count++;
    });
    return count;
  };

  const openModal = (rt?: PegawaiRT) => {
    if (rt) {
      setEditRT(rt);
      setForm({
        nomorRT: rt.nomorRT,
        ketuaNama: rt.ketua?.nama || "", ketuaTelepon: rt.ketua?.telepon || "", ketuaAktif: rt.ketua?.aktif ?? true, ketuaFoto: null, ketuaFotoUrl: rt.ketua?.fotoUrl || null,
        sekretarisNama: rt.sekretaris?.nama || "", sekretarisTelepon: rt.sekretaris?.telepon || "", sekretarisAktif: rt.sekretaris?.aktif ?? true, sekretarisFoto: null, sekretarisFotoUrl: rt.sekretaris?.fotoUrl || null,
        bendaharaNama: rt.bendahara?.nama || "", bendaharaTelepon: rt.bendahara?.telepon || "", bendaharaAktif: rt.bendahara?.aktif ?? true, bendaharaFoto: null, bendaharaFotoUrl: rt.bendahara?.fotoUrl || null,
      });
    } else {
      setEditRT(null);
      setForm({
        nomorRT: `RT ${String(rtList.length + 1).padStart(2, "0")}`,
        ketuaNama: "", ketuaTelepon: "", ketuaAktif: true, ketuaFoto: null, ketuaFotoUrl: null,
        sekretarisNama: "", sekretarisTelepon: "", sekretarisAktif: true, sekretarisFoto: null, sekretarisFotoUrl: null,
        bendaharaNama: "", bendaharaTelepon: "", bendaharaAktif: true, bendaharaFoto: null, bendaharaFotoUrl: null,
      });
    }
    setShowModal(true);
  };

  const handleFileChange = (posisi: "ketua" | "sekretaris" | "bendahara", file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File terlalu besar! Maksimal 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, [`${posisi}Foto`]: file, [`${posisi}FotoUrl`]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    const newRT: PegawaiRT = {
      id: editRT?.id || Date.now().toString(),
      nomorRT: form.nomorRT,
      ketua: form.ketuaNama ? {
        nama: form.ketuaNama, telepon: form.ketuaTelepon, aktif: form.ketuaAktif,
        fotoUrl: form.ketuaFotoUrl || editRT?.ketua?.fotoUrl,
        fotoName: form.ketuaFoto?.name || editRT?.ketua?.fotoName,
        fotoType: form.ketuaFoto?.type || editRT?.ketua?.fotoType,
      } : undefined,
      sekretaris: form.sekretarisNama ? {
        nama: form.sekretarisNama, telepon: form.sekretarisTelepon, aktif: form.sekretarisAktif,
        fotoUrl: form.sekretarisFotoUrl || editRT?.sekretaris?.fotoUrl,
        fotoName: form.sekretarisFoto?.name || editRT?.sekretaris?.fotoName,
        fotoType: form.sekretarisFoto?.type || editRT?.sekretaris?.fotoType,
      } : undefined,
      bendahara: form.bendaharaNama ? {
        nama: form.bendaharaNama, telepon: form.bendaharaTelepon, aktif: form.bendaharaAktif,
        fotoUrl: form.bendaharaFotoUrl || editRT?.bendahara?.fotoUrl,
        fotoName: form.bendaharaFoto?.name || editRT?.bendahara?.fotoName,
        fotoType: form.bendaharaFoto?.type || editRT?.bendahara?.fotoType,
      } : undefined,
    };

    if (editRT) {
      setRtList(prev => prev.map(rt => rt.id === editRT.id ? newRT : rt));
    } else {
      setRtList(prev => [...prev, newRT]);
    }
    setShowModal(false);
    setEditRT(null);
  };

  const getPosisiColor = (posisi: string) => {
    switch (posisi) {
      case "Ketua": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "Sekretaris": return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      case "Bendahara": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div>
      {/* Widget */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        <Widget icon={<MdGroup className="h-7 w-7" />} title="Total RT" subtitle={rtList.length.toString()} />
        <Widget icon={<MdGroup className="h-7 w-7" />} title="Pegawai Aktif" subtitle={getTotalAktif().toString()} />
        <Widget icon={<MdGroup className="h-7 w-7" />} title="Ketua" subtitle={rtList.filter(r => r.ketua).length.toString()} />
        <Widget icon={<MdGroup className="h-7 w-7" />} title="Sekretaris" subtitle={rtList.filter(r => r.sekretaris).length.toString()} />
      </div>

      {/* Header */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 ml-[1px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
            <MdGroup className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">Kelola Pegawai RT</h3>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 text-white hover:shadow-lg transform hover:scale-105 transition-all">
          <MdAdd className="h-5 w-5" />
          Tambah RT
        </button>
      </div>

      {/* Search */}
      <div className="mt-5">
        <div className="relative">
          <MdSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Cari RT atau nama pegawai..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
        </div>
      </div>

      {/* CARD GRID */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {filteredData.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-500">
            <MdGroup className="mx-auto h-16 w-16 text-gray-300 mb-3" />
            <p>Belum ada data RT.</p>
          </div>
        ) : (
          filteredData.map((rt) => (
            <div key={rt.id} className="group relative overflow-hidden rounded-2xl bg-white dark:bg-navy-800 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer" onClick={() => openModal(rt)}>
              <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600" />
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-bold text-navy-700 dark:text-white">{rt.nomorRT}</h4>
                  <button onClick={(e) => { e.stopPropagation(); if (window.confirm("Hapus RT ini?")) setRtList(prev => prev.filter(r => r.id !== rt.id)); }} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300">
                    <MdDelete className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    { posisi: "Ketua", pegawai: rt.ketua },
                    { posisi: "Sekretaris", pegawai: rt.sekretaris },
                    { posisi: "Bendahara", pegawai: rt.bendahara },
                  ].map(({ posisi, pegawai }) => (
                    <div key={posisi} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-navy-700">
                      {pegawai?.fotoUrl ? (
                        <img src={pegawai.fotoUrl} alt={pegawai.nama} className="h-10 w-10 rounded-md object-cover shadow-sm" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-navy-600 flex items-center justify-center">
                          <MdGroup className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                        {pegawai ? (
                          <div className="flex w-max">
                            <p className="font-medium text-navy-700 dark:text-white text-sm">{pegawai.nama}</p>
                            {pegawai.telepon && <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center ml-2">(<MdPhone className="h-3 w-3 mr-1" />{pegawai.telepon})</p>}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">Belum ada {posisi.toLowerCase()}</p>
                        )}
                        <div className="flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPosisiColor(posisi)}`}>{posisi}</span>
                            {pegawai && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${pegawai.aktif ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}>
                                {pegawai.aktif ? "Aktif" : "Nonaktif"}
                                </span>
                            )}
                        </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL FORM - 3 POSISI + FOTO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
        {/* OVERLAY GELAP + BLUR */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
                setShowModal(false); setEditRT(null);
            }}
          />
          <Card extra="w-full max-w-[80vw] p-6 rounded-2xl shadow-2xl bg-white dark:bg-navy-800">
            <h3 className="mb-5 text-xl font-bold text-navy-700 dark:text-white">{editRT ? "Edit" : "Tambah"} {form.nomorRT}</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nomor RT</label>
              <input type="text" value={form.nomorRT} onChange={(e) => setForm({ ...form, nomorRT: e.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
            </div>

            <div className="flex gap-4">
                {(["Ketua", "Sekretaris", "Bendahara"] as const).map((posisi) => {
                const key = posisi.toLowerCase() as "ketua" | "sekretaris" | "bendahara";
                return (
                    <div key={posisi} className="mb-6 p-4 border border-gray-200 dark:border-navy-600 rounded-xl">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPosisiColor(posisi)}`}>{posisi}</span>
                    </label>

                    {/* Foto */}
                    <div className="mb-4">
                        <div
                        className="border-2 border-dashed border-gray-300 dark:border-navy-600 rounded-xl p-4 text-center cursor-pointer hover:border-brand-500 transition-colors"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) handleFileChange(key, file); }}
                        onClick={() => document.getElementById(`${key}FotoInput`)?.click()}
                        >
                        {form[`${key}FotoUrl`] ? (
                            <div className="space-y-2">
                            <img src={form[`${key}FotoUrl`]} alt={posisi} className="mx-auto h-24 w-24 rounded-full object-cover shadow-md" />
                            <button onClick={(e) => { e.stopPropagation(); setForm(prev => ({ ...prev, [`${key}Foto`]: null, [`${key}FotoUrl`]: null })); }} className="text-red-600 text-sm hover:underline">Hapus Foto</button>
                            </div>
                        ) : (
                            <div className="text-gray-500">
                            <MdUpload className="mx-auto h-10 w-10 mb-2" />
                            <p className="text-sm">Upload foto {posisi.toLowerCase()}</p>
                            </div>
                        )}
                        <input id={`${key}FotoInput`} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileChange(key, file); }} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input placeholder={`Nama ${posisi}`} value={form[`${key}Nama`]} onChange={(e) => setForm({ ...form, [`${key}Nama`]: e.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
                        <input placeholder="Telepon" value={form[`${key}Telepon`]} onChange={(e) => setForm({ ...form, [`${key}Telepon`]: e.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
                        <label className="md:col-span-2 flex items-center gap-2">
                        <input type="checkbox" checked={form[`${key}Aktif`]} onChange={(e) => setForm({ ...form, [`${key}Aktif`]: e.target.checked })} className="h-5 w-5 rounded border-gray-300 text-brand-500" />
                        <span className="text-sm font-medium">{posisi} Aktif</span>
                        </label>
                    </div>
                    </div>
                );
                })}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setShowModal(false); setEditRT(null); }} className="rounded-xl border border-gray-300 px-5 py-2.5 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white font-medium transition-colors">Batal</button>
              <button onClick={handleSubmit} className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-white font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all">Simpan</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PegawaiRTPage;