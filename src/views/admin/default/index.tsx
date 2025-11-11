// src/pages/admin/Dashboard.tsx
import Card from "components/card";
import Widget from "components/widget/Widget";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { IoDocuments } from "react-icons/io5";
import {
  MdHealthAndSafety,
  MdModelTraining,
  MdQrCode,
  MdWarning
} from "react-icons/md";

// === TYPES ===
type Product = {
  id: number;
  sku: string;
  name: string;
  category: "OIL" | "GENERAL";
  description?: string;
  modelUrl?: string;
  qrCodeUrl?: string;
  price?: string;
  scanCount: number;
  viewCount: number;
  createdAt?: string;
};

type ScanAnalytics = {
  totalScans: number;
  totalProducts: number;
  topProducts: { sku: string; name: string; scanCount: number }[];
};

type Health = {
  success: boolean;
  environment: string;
  timestamp: string;
};

type Model = {
  filename: string;
  name: string;
  size: number;
  sizeFormatted: string;
  fullUrl: string;
  modifiedAt: string;
};

type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: "ADMIN" | "SUPER_ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<ScanAnalytics | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const [newProduct, setNewProduct] = useState({
    sku: "",
    name: "",
    category: "GENERAL" as "OIL" | "GENERAL",
    description: "",
    price: "",
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;

  // === REDIRECT ===
  useEffect(() => {
    if (!token || !user) {
      window.location.href = "/auth/sign-in";
    }
  }, [token, user]);

  // === FETCH ALL ===
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const [pRes, aRes, hRes, mRes, adminRes] = await Promise.all([
        fetch("https://vr.kiraproject.id/api/products"),
        fetch("https://vr.kiraproject.id/api/scans/analytics"),
        fetch("https://vr.kiraproject.id/health"),
        fetch("https://vr.kiraproject.id/api/models"),
        token ? fetch("https://vr.kiraproject.id/api/admin/users", { headers }) : Promise.resolve(null),
      ]);

      const [pJson, aJson, hJson, mJson, adminJson] = await Promise.all([
        pRes.json(),
        aRes.json(),
        hRes.json(),
        mRes.json(),
        adminRes ? adminRes.json() : null,
      ]);

      if (pJson.success) setProducts(pJson.data);
      if (aJson.success) setAnalytics(aJson.data);
      if (hJson.success) setHealth(hJson);
      if (mJson.success) setModels(mJson.data);
      if (adminJson?.success) setAdminUsers(adminJson.data);
    } catch (err) {
      setError("Gagal memuat data. Coba refresh.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // === CREATE PRODUCT ===
  const createProduct = async () => {
    if (!newProduct.sku || !newProduct.name) return alert("SKU & Nama wajib diisi");
    try {
      const res = await fetch("https://vr.kiraproject.id/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        setNewProduct({ sku: "", name: "", category: "GENERAL", description: "", price: "" });
        fetchAll();
      } else {
        alert(json.message || "Gagal tambah produk");
      }
    } catch {
      alert("Gagal tambah produk");
    }
  };

  // === DRAG & DROP ===
  const handleDrop = async (e: React.DragEvent, productId: number) => {
    e.preventDefault();
    setDragOverId(null);
    const modelUrl = e.dataTransfer.getData("text/plain");
    if (!modelUrl) return;

    try {
      const res = await fetch(`https://vr.kiraproject.id/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelUrl }),
      });
      const json = await res.json();
      if (json.success) fetchAll();
    } catch {
      alert("Gagal assign model");
    }
  };

  // === APEXCHARTS CONFIG ===

  // 1. Pie Chart: Kategori Produk
  const pieOptions = useMemo(() => {
    const oil = products.filter(p => p.category === "OIL").length;
    const general = products.filter(p => p.category === "GENERAL").length;
    return {
      series: [oil, general],
      options: {
        chart: { type: "donut" as const },
        labels: ["OIL", "GENERAL"],
        colors: ["#f59e0b", "#3b82f6"],
        legend: { position: "bottom" as const },
        dataLabels: { enabled: true },
        plotOptions: { pie: { donut: { size: "65%" } } },
        responsive: [{ breakpoint: 480, options: { chart: { width: 200 } } }],
      },
    };
  }, [products]);

  // 2. Line Chart: Pertumbuhan Produk
  const lineOptions = useMemo(() => {
    const grouped = products.reduce((acc, p) => {
      const date = new Date(p.createdAt || Date.now()).toLocaleDateString("id-ID", { month: "short" });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const data = Object.entries(grouped).map(([name, value]) => ({ x: name, y: value }));
    return {
      series: [{ name: "Produk Baru", data: data.map(d => d.y) }],
      options: {
        chart: { type: "line" as const, zoom: { enabled: false } },
        stroke: { curve: "smooth" as const, width: 3 },
        xaxis: { categories: data.map(d => d.x) },
        colors: ["#3b82f6"],
        title: { text: "Pertumbuhan Produk", align: "left" as const },
      },
    };
  }, [products]);

  console.log('models', models)

  // 3. BAR CHART: Ukuran Model 3D (KB / MB otomatis)
  const modelSizeOptions = useMemo(() => {
    const data = models
      .slice(0, 8)
      .map(m => {
        const sizeInKB = m.size / 1024;
        const sizeInMB = sizeInKB / 1024;

        let displayValue: number;
        let unit: string;

        if (sizeInMB >= 1) {
          displayValue = parseFloat(sizeInMB.toFixed(2));
          unit = "MB";
        } else {
          displayValue = parseFloat(sizeInKB.toFixed(0));
          unit = "KB";
        }

        return {
          name: m.name.length > 14 ? m.name.substring(0, 14) + "..." : m.name,
          size: displayValue,
          unit,
        };
      });

    return {
      series: [{ name: "Ukuran", data: data.map(d => d.size) }],
      options: {
        chart: { type: "bar" as const },
        plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
        dataLabels: {
          enabled: true,
          formatter: function (val: number, opts: any) {
            const index = opts.dataPointIndex;
            return `${val} ${data[index].unit}`;
          },
          style: { fontSize: "11px", colors: ["#fff"] },
        },
        xaxis: {
          categories: data.map(d => d.name),
          title: { text: "Ukuran File" },
        },
        colors: ["#10b981"],
        title: { text: "Ukuran Model 3D (Top 8)", align: "left" as const },
        tooltip: {
          y: {
            formatter: function (val: number, opts: any) {
              const index = opts.dataPointIndex;
              return `${val} ${data[index].unit}`;
            },
          },
        },
      },
    };
  }, [models]);

  // === STATS ===
  const stats = useMemo(() => {
    const totalScans = analytics?.totalScans || 0;
    const totalProducts = products.length;
    const totalModels = models.length;
    const totalModelSize = (models.reduce((a, m) => a + m.size, 0) / 1024 / 1024).toFixed(1);
    return { totalScans, totalProducts, totalModels, totalModelSize, totalAdmins: adminUsers.length };
  }, [analytics, products, models, adminUsers]);

  // === LOADING SKELETON ===
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-navy-700 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-navy-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <MdWarning className="w-12 h-12 mb-3" />
        <p className="text-lg">{error}</p>
        <button onClick={fetchAll} className="mt-3 px-4 py-2 bg-brand-500 text-white rounded">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* === WIDGETS === */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-6">
        <Widget icon={<MdQrCode className="h-7 w-7" />} title="Total Produk" subtitle={stats.totalProducts.toString()} />
        <Widget icon={<MdModelTraining className="h-7 w-7 text-green-500" />} title="Model 3D" subtitle={stats.totalModels.toString()} />
        <Widget icon={<MdHealthAndSafety className="h-7 w-7 text-orange-500" />} title="Backend" subtitle={health?.success ? "Online" : "Offline"} />
        <Widget icon={<IoDocuments className="h-6 w-6" />} title="Storage Model" subtitle={`${stats.totalModelSize} MB`} />
      </div>

      {/* === CHARTS === */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Pie Chart: Kategori */}
        <Card extra="p-5">
          <h4 className="text-lg font-semibold mb-4">Kategori Produk</h4>
          <Chart options={pieOptions.options} series={pieOptions.series} type="donut" height={280} />
        </Card>

        {/* Line Chart: Pertumbuhan */}
        <Card extra="p-5">
          <h4 className="text-lg font-semibold mb-4">Pertumbuhan Produk</h4>
          <Chart options={lineOptions.options} series={lineOptions.series} type="line" height={280} />
        </Card>

        {/* BAR CHART: Ukuran Model */}
        <Card extra="p-5">
          <h4 className="text-lg font-semibold mb-4">Ukuran Model 3D</h4>
          <Chart options={modelSizeOptions.options} series={modelSizeOptions.series} type="bar" height={280} />
        </Card>

         {/* Tabel Model */}
        <Card extra="w-full p-5">
          <h4 className="text-lg font-semibold mb-4">Daftar Model 3D</h4>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-navy-600">
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-white">NAMA</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-white">UKURAN</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-white">TANGGAL</th>
                </tr>
              </thead>
              <tbody>
                {models.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-sm text-gray-500">
                      Belum ada model.
                    </td>
                  </tr>
                ) : (
                  models.map((m) => (
                    <tr
                      key={m.filename}
                      className="border-b border-gray-100 dark:border-navy-700 cursor-move"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", m.fullUrl)}
                    >
                      <td className="px-3 py-2 text-sm">{m.name}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{m.sizeFormatted}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        {new Date(m.modifiedAt).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* === MODAL TAMBAH PRODUK === */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <Card extra="w-full max-w-lg p-6">
            <h3 className="text-lg font-bold mb-4">Tambah Produk Baru</h3>
            <div className="space-y-3">
              <input
                placeholder="SKU (contoh: OA-250)"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border rounded dark:bg-navy-700 dark:border-navy-600"
              />
              <input
                placeholder="Nama Produk"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full px-3 py-2 border rounded dark:bg-navy-700 dark:border-navy-600"
              />
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as "OIL" | "GENERAL" })}
                className="w-full px-3 py-2 border rounded dark:bg-navy-700 dark:border-navy-600"
              >
                <option value="GENERAL">GENERAL</option>
                <option value="OIL">OIL</option>
              </select>
              <input
                placeholder="Harga (contoh: 250000)"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="w-full px-3 py-2 border rounded dark:bg-navy-700 dark:border-navy-600"
              />
              <textarea
                placeholder="Deskripsi (opsional)"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border rounded dark:bg-navy-700 dark:border-navy-600"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={createProduct}
                className="flex-1 py-2 bg-brand-500 text-white rounded hover:bg-brand-600"
              >
                Simpan
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 dark:bg-navy-600 dark:text-white"
              >
                Batal
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;