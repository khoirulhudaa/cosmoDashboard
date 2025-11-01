// src/views/admin/data-ktp/index.tsx
import React, { useState, useEffect, useMemo } from "react";
import Widget from "components/widget/Widget";
import Card from "components/card";
import { MdBadge, MdAdd, MdEdit, MdDelete, MdSearch } from "react-icons/md";

type KTPItem = {
  id: string;
  nik: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  golonganDarah: string;
  alamat: string;
  rt: string;
  rw: string;
  agama: string;
  statusPerkawinan: string;
  pekerjaan: string;
};

const DataKTP: React.FC = () => {
  const [ktpList, setKTPList] = useState<KTPItem[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<KTPItem | null>(null);

  const [form, setForm] = useState({
    nik: "",
    nama: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "L" as "L" | "P",
    golonganDarah: "",
    alamat: "",
    rt: "",
    rw: "",
    agama: "",
    statusPerkawinan: "",
    pekerjaan: "",
  });

  // Load dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dataKTP");
    if (saved) setKTPList(JSON.parse(saved));
  }, []);

  // Save ke localStorage
  useEffect(() => {
    localStorage.setItem("dataKTP", JSON.stringify(ktpList));
  }, [ktpList]);

  // Filter data
  const filteredData = useMemo(() => {
    return ktpList.filter(
      (item) =>
        item.nik.includes(search) ||
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.alamat.toLowerCase().includes(search.toLowerCase())
    );
  }, [ktpList, search]);

  // Handle submit
  const handleSubmit = () => {
    if (!form.nik || !form.nama || !form.alamat || !form.rt || !form.rw) {
      alert("NIK, Nama, Alamat, RT, dan RW wajib diisi!");
      return;
    }

    const newItem: KTPItem = {
      id: editItem?.id || Date.now().toString(),
      ...form,
    };

    if (editItem) {
      setKTPList((prev) => prev.map((i) => (i.id === editItem.id ? newItem : i)));
    } else {
      setKTPList((prev) => [...prev, newItem]);
    }

    setShowModal(false);
    setEditItem(null);
    setForm({
      nik: "", nama: "", tempatLahir: "", tanggalLahir: "", jenisKelamin: "L",
      golonganDarah: "", alamat: "", rt: "", rw: "", agama: "", statusPerkawinan: "", pekerjaan: ""
    });
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (window.confirm("Hapus data KTP ini?")) {
      setKTPList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Open edit
  const openEdit = (item: KTPItem) => {
    setEditItem(item);
    setForm({ ...item });
    setShowModal(true);
  };

  return (
    <div>
      {/* Widget Summary */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3">
        <Widget icon={<MdBadge className="h-7 w-7" />} title="Total KTP" subtitle={ktpList.length.toString()} />
        <Widget icon={<MdBadge className="h-7 w-7" />} title="Laki-laki" subtitle={ktpList.filter((k) => k.jenisKelamin === "L").length.toString()} />
        <Widget icon={<MdBadge className="h-7 w-7" />} title="Perempuan" subtitle={ktpList.filter((k) => k.jenisKelamin === "P").length.toString()} />
      </div>

      {/* Header + Tombol Tambah */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 ml-[1px]">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
              <MdBadge className="h-6 w-6" />
            </div>
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">Data Kartu Tanda Penduduk (KTP)</h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
        >
          <MdAdd className="h-5 w-5" />
          Tambah KTP
        </button>
      </div>

      {/* Search */}
      <div className="mt-5">
        <div className="relative">
          <MdSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari NIK, nama, atau alamat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="mt-5">
        <Card extra="w-full p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-navy-600">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">NIK</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">NAMA</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">TTL</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">JK</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">ALAMAT</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">RT/RW</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      Belum ada data KTP.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-navy-700">
                      <td className="px-4 py-3 font-mono text-sm">{item.nik}</td>
                      <td className="px-4 py-3 font-medium text-navy-700 dark:text-white">{item.nama}</td>
                      <td className="px-4 py-3 text-sm">
                        {item.tempatLahir}, {item.tanggalLahir}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${item.jenisKelamin === "L" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"} dark:bg-opacity-50`}>
                          {item.jenisKelamin}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{item.alamat}</td>
                      <td className="px-4 py-3 text-sm text-center">{item.rt}/{item.rw}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(item)} className="text-blue-500 hover:text-blue-700">
                            <MdEdit className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700">
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
          <Card extra="w-full max-w-2xl p-6">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              {editItem ? "Edit" : "Tambah"} Data KTP
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">NIK</label>
                <input type="text" value={form.nik} onChange={(e) => setForm({ ...form, nik: e.target.value })} placeholder="3275010101900001" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lengkap</label>
                <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Ahmad Fauzi" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tempat Lahir</label>
                <input type="text" value={form.tempatLahir} onChange={(e) => setForm({ ...form, tempatLahir: e.target.value })} placeholder="Bandung" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Lahir</label>
                <input type="date" value={form.tanggalLahir} onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Kelamin</label>
                <select value={form.jenisKelamin} onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value as "L" | "P" })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white">
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Golongan Darah</label>
                <select value={form.golonganDarah} onChange={(e) => setForm({ ...form, golonganDarah: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white">
                  <option value="">-</option>
                  <option>A</option>
                  <option>B</option>
                  <option>AB</option>
                  <option>O</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alamat</label>
                <input type="text" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} placeholder="Jl. Merdeka No. 1" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">RT</label>
                <input type="text" value={form.rt} onChange={(e) => setForm({ ...form, rt: e.target.value })} placeholder="01" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">RW</label>
                <input type="text" value={form.rw} onChange={(e) => setForm({ ...form, rw: e.target.value })} placeholder="001" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agama</label>
                <select value={form.agama} onChange={(e) => setForm({ ...form, agama: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white">
                  <option value="">-</option>
                  <option>Islam</option>
                  <option>Kristen</option>
                  <option>Katolik</option>
                  <option>Hindu</option>
                  <option>Budha</option>
                  <option>Konghucu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status Perkawinan</label>
                <select value={form.statusPerkawinan} onChange={(e) => setForm({ ...form, statusPerkawinan: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white">
                  <option value="">-</option>
                  <option>Belum Kawin</option>
                  <option>Kawin</option>
                  <option>Cerai Hidup</option>
                  <option>Cerai Mati</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pekerjaan</label>
                <input type="text" value={form.pekerjaan} onChange={(e) => setForm({ ...form, pekerjaan: e.target.value })} placeholder="Wiraswasta" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white" />
              </div>
              <div className="md:col-span-2 -mt-2 mb-3">
                <p className="text-xs text-gray-500 italic">
                  Jika warga belum punya KK resmi, buat dulu di menu <strong>Data KK</strong> dengan status "Sementara".
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditItem(null);
                  setForm({
                    nik: "", nama: "", tempatLahir: "", tanggalLahir: "", jenisKelamin: "L",
                    golonganDarah: "", alamat: "", rt: "", rw: "", agama: "", statusPerkawinan: "", pekerjaan: ""
                  });
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.nik || !form.nama || !form.alamat || !form.rt || !form.rw}
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

export default DataKTP;