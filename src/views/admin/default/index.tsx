import Card from "components/card";
import Widget from "components/widget/Widget";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IoDocuments } from "react-icons/io5";
import { MdAdd, MdHealthAndSafety, MdLink, MdModelTraining, MdQrCode } from "react-icons/md";

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  // Form state untuk tambah produk
  const [newProduct, setNewProduct] = useState({
    sku: "",
    name: "",
    category: "GENERAL" as "OIL" | "GENERAL",
    description: "",
    price: "",
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;

  // === REDIRECT JIKA TIDAK ADA TOKEN ===
  useEffect(() => {
    if (!token || !user) {
      window.location.href = "/auth/sign-in";
    }
  }, [token, user]);

  // === FETCH DATA ===
  const fetchAll = useCallback(async () => {
    setLoading(true);
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
      console.error("Dashboard load failed", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
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
      }
    } catch (err) {
      alert("Gagal tambah produk");
    }
  };

  // === ASSIGN MODEL VIA DRAG & DROP ===
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
      if (json.success) {
        fetchAll();
      }
    } catch (err) {
      alert("Gagal assign model");
    }
  };

  // === STATS ===
  const stats = useMemo(() => {
    const totalScans = analytics?.totalScans || 0;
    const totalProducts = products.length;
    const oilProducts = products.filter(p => p.category === "OIL").length;
    const totalModels = models.length;
    const totalModelSize = (models.reduce((a, m) => a + m.size, 0) / 1024 / 1024).toFixed(1);
    return { totalScans, totalProducts, oilProducts, totalModels, totalModelSize, totalAdmins: adminUsers.length };
  }, [analytics, products, models, adminUsers]);

  // === LOADING ===
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-500">Memuat dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      {/* === WIDGETS === */}
      <div className="mt-0 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-6">
        <Widget icon={<MdQrCode className="h-7 w-7" />} title="Total Produk" subtitle={stats.totalProducts.toString()} />
        {/* <Widget icon={<MdVisibility className="h-7 w-7 text-blue-500" />} title="Total Scan" subtitle={stats.totalScans.toString()} /> */}
        <Widget icon={<MdModelTraining className="h-7 w-7 text-green-500" />} title="Model 3D" subtitle={stats.totalModels.toString()} />
        {/* <Widget
          icon={<MdDownload className="h-7 w-7 text-purple-500" />}
          title="QR Generated"
          subtitle={qrCount.toString()}
          extra={
            <button
              onClick={generateAllQR}
              disabled={generatingQR}
              className="ml-2 text-xs px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {generatingQR ? "..." : "Generate All"}
            </button>
          }
        /> */}
        <Widget icon={<MdHealthAndSafety className="h-7 w-7 text-orange-500" />} title="Backend" subtitle={health?.success ? "Online" : "Offline"} />
        <Widget icon={<IoDocuments className="h-6 w-6" />} title="Storage Model" subtitle={`${stats.totalModelSize} MB`} />
      </div>

      {/* === CHARTS === */}
      {/* <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card extra="p-5">
          <div className="h-80">
            <Chart options={barChartOptions} series={barChartSeries} type="bar" height="100%" />
          </div>
        </Card>
        <Card extra="p-5">
          <div className="h-80">
            <Chart options={donutChartOptions} series={donutChartSeries} type="donut" height="100%" />
          </div>
        </Card>
      </div> */}

      {/* === TABEL PRODUK & ADMIN === */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-1">
        {/* Tabel Produk */}
        <Card extra="w-full p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-navy-700 dark:text-white">Produk Terbaru</h4>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 text-xs px-3 py-1 bg-brand-500 text-white rounded hover:bg-brand-600"
            >
              <MdAdd /> Tambah
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-navy-600">
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-white">SKU</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-white">NAMA</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-white">HARGA</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-white">MODEL</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-white">QR</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-white">SCAN</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .sort((a, b) => b.id - a.id)
                  .slice(0, 5)
                  .map((p) => (
                    <tr
                      key={p.id}
                      className={`border-b border-gray-100 dark:border-navy-700 ${
                        dragOverId === p.id ? "bg-blue-50 dark:bg-navy-700" : ""
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverId(p.id);
                      }}
                      onDragLeave={() => setDragOverId(null)}
                      onDrop={(e) => handleDrop(e, p.id)}
                    >
                      <td className="px-3 py-2 text-xs font-mono">{p.sku}</td>
                      <td className="px-3 py-2 text-sm max-w-xs truncate">{p.name}</td>
                      <td className="px-3 py-2 text-sm">
                        {p.price ? `Rp ${parseInt(p.price).toLocaleString("id-ID")}` : "-"}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {p.modelUrl ? (
                          <a href={p.modelUrl} target="_blank" className="text-green-600 hover:underline flex items-center gap-1">
                            <MdLink className="w-3 h-3" /> Ada
                          </a>
                        ) : (
                          <span className="text-gray-400">Drop model di sini</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {p.qrCodeUrl ? (
                          <img src={p.qrCodeUrl} alt="QR" className="w-8 h-8" />
                        ) : (
                          <span className="text-xs text-gray-400">Belum</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm text-center">{p.scanCount}</td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Drag & Drop Helper */}
            <div className="mt-3 p-3 bg-gray-50 dark:bg-navy-800 rounded text-xs text-gray-600 dark:text-gray-400">
              <strong>Tip:</strong> Drag model dari halaman <strong>Models</strong> ke baris produk untuk assign 3D model.
            </div>
          </div>
        </Card>

        {/* Tabel Admin */}
        {token && (
          <Card extra="w-full p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-navy-700 dark:text-white">Data Admin</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-navy-600">
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-white">NAMA</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-white">EMAIL</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-white">ROLE</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-white">STATUS</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-white">DIBUAT</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-sm text-gray-500">
                        Belum ada admin terdaftar.
                      </td>
                    </tr>
                  ) : (
                    adminUsers.map((admin) => (
                      <tr key={admin.id} className="border-b border-gray-100 dark:border-navy-700">
                        <td className="px-3 py-2 text-sm font-medium">{admin.name}</td>
                        <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">{admin.email}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                              admin.role === "SUPER_ADMIN"
                                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            }`}
                          >
                            {admin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              admin.isActive
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {admin.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500">
                          {new Date(admin.createdAt).toLocaleDateString("id-ID")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
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