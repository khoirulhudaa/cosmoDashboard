// components/EditAnggota.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MdArrowBack, MdSave } from "react-icons/md";
import Card from "components/card";

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
  status: "Hidup" | "Meninggal" | "Pindah";
  ktpUrl?: string;
  ktpName?: string;
  ktpType?: string;
  statusKawin: "Belum Kawin" | "Kawin" | "Cerai Hidup" | "Cerai Mati";
  agama: "Islam" | "Kristen" | "Katolik" | "Hindu" | "Buddha" | "Konghucu" | "Lainnya";
  keterangan: string;
  kelengkapanArsipRT: string[];
  statusWarga: "Tetap" | "Tidak Tetap";
  yatim: boolean;
  piatu: boolean;
};

const DAFTAR_BANTUAN = [
  { id: "bst", nama: "BST" },
  { id: "bpnt", nama: "BPNT" },
  { id: "pkh", nama: "PKH" },
  { id: "pip", nama: "PIP" },
  { id: "kks", nama: "KKS" },
];

const EditAnggota: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anggota, setAnggota] = useState<Anggota | null>(null);
  const [form, setForm] = useState<Partial<Anggota>>({});

  useEffect(() => {
    if (id) {
      const dataKK = JSON.parse(localStorage.getItem("dataKK") || "[]");
      let found: Anggota | null = null;
      for (const kk of dataKK) {
        found = kk.anggota.find((a: Anggota) => a.id === id);
        if (found) break;
      }
      if (found) {
        setAnggota(found);
        setForm(found);
      } else {
        alert("Anggota tidak ditemukan!");
        navigate("/");
      }
    }
  }, [id, navigate]);

  const handleSave = () => {
    if (!anggota) return;
    const dataKK = JSON.parse(localStorage.getItem("dataKK") || "[]");
    const updated = dataKK.map((kk: any) => ({
      ...kk,
      anggota: kk.anggota.map((a: Anggota) => (a.id === anggota.id ? { ...a, ...form } : a)),
    }));
    localStorage.setItem("dataKK", JSON.stringify(updated));
    alert("Data anggota berhasil diperbarui!");
    navigate(-1);
  };

  if (!anggota) return <div className="p-6">Loading...</div>;

  return (
    <>
    <div className="mt-3 max-w-7xl mx-auto">
        <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-brand-500 hover:underline"
        >
            <MdArrowBack /> Kembali
        </button>

        <Card extra="p-6">
            <h2 className="text-2xl font-bold mb-6 text-navy-700 dark:text-white">
            Edit Anggota: {anggota.nama}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
            {/* Kolom Kiri */}
            <div className="space-y-4">
                <input
                placeholder="NIK"
                value={form.nik || ""}
                onChange={(e) => setForm({ ...form, nik: e.target.value })}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
                <input
                placeholder="Nama Lengkap"
                value={form.nama || ""}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
                <select
                value={form.jenisKelamin}
                onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value as "L" | "P" })}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
                </select>
                <input
                placeholder="Tempat Lahir"
                value={form.tempatLahir || ""}
                onChange={(e) => setForm({ ...form, tempatLahir: e.target.value })}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
                <input
                type="date"
                value={form.tanggalLahir || ""}
                onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
                <select
                value={form.statusKeluarga}
                onChange={(e) => setForm({ ...form, statusKeluarga: e.target.value })}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                >
                <option>Kepala Keluarga</option>
                <option>Istri</option>
                <option>Anak</option>
                <option>Orang Tua</option>
                </select>
                <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                >
                <option value="Hidup">Hidup</option>
                <option value="Meninggal">Meninggal</option>
                <option value="Pindah">Pindah</option>
                </select>
                <select
                value={form.statusWarga}
                onChange={(e) => setForm({ ...form, statusWarga: e.target.value as any })}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                >
                <option value="Tetap">Warga Tetap</option>
                <option value="Tidak Tetap">Warga Tidak Tetap</option>
                </select>
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-4">
                <input
                placeholder="Pendidikan"
                value={form.pendidikan || ""}
                onChange={(e) => setForm({ ...form, pendidikan: e.target.value })}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
                <input
                placeholder="Pekerjaan"
                value={form.pekerjaan || ""}
                onChange={(e) => setForm({ ...form, pekerjaan: e.target.value })}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
                <select
                value={form.statusKawin}
                onChange={(e) => setForm({ ...form, statusKawin: e.target.value as any })}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                >
                <option value="Belum Kawin">Belum Kawin</option>
                <option value="Kawin">Kawin</option>
                <option value="Cerai Hidup">Cerai Hidup</option>
                <option value="Cerai Mati">Cerai Mati</option>
                </select>
                <select
                value={form.agama}
                onChange={(e) => setForm({ ...form, agama: e.target.value as any })}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                >
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
                <option value="Lainnya">Lainnya</option>
                </select>
                <input
                placeholder="Keterangan"
                value={form.keterangan || ""}
                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
                <div className="space-y-2">
                <p className="text-sm font-medium">Kelengkapan Arsip RT:</p>
                <div className="flex flex-wrap rounded-lg p-4 border border-gray-300 items-center gap-3">
                    {["KTP", "KK", "Akta Lahir", "Akta Nikah", "Akta Cerai", "Surat Ket. Domisili", "Surat Kematian"].map((doc) => (
                        <label key={doc} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.kelengkapanArsipRT?.includes(doc) || false}
                            onChange={(e) => {
                            const checked = e.target.checked;
                            setForm({
                                ...form,
                                kelengkapanArsipRT: checked
                                ? [...(form.kelengkapanArsipRT || []), doc]
                                : (form.kelengkapanArsipRT || []).filter((d) => d !== doc),
                            });
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-brand-500"
                        />
                        <span className="text-sm">{doc}</span>
                        </label>
                    ))}
                </div>
                </div>

                <div className="flex gap-4">
                <label className="flex items-center gap-2">
                    <input
                    type="checkbox"
                    checked={form.yatim || false}
                    onChange={(e) => setForm({ ...form, yatim: e.target.checked })}
                    className="h-4 w-4 ditnded border-gray-300 text-brand-500"
                    />
                    <span className="text-sm">Yatim</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                    type="checkbox"
                    checked={form.piatu || false}
                    onChange={(e) => setForm({ ...form, piatu: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500"
                    />
                    <span className="text-sm">Piatu</span>
                </label>
                </div>
            </div>
            </div>

            <div className="w-full mt-6 grid grid-cols-2 border-t border-black/40 pt-6 gap-3">
            <button
                onClick={() => navigate(-1)}
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white"
            >
                Batal
            </button>
            <button
                onClick={handleSave}
                className="rounded-xl bg-brand-500 text-center px-5 py-2.5 text-white flex items-center justify-center gap-2 hover:bg-brand-600"
            >
                <MdSave /> Simpan Perubahan
            </button>
            </div>
        </Card>
        </div>
    </>
  );
};

export default EditAnggota;