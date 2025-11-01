// src/components/AnggotaDetail.tsx
import React, { useEffect, useState } from "react";
import { MdExpandLess, MdExpandMore, MdSave } from "react-icons/md";

const ARSIP_RT: string[] = [
  "KTP",
  "KK",
  "Akta Lahir",
  "Akta Nikah",
  "Akta Cerai",
  "Surat Ket. Domisili",
  "Surat Kematian",
];

const DEMO_KK: any = {
  "1": {
    noKK: "3275012345678901",
    alamat: "Jl. Merdeka No. 10, RT 05/ RW 03",
    anggota: {
      "a1": {
        id: "a1",
        nama: "Ahmad Fauzi",
        nik: "3275010101900001",
        statusKawin: "Kawin",
        pendidikan: "S1 Teknik Informatika",
        pekerjaan: "Programmer",
        keterangan: "Difabel rungu",
        kelengkapanArsipRT: ["KTP", "KK", "Akta Nikah"],
      },
      "a2": {
        id: "a2",
        nama: "Siti Aminah",
        nik: "3275014102950002",
        statusKawin: "Kawin",
        pendidikan: "SMA",
        pekerjaan: "Ibu Rumah Tangga",
        keterangan: "",
        kelengkapanArsipRT: ["KTP", "KK", "Akta Nikah"],
      },
    },
  },
  "2": {
    noKK: "3275012345678902",
    alamat: "Jl. Sudirman Gg. Mawar No. 5",
    anggota: {
      "a3": {
        id: "a3",
        nama: "Budi Santoso",
        nik: "3275011503850003",
        statusKawin: "Belum Kawin",
        pendidikan: "SMP",
        pekerjaan: "Wiraswasta",
        keterangan: "Yatim",
        kelengkapanArsipRT: ["KTP", "KK"],
      },
    },
  },
  "3": {
    noKK: "3275012345678903",
    alamat: "Jl. Ahmad Yani No. 25",
    anggota: {
      "a4": {
        id: "a4",
        nama: "Rina Sari",
        nik: "3275015507800004",
        statusKawin: "Kawin",
        pendidikan: "D3 Akuntansi",
        pekerjaan: "Akuntan",
        keterangan: "",
        kelengkapanArsipRT: ["KTP", "KK", "Akta Nikah"],
      },
      "a5": {
        id: "a5",
        nama: "Dedi Kurniawan",
        nik: "3275012009750005",
        statusKawin: "Kawin",
        pendidikan: "S1 Hukum",
        pekerjaan: "Pengacara",
        keterangan: "",
        kelengkapanArsipRT: ["KTP", "KK", "Akta Nikah"],
      },
      "a6": {
        id: "a6",
        nama: "Nadia Putri",
        nik: "3275016005100006",
        statusKawin: "Belum Kawin",
        pendidikan: "SMP",
        pekerjaan: "Pelajar",
        keterangan: "Piatu",
        kelengkapanArsipRT: ["KTP", "KK", "Akta Lahir"],
      },
    },
  },
};

