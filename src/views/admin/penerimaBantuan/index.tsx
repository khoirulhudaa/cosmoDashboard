import Card from "components/card";
import Widget from "components/widget/Widget";
import React, { useEffect, useMemo, useState } from "react";
import { MdCheckCircle, MdPeople, MdSearch, MdWarning } from "react-icons/md";

type Anggota = {
  id: string;
  nik: string;
  nama: string;
  rt: string;
  rw: string;
  bantuan: string[];
};

type KKItem = {
  id: string;
  rt: string;
  rw: string;
  anggota: Anggota[];
};

type BantuanItem = {
  id: string;
  anggotaId: string;
  nik: string;
  nama: string;
  rt: string;
  rw: string;
  jenisBantuan: string;
  tanggal: string;
  status: "Diterima" | "Diproses" | "Ditolak";
};

const JENIS_BANTUAN_MAP: Record<string, string> = {
  bst: "BST",
  bpnt: "BPNT",
  pkh: "PKH",
  pip: "PIP",
  kks: "KKS",
};

const PenerimaBantuan: React.FC = () => {
  const [bantuanList, setBantuanList] = useState<BantuanItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterRtRw, setFilterRtRw] = useState("all");
  const [filterJenisBantuan, setFilterJenisBantuan] = useState("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof BantuanItem | "action"; direction: "asc" | "desc" } | null>(null);

  // === AMBIL DATA KK DARI LOCALSTORAGE ===
  const kkList: KKItem[] = useMemo(() => {
    const saved = localStorage.getItem("dataKK");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  }, []);

  // === EKSTRAK SEMUA PENERIMA BANTUAN (UNIK) ===
  const semuaPenerima = useMemo(() => {
    const penerima: BantuanItem[] = [];
    const seen = new Set<string>();

    kkList.forEach((kk) => {
      kk.anggota.forEach((anggota) => {
        anggota.bantuan.forEach((bantuanId) => {
          const key = `${anggota.id}-${bantuanId}`;
          if (!seen.has(key)) {
            seen.add(key);
            penerima.push({
              id: key,
              anggotaId: anggota.id,
              nik: anggota.nik,
              nama: anggota.nama,
              rt: kk.rt,
              rw: kk.rw,
              jenisBantuan: JENIS_BANTUAN_MAP[bantuanId],
              tanggal: new Date().toISOString().split("T")[0],
              status: "Diproses",
            });
          }
        });
      });
    });
    return penerima;
  }, [kkList]);

  // === LOAD & SYNC DARI LOCALSTORAGE ===
  useEffect(() => {
    const saved = localStorage.getItem("bantuanList");
    if (saved && JSON.parse(saved).length > 0) {
      setBantuanList(JSON.parse(saved));
    } else {
      setBantuanList(semuaPenerima);
    }
  }, [semuaPenerima]);

  useEffect(() => {
    localStorage.setItem("bantuanList", JSON.stringify(bantuanList));
  }, [bantuanList]);

  // === FILTER OPTIONS ===
  const rtRwOptions = Array.from(new Set(kkList.map((k) => `${k.rt}/${k.rw}`))).sort();
  const jenisBantuanOptions = Array.from(new Set(bantuanList.map((b) => b.jenisBantuan))).sort();

  // === FILTER & SEARCH ===
  const filteredData = useMemo(() => {
    return bantuanList.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(search.toLowerCase()) ||
        item.nik.includes(search);
      const matchRtRw = filterRtRw === "all" || `${item.rt}/${item.rw}` === filterRtRw;
      const matchJenis = filterJenisBantuan === "all" || item.jenisBantuan === filterJenisBantuan;
      return matchSearch && matchRtRw && matchJenis;
    });
  }, [bantuanList, search, filterRtRw, filterJenisBantuan]);

  // === SORTING ===
  const sortedData = useMemo(() => {
    const data = [...filteredData];
    if (sortConfig && sortConfig.key !== "action") {
      data.sort((a, b) => {
        let aVal: any = a[sortConfig.key as keyof BantuanItem];
        let bVal: any = b[sortConfig.key as keyof BantuanItem];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [filteredData, sortConfig]);

  // === VALIDASI: BISA DIUBAH KAPAN SAJA ===
  const handleValidasi = (id: string, status: "Diterima" | "Ditolak") => {
    setBantuanList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
  };

  const requestSort = (key: keyof BantuanItem | "action") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div>
      {/* Widget Summary */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        <Widget icon={<MdPeople className="h-7 w-7" />} title="Total Penerima" subtitle={bantuanList.length.toString()} />
        <Widget icon={<MdCheckCircle className="h-7 w-7 text-green-600" />} title="Layak" subtitle={bantuanList.filter((b) => b.status === "Diterima").length.toString()} />
        <Widget icon={<MdWarning className="h-7 w-7 text-yellow-600" />} title="Diproses" subtitle={bantuanList.filter((b) => b.status === "Diproses").length.toString()} />
        <Widget icon={<MdPeople className="h-7 w-7 text-red-600" />} title="Tidak Layak" subtitle={bantuanList.filter((b) => b.status === "Ditolak").length.toString()} />
      </div>

      {/* Header */}
      <div className="mt-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-500/20 text-purple-600">
          <MdPeople className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold text-navy-700 dark:text-white">Validasi Penerima Bantuan</h3>
      </div>

      {/* Filter & Search */}
      <div className="mt-5 flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <MdSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau NIK..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
            />
          </div>
        </div>

        <select
          value={filterRtRw}
          onChange={(e) => setFilterRtRw(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white min-w-[140px]"
        >
          <option value="all">Semua RT/RW</option>
          {rtRwOptions.map((rtRw) => (
            <option key={rtRw} value={rtRw}>RT {rtRw}</option>
          ))}
        </select>

        <select
          value={filterJenisBantuan}
          onChange={(e) => setFilterJenisBantuan(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white min-w-[160px]"
        >
          <option value="all">Semua Bantuan</option>
          {jenisBantuanOptions.map((jenis) => (
            <option key={jenis} value={jenis}>{jenis}</option>
          ))}
        </select>
      </div>

      {/* TABEL */}
      <div className="mt-5">
        <Card extra="w-full p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-navy-600">
                  <th
                    onClick={() => requestSort("nik")}
                    className="cursor-pointer px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white hover:text-purple-500"
                  >
                    NIK {sortConfig?.key === "nik" && (sortConfig.direction === "asc" ? "Up" : "Down")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">NAMA</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">BANTUAN</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">STATUS</th>
                  <th
                    onClick={() => requestSort("tanggal")}
                    className="cursor-pointer px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white hover:text-purple-500"
                  >
                    TANGGAL {sortConfig?.key === "tanggal" && (sortConfig.direction === "asc" ? "Up" : "Down")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">VALIDASI</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                      Belum ada data penerima bantuan.
                    </td>
                  </tr>
                ) : (
                  sortedData.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-navy-700">
                      <td className="px-4 py-3 text-xs text-gray-500">{item.nik}</td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-navy-700 dark:text-white">{item.nama}</div>
                          <div className="text-xs text-gray-500">RT {item.rt}/RW {item.rw}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{item.jenisBantuan}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            item.status === "Diterima"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : item.status === "Diproses"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{item.tanggal}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {/* Tombol Layak */}
                          <button
                            onClick={() => handleValidasi(item.id, "Diterima")}
                            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${
                              item.status === "Diterima"
                                ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 ring-2 ring-green-500"
                                : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                            }`}
                            title="Tandai sebagai Layak"
                          >
                            <MdCheckCircle className="h-3 w-3" /> Layak
                          </button>

                          {/* Tombol Tidak Layak */}
                          <button
                            onClick={() => handleValidasi(item.id, "Ditolak")}
                            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${
                              item.status === "Ditolak"
                                ? "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200 ring-2 ring-red-500"
                                : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                            }`}
                            title="Tandai sebagai Tidak Layak"
                          >
                            <MdWarning className="h-3 w-3" /> Tidak
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
    </div>
  );
};

export default PenerimaBantuan;