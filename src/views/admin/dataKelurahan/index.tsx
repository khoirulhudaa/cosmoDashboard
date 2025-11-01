// src/views/admin/kelurahan/index.tsx
import React, { useState, useEffect, useMemo } from "react";
import Widget from "components/widget/Widget";
import Card from "components/card";
import { MdLocationCity, MdAdd, MdEdit, MdDelete, MdSearch } from "react-icons/md";

type Kelurahan = {
  id: string;
  kode: string;
  nama: string;
  kecamatan: string;
  kotaKab: string;
  provinsi: string;
  kodePos: string;
  jumlahRT: number;
  jumlahRW: number;
};

const KelurahanPage: React.FC = () => {
  const [kelurahanList, setKelurahanList] = useState<Kelurahan[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Kelurahan | null>(null);

  const [form, setForm] = useState({
    kode: "",
    nama: "",
    kecamatan: "",
    kotaKab: "",
    provinsi: "",
    kodePos: "",
    jumlahRT: 1,
    jumlahRW: 1,
  });

  // Load dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("kelurahanList");
    if (saved) {
      setKelurahanList(JSON.parse(saved));
    } else {
      // Data contoh
      setKelurahanList([
        {
          id: "1",
          kode: "327501",
          nama: "Cihapit",
          kecamatan: "Bandung Wetan",
          kotaKab: "Kota Bandung",
          provinsi: "Jawa Barat",
          kodePos: "40114",
          jumlahRT: 15,
          jumlahRW: 5,
        },
      ]);
    }
  }, []);

  // Save ke localStorage
  useEffect(() => {
    localStorage.setItem("kelurahanList", JSON.stringify(kelurahanList));
  }, [kelurahanList]);

  // Hitung total RT/RW dari DataKK
  const totalRT = useMemo(() => {
    const kkData = localStorage.getItem("dataKK");
    if (!kkData) return 0;
    const kkList = JSON.parse(kkData);
    const rtSet = new Set(kkList.map((k: any) => `${k.rt}-${k.rw}`));
    return rtSet.size;
  }, [kelurahanList]);

  const totalRW = useMemo(() => {
    const kkData = localStorage.getItem("dataKK");
    if (!kkData) return 0;
    const kkList = JSON.parse(kkData);
    const rwSet = new Set(kkList.map((k: any) => k.rw));
    return rwSet.size;
  }, [kelurahanList]);

  // Filter data
  const filteredData = useMemo(() => {
    return kelurahanList.filter(
      (item) =>
        item.kode.includes(search) ||
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.kecamatan.toLowerCase().includes(search.toLowerCase()) ||
        item.kotaKab.toLowerCase().includes(search.toLowerCase())
    );
  }, [kelurahanList, search]);

  // Handle submit
  const handleSubmit = () => {
    if (!form.kode || !form.nama || !form.kecamatan || !form.kotaKab || !form.provinsi || !form.kodePos) {
      alert("Semua field wajib diisi!");
      return;
    }

    if (editItem) {
      setKelurahanList((prev) =>
        prev.map((item) =>
          item.id === editItem.id
            ? { ...item, ...form, jumlahRT: Number(form.jumlahRT), jumlahRW: Number(form.jumlahRW) }
            : item
        )
      );
    } else {
      const newItem: Kelurahan = {
        id: Date.now().toString(),
        ...form,
        jumlahRT: Number(form.jumlahRT),
        jumlahRW: Number(form.jumlahRW),
      };
      setKelurahanList((prev) => [...prev, newItem]);
    }

    setShowModal(false);
    setEditItem(null);
    setForm({ kode: "", nama: "", kecamatan: "", kotaKab: "", provinsi: "", kodePos: "", jumlahRT: 1, jumlahRW: 1 });
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (window.confirm("Hapus kelurahan ini?")) {
      setKelurahanList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Open edit
  const openEdit = (item: Kelurahan) => {
    setEditItem(item);
    setForm({
      kode: item.kode,
      nama: item.nama,
      kecamatan: item.kecamatan,
      kotaKab: item.kotaKab,
      provinsi: item.provinsi,
      kodePos: item.kodePos,
      jumlahRT: item.jumlahRT,
      jumlahRW: item.jumlahRW,
    });
    setShowModal(true);
  };

  return (
    <div>
      {/* Widget Summary */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3">
        <Widget icon={<MdLocationCity className="h-7 w-7" />} title="Total Kelurahan" subtitle={kelurahanList.length.toString()} />
        <Widget icon={<MdLocationCity className="h-7 w-7" />} title="Total RT" subtitle={totalRT.toString()} />
        <Widget icon={<MdLocationCity className="h-7 w-7" />} title="Total RW" subtitle={totalRW.toString()} />
      </div>

      {/* Header + Tombol Tambah */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 ml-[1px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
            <MdLocationCity className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">Kelola Data Kelurahan</h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
        >
          <MdAdd className="h-5 w-5" />
          Tambah Kelurahan
        </button>
      </div>

      {/* Search */}
      <div className="mt-5">
        <div className="relative">
          <MdSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kode, nama, kecamatan, atau kota..."
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
            <table className="w-full min-w-[800px] table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-navy-600">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">KODE</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">NAMA KELURAHAN</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">KECAMATAN</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">KOTA/KAB</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">KODE POS</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">RT/RW</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      Belum ada data kelurahan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-navy-700">
                      <td className="px-4 py-3 font-mono text-sm">{item.kode}</td>
                      <td className="px-4 py-3 font-medium text-navy-700 dark:text-white">{item.nama}</td>
                      <td className="px-4 py-3 text-sm">{item.kecamatan}</td>
                      <td className="px-4 py-3 text-sm">{item.kotaKab}</td>
                      <td className="px-4 py-3 text-sm text-center">{item.kodePos}</td>
                      <td className="px-4 py-3 text-center text-sm">
                        <span className="inline-block rounded-full bg-brand-100 px-2 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                          {item.jumlahRT} RT / {item.jumlahRW} RW
                        </span>
                      </td>
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

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          {/* OVERLAY GELAP + BLUR */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
             onClick={() => {
              setShowModal(false);
              setEditItem(null);
              setForm({ kode: "", nama: "", kecamatan: "", kotaKab: "", provinsi: "", kodePos: "", jumlahRT: 1, jumlahRW: 1 });
            }}
          />
          <Card extra="w-full max-w-2xl p-6">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              {editItem ? "Edit" : "Tambah"} Kelurahan
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kode Kelurahan</label>
                <input
                  type="text"
                  value={form.kode}
                  onChange={(e) => setForm({ ...form, kode: e.target.value })}
                  placeholder="327501"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Kelurahan</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Cihapit"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kecamatan</label>
                <input
                  type="text"
                  value={form.kecamatan}
                  onChange={(e) => setForm({ ...form, kecamatan: e.target.value })}
                  placeholder="Bandung Wetan"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kota/Kabupaten</label>
                <input
                  type="text"
                  value={form.kotaKab}
                  onChange={(e) => setForm({ ...form, kotaKab: e.target.value })}
                  placeholder="Kota Bandung"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Provinsi</label>
                <input
                  type="text"
                  value={form.provinsi}
                  onChange={(e) => setForm({ ...form, provinsi: e.target.value })}
                  placeholder="Jawa Barat"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kode Pos</label>
                <input
                  type="text"
                  value={form.kodePos}
                  onChange={(e) => setForm({ ...form, kodePos: e.target.value })}
                  placeholder="40114"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah RT</label>
                <input
                  type="number"
                  min="1"
                  value={form.jumlahRT}
                  onChange={(e) => setForm({ ...form, jumlahRT: parseInt(e.target.value) || 1 })}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah RW</label>
                <input
                  type="number"
                  min="1"
                  value={form.jumlahRW}
                  onChange={(e) => setForm({ ...form, jumlahRW: parseInt(e.target.value) || 1 })}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditItem(null);
                  setForm({ kode: "", nama: "", kecamatan: "", kotaKab: "", provinsi: "", kodePos: "", jumlahRT: 1, jumlahRW: 1 });
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.kode || !form.nama || !form.kecamatan || !form.kotaKab || !form.provinsi || !form.kodePos}
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

export default KelurahanPage;