const AnggotaDetail: React.FC = () => {
  const [dataKK, setDataKK] = useState<any>(DEMO_KK);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [filterNoKK, setFilterNoKK] = useState<string>("all"); // "all" atau noKK

  // Inisialisasi expanded saat pertama kali
  useEffect(() => {
    const init: Record<string, boolean> = {};
    Object.values(dataKK).forEach((kk: any) => {
      Object.keys(kk.anggota).forEach((id) => {
        init[id] = true;
      });
    });
    setExpanded(init);
  }, []);

  const handleChange = (kkId: string, anggotaId: string, field: string, value: any) => {
    setDataKK((prev: any) => ({
      ...prev,
      [kkId]: {
        ...prev[kkId],
        anggota: {
          ...prev[kkId].anggota,
          [anggotaId]: {
            ...prev[kkId].anggota[anggotaId],
            [field]: value,
          },
        },
      },
    }));
  };

  const handleArsip = (kkId: string, anggotaId: string, doc: string, checked: boolean) => {
    const current = dataKK[kkId].anggota[anggotaId].kelengkapanArsipRT || [];
    const updated = checked ? [...current, doc] : current.filter((x: string) => x !== doc);
    handleChange(kkId, anggotaId, "kelengkapanArsipRT", updated);
  };

  const handleSave = () => {
    alert("Semua data KK berhasil disimpan! (Demo)");
  };

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter data berdasarkan noKK
  const filteredKK = filterNoKK === "all"
    ? Object.entries(dataKK)
    : Object.entries(dataKK).filter(([_, kk]: [string, any]) => kk.noKK === filterNoKK);

  return (
    <div className="min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Dropdown Filter + Tombol Simpan */}
        <div className="mb-8 bg-white p-4 pb-5 rounded-3xl shadow mt-[13.3px] flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block font-medium mb-2 text-gray-700">Filter berdasarkan No. KK</label>
            <select
              value={filterNoKK}
              onChange={(e) => setFilterNoKK(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua KK</option>
              {Object.values(DEMO_KK).map((kk: any) => (
                <option key={kk.noKK} value={kk.noKK}>
                  {kk.noKK} ({kk.alamat.split(",")[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Tombol Simpan - DIPINDAH KE SINI */}
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 text-base font-medium shadow hover:bg-blue-700 transition whitespace-nowrap"
          >
            <MdSave /> Simpan Perubahan
          </button>
        </div>

        {/* Hasil Filter */}
        {filteredKK.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <p className="text-gray-600">Tidak ada data KK yang sesuai.</p>
          </div>
        ) : (
          <div className={`gap-4 grid ${filteredKK.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {filteredKK.map(([kkId, kk]: [string, any]) => (
              <div key={kkId} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header KK */}
                <div className="bg-blue-600 text-white p-4">
                  <h2 className="text-xl font-bold">KK: {kk.noKK}</h2>
                  <p className="text-sm opacity-90">{kk.alamat}</p>
                </div>

                {/* Daftar Anggota */}
                <div className="p-4 space-y-4">
                  {Object.values(kk.anggota).map((anggota: any) => (
                    <div key={anggota.id} className="border rounded-lg overflow-hidden">
                      <div
                        className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                        onClick={() => toggle(anggota.id)}
                      >
                        <div>
                          <h3 className="font-semibold text-gray-800">{anggota.nama}</h3>
                          <p className="text-sm text-gray-600">NIK: {anggota.nik}</p>
                        </div>
                        {expanded[anggota.id] ? <MdExpandLess /> : <MdExpandMore />}
                      </div>

                      {expanded[anggota.id] && (
                        <div className="p-4 bg-white border-t">
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Status Kawin */}
                            <div>
                              <label className="block font-medium mb-1">Status Kawin</label>
                              <select
                                value={anggota.statusKawin}
                                onChange={(e) => handleChange(kkId, anggota.id, "statusKawin", e.target.value)}
                                className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                              >
                                <option>Belum Kawin</option>
                                <option>Kawin</option>
                                <option>Cerai Hidup</option>
                                <option>Cerai Mati</option>
                              </select>
                            </div>

                            {/* Agama - BARU */}
                            <div>
                              <label className="block font-medium mb-1">Agama</label>
                              <select
                                value={anggota.agama || "Islam"}
                                onChange={(e) => handleChange(kkId, anggota.id, "agama", e.target.value)}
                                className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                              >
                                <option value="Islam">Islam</option>
                                <option value="Kristen">Kristen</option>
                                <option value="Katolik">Katolik</option>
                                <option value="Hindu">Hindu</option>
                                <option value="Buddha">Buddha</option>
                                <option value="Konghucu">Konghucu</option>
                                <option value="Lainnya">Lainnya</option>
                              </select>
                            </div>

                            {/* Pendidikan */}
                            <div>
                              <label className="block font-medium mb-1">Pendidikan</label>
                              <input
                                value={anggota.pendidikan}
                                onChange={(e) => handleChange(kkId, anggota.id, "pendidikan", e.target.value)}
                                className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                              />
                            </div>

                            {/* Pekerjaan */}
                            <div>
                              <label className="block font-medium mb-1">Pekerjaan</label>
                              <input
                                value={anggota.pekerjaan}
                                onChange={(e) => handleChange(kkId, anggota.id, "pekerjaan", e.target.value)}
                                className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                              />
                            </div>

                            {/* Keterangan (span 2 kolom) */}
                            <div className="md:col-span-2">
                              <label className="block font-medium mb-1">Keterangan</label>
                              <textarea
                                value={anggota.keterangan}
                                onChange={(e) => handleChange(kkId, anggota.id, "keterangan", e.target.value)}
                                className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                                rows={2}
                              />
                            </div>
                          </div>

                          <div className="mt-5">
                            <p className="font-medium mb-2">Kelengkapan Arsip RT</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                              {ARSIP_RT.map((doc) => (
                                <label key={doc} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={anggota.kelengkapanArsipRT.includes(doc)}
                                    onChange={(e) =>
                                      handleArsip(kkId, anggota.id, doc, e.target.checked)
                                    }
                                  />
                                  {doc}
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnggotaDetail;