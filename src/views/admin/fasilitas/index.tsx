import Card from "components/card";
import Widget from "components/widget/Widget";
import L, { Icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MdAccessTime, MdAdd, MdDelete, MdEdit, MdLocationOn, MdSearch } from "react-icons/md";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";

type Fasilitas = {
  id: string;
  nama: string;
  kategori: string;
  jamOperasional: string;
  lat: number;
  lng: number;
  aktif: boolean;
};

// === KOMPONEN KLIK PETA ===
interface MapClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onMapClick }) => {
  useMapEvents({
    click: (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const FasilitasPage: React.FC = () => {
  const [fasilitasList, setFasilitasList] = useState<Fasilitas[]>([]);
  const [kategoriList, setKategoriList] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Fasilitas | null>(null);

  const [form, setForm] = useState({
    nama: "",
    kategori: "",
    jamOperasional: "",
    lat: -6.2088,
    lng: 106.8456,
    aktif: true,
  });

  const [mapCenter] = useState<LatLngExpression>([-6.2088, 106.8456]);

  // Load dari localStorage atau gunakan data dummy jika kosong
  useEffect(() => {
    const fasilitas = localStorage.getItem("fasilitasList");
    const kategori = localStorage.getItem("kategoriFasilitasList");

    if (fasilitas && JSON.parse(fasilitas).length > 0) {
      setFasilitasList(JSON.parse(fasilitas));
    } else {
      const dummyFasilitas: Fasilitas[] = [
        {
          id: "1",
          nama: "Masjid Al-Hidayah",
          kategori: "Tempat Ibadah",
          jamOperasional: "24 Jam",
          lat: -6.2088,
          lng: 106.8456,
          aktif: true,
        },
        {
          id: "2",
          nama: "Posyandu Melati",
          kategori: "Kesehatan",
          jamOperasional: "Setiap Selasa & Kamis, 08:00 - 12:00",
          lat: -6.2100,
          lng: 106.8470,
          aktif: false,
        },
      ];
      setFasilitasList(dummyFasilitas);
    }

    if (kategori && JSON.parse(kategori).length > 0) {
      setKategoriList(JSON.parse(kategori));
    } else {
      setKategoriList(["Tempat Ibadah", "Kesehatan", "Pendidikan", "Olahraga"]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("fasilitasList", JSON.stringify(fasilitasList));
  }, [fasilitasList]);

  useEffect(() => {
    localStorage.setItem("kategoriFasilitasList", JSON.stringify(kategoriList));
  }, [kategoriList]);

  const filteredData = useMemo(() => {
    return fasilitasList.filter((item) =>
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.kategori.toLowerCase().includes(search.toLowerCase())
    );
  }, [fasilitasList, search]);

  // === CRUD HANDLERS ===
  const handleSubmit = () => {
    if (!form.nama.trim() || !form.kategori.trim() || !form.jamOperasional.trim()) {
      alert("Nama, kategori, dan jam operasional wajib diisi!");
      return;
    }

    if (editItem) {
      setFasilitasList((prev) =>
        prev.map((item) => (item.id === editItem.id ? { ...item, ...form } : item))
      );
    } else {
      const newItem: Fasilitas = { id: Date.now().toString(), ...form };
      setFasilitasList((prev) => [...prev, newItem]);
    }

    setShowModal(false);
    setEditItem(null);
    setForm({ nama: "", kategori: "", jamOperasional: "", lat: -6.2088, lng: 106.8456, aktif: true });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Hapus fasilitas ini?")) {
      setFasilitasList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const openEdit = (item: Fasilitas) => {
    setEditItem(item);
    setForm({
      nama: item.nama,
      kategori: item.kategori,
      jamOperasional: item.jamOperasional,
      lat: item.lat,
      lng: item.lng,
      aktif: item.aktif,
    });
    setShowModal(true);
  };

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setForm((prev) => ({ ...prev, lat, lng }));
  }, []);

  return (
    <div>
      {/* Widget */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3">
        <Widget icon={<MdLocationOn className="h-7 w-7" />} title="Total Fasilitas" subtitle={fasilitasList.length.toString()} />
        <Widget icon={<MdLocationOn className="h-7 w-7" />} title="Aktif" subtitle={fasilitasList.filter((b) => b.aktif).length.toString()} />
        <Widget icon={<MdLocationOn className="h-7 w-7" />} title="Nonaktif" subtitle={fasilitasList.filter((b) => !b.aktif).length.toString()} />
      </div>

      {/* Header */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 ml-[1px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
            <MdLocationOn className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">Kelola Fasilitas</h3>
        </div>
        <button
          onClick={() => {
            setEditItem(null);
            setForm({ nama: "", kategori: "", jamOperasional: "", lat: -6.2088, lng: 106.8456, aktif: true });
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
        >
          <MdAdd className="h-5 w-5" />
          Tambah Fasilitas
        </button>
      </div>

      {/* Search */}
      <div className="mt-5">
        <div className="relative">
          <MdSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
          />
        </div>
      </div>

    {/* TABLE */}
    <Card extra="my-6 p-4">
    <h4 className="mb-3 text-lg font-bold text-navy-700 dark:text-white">Daftar Fasilitas</h4>
    <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] table-auto">
        <thead>
            <tr className="border-b border-gray-200 dark:border-navy-600">
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">NAMA</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">KATEGORI</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">JAM</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">STATUS</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">AKSI</th>
            </tr>
        </thead>
        <tbody>
            {filteredData.length === 0 ? (
            <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                Belum ada fasilitas.
                </td>
            </tr>
            ) : (
            filteredData.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-navy-700">
                <td className="px-4 py-3 font-medium text-navy-700 dark:text-white">{item.nama}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.kategori}</td>
                <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{item.jamOperasional}</td>
                <td className="px-4 py-3">
                    <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                        item.aktif
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                    >
                    {item.aktif ? "Aktif" : "Nonaktif"}
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

      {/* Map + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* MAP */}
        <Card extra="p-4">
          <h4 className="mb-3 text-lg font-bold text-navy-700 dark:text-white">Peta Lokasi Fasilitas</h4>
          <div className="h-96 rounded-lg overflow-hidden border border-gray-300 dark:border-navy-600">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {showModal && <MapClickHandler onMapClick={handleMapClick} />}
              {fasilitasList.map((item) => {
                const customIcon: Icon = new L.Icon({
                  iconUrl: item.aktif
                    ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
                    : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
                  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41],
                });

                return (
                  <Marker key={item.id} position={[item.lat, item.lng] as LatLngExpression} icon={customIcon}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">{item.nama}</p>
                        <p className="text-gray-600">{item.kategori}</p>
                        <p className="text-xs flex items-center gap-1">
                          <MdAccessTime className="h-3 w-3" /> {item.jamOperasional}
                        </p>
                        <p className="text-xs mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs ${item.aktif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                            {item.aktif ? "Aktif" : "Nonaktif"}
                          </span>
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
          <p className="mt-2 text-xs text-gray-500">Klik peta saat modal terbuka untuk mengambil koordinat.</p>
        </Card>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
        {/* OVERLAY GELAP + BLUR */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
                setShowModal(false);
                setEditItem(null);
            }}
          />
            <Card extra="w-full max-w-2xl p-6">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
                {editItem ? "Edit" : "Tambah"} Fasilitas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Fasilitas</label>
                <input
                    type="text"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    placeholder="Masjid Al-Hidayah"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
                <select
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                >
                    <option value="">Pilih kategori</option>
                    {kategoriList.map((kat) => (
                    <option key={kat} value={kat}>{kat}</option>
                    ))}
                </select>
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jam Operasional</label>
                <input
                    type="text"
                    value={form.jamOperasional}
                    onChange={(e) => setForm({ ...form, jamOperasional: e.target.value })}
                    placeholder="08:00 - 22:00"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Koordinat</label>
                <div className="flex gap-2">
                    <input
                    type="text"
                    value={form.lat.toFixed(6)}
                    readOnly
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm dark:bg-navy-800"
                    />
                    <input
                    type="text"
                    value={form.lng.toFixed(6)}
                    readOnly
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm dark:bg-navy-800"
                    />
                </div>
                </div>
                {/* Peta di dalam modal */}
                <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pilih Lokasi di Peta</label>
                <div className="mt-1 h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-navy-600">
                    <MapContainer
                    center={[form.lat, form.lng] as LatLngExpression}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                    >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onMapClick={handleMapClick} />
                    <Marker
                        position={[form.lat, form.lng] as LatLngExpression}
                        icon={
                        new L.Icon({
                            iconUrl: form.aktif
                            ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
                            : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
                            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41],
                        })
                        }
                    >
                        <Popup>
                        <div className="text-sm">
                            <p className="font-bold">{form.nama || "Lokasi Baru"}</p>
                            <p className="text-xs">Lat: {form.lat.toFixed(6)}</p>
                            <p className="text-xs">Lng: {form.lng.toFixed(6)}</p>
                        </div>
                        </Popup>
                    </Marker>
                    </MapContainer>
                </div>
                <p className="mt-1 text-xs text-gray-500">Klik peta untuk memperbarui koordinat.</p>
                </div>
                <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                    <input
                    type="checkbox"
                    checked={form.aktif}
                    onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fasilitas Aktif</span>
                </label>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <button
                onClick={() => {
                    setShowModal(false);
                    setEditItem(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white"
                >
                Batal
                </button>
                <button
                onClick={handleSubmit}
                disabled={!form.nama || !form.kategori || !form.jamOperasional}
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

export default FasilitasPage;