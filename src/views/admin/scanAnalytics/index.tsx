import Card from "components/card";
import Widget from "components/widget/Widget";
import React, { useEffect, useMemo, useState } from "react";
import { MdTrendingUp, MdVisibility, MdInfo, MdPlayArrow, MdTimer } from "react-icons/md";
import { v4 as uuidv4 } from "uuid";

type Analytics = {
  totalScans: number;
  totalProducts: number;
  topProducts: { sku: string; name: string; scanCount: number; productId: number }[];
};

type Product = {
  id: number;
  sku: string;
  name: string;
};

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanLoading, setScanLoading] = useState(false);
  const [lastScanId, setLastScanId] = useState<number | null>(null);
  const [showSimulate, setShowSimulate] = useState(false);

  const [scanForm, setScanForm] = useState({
    productId: 0,
    sessionId: uuidv4(),
    deviceInfo: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    location: "Jakarta, Indonesia",
    referer: "https://google.com",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "cosmo-launch",
  });

  const [updateForm, setUpdateForm] = useState({
    duration: 120,
    interacted: true,
  });

  useEffect(() => {
    // fetchAnalytics();
    fetchProducts();
  }, []);

  // const fetchAnalytics = async () => {
  //   try {
  //     const res = await fetch("https://vr.kiraproject.id/api/scans/analytics");
  //     const json = await res.json();
  //     if (json.success) {
  //       // Pastikan topProducts punya productId
  //       const enriched = {
  //         ...json.data,
  //         topProducts: json.data.topProducts.map((p: any) => ({
  //           ...p,
  //           productId: p.productId || 1, // fallback jika tidak ada
  //         })),
  //       };
  //       setAnalytics(enriched);
  //     }
  //   } catch (err) {
  //     console.error("Failed to fetch analytics", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchProducts = async () => {
    try {
      const res = await fetch("https://vr.kiraproject.id/api/products");
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  // === SIMULASI SCAN ===
  const simulateScan = async () => {
    if (!scanForm.productId) return alert("Pilih produk terlebih dahulu");

    setScanLoading(true);
    try {
      const res = await fetch("https://vr.kiraproject.id/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scanForm),
      });
      const json = await res.json();
      if (json.success) {
        setLastScanId(json.data.id);
        alert(`Scan berhasil! ID: ${json.data.id}`);
        // fetchAnalytics();
      } else {
        alert(json.message || "Gagal mencatat scan");
      }
    } catch (err) {
      alert("Error jaringan");
    } finally {
      setScanLoading(false);
    }
  };

  // === UPDATE INTERAKSI ===
  const updateInteraction = async () => {
    if (!lastScanId) return;

    try {
      const res = await fetch(`https://vr.kiraproject.id/api/scans/${lastScanId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateForm),
      });
      const json = await res.json();
      if (json.success) {
        alert("Interaksi diperbarui!");
        // fetchAnalytics();
      }
    } catch (err) {
      alert("Gagal update");
    }
  };

  // === EMPTY STATE ===
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-navy-700">
        <MdInfo className="h-8 w-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-navy-700 dark:text-white">
        Data Belum Tersedia
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Belum ada aktivitas scan. Gunakan tombol simulasi di bawah untuk testing.
      </p>
    </div>
  );

  // if (loading) {
  //   return (
  //     <div className="flex h-64 items-center justify-center">
  //       <div className="text-lg text-gray-500">Memuat analytics...</div>
  //     </div>
  //   );
  // }

  const isEmpty = !analytics || analytics.totalScans === 0;

  return (
    <div>
      {/* === WIDGETS === */}
      <div className="mt-0 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Widget
          icon={<MdVisibility className="h-7 w-7" />}
          title="Total Scan"
          subtitle={analytics?.totalScans.toString() ?? "0"}
        />
        <Widget
          icon={<MdTrendingUp className="h-7 w-7 text-green-500" />}
          title="Produk Ter-scan"
          subtitle={analytics?.topProducts[0]?.name || "-"}
        />
        <Widget
          icon={<MdVisibility className="h-7 w-7 text-blue-500" />}
          title="Total Produk"
          subtitle={analytics?.totalProducts.toString() ?? "0"}
        />
      </div>

      {/* === HEADER === */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-3 ml-[1px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
            <MdTrendingUp className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">
            Scan Analytics & Tracking
          </h3>
        </div>
        <button
          onClick={() => setShowSimulate(!showSimulate)}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 text-sm"
        >
          <MdPlayArrow className="h-5 w-5" />
          Simulasi Scan
        </button>
      </div>

      {/* === SIMULASI SCAN FORM === */}
      {showSimulate && (
        <Card extra="mt-5 p-5">
          <h4 className="mb-4 text-lg font-semibold">Simulasi Scan QR</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Produk</label>
              <select
                value={scanForm.productId}
                onChange={(e) => setScanForm({ ...scanForm, productId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded dark:bg-navy-700 dark:border-navy-600"
              >
                <option value="">Pilih Produk</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} - {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Session ID</label>
              <input
                value={scanForm.sessionId}
                readOnly
                className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-navy-800 dark:border-navy-600 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Device Info</label>
              <input
                value={scanForm.deviceInfo}
                onChange={(e) => setScanForm({ ...scanForm, deviceInfo: e.target.value })}
                className="w-full px-3 py-2 border rounded dark:bg-navy-700 dark:border-navy-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lokasi</label>
              <input
                value={scanForm.location}
                onChange={(e) => setScanForm({ ...scanForm, location: e.target.value })}
                className="w-full px-3 py-2 border rounded dark:bg-navy-700 dark:border-navy-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Referer</label>
              <input
                value={scanForm.referer}
                onChange={(e) => setScanForm({ ...scanForm, referer: e.target.value })}
                className="w-full px-3 py-2 border rounded dark:bg-navy-700 dark:border-navy-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">UTM Source</label>
              <input
                value={scanForm.utmSource}
                onChange={(e) => setScanForm({ ...scanForm, utmSource: e.target.value })}
                className="w-full px-3 py-2 border rounded dark:bg-navy-700 dark:border-navy-600"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={simulateScan}
              disabled={scanLoading}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600 disabled:opacity-50"
            >
              <MdPlayArrow /> {scanLoading ? "Mencatat..." : "Catat Scan"}
            </button>
            {lastScanId && (
              <button
                onClick={updateInteraction}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                <MdTimer /> Update Interaksi ({updateForm.duration}s)
              </button>
            )}
          </div>
        </Card>
      )}

      {/* === KONTEN UTAMA === */}
      <div className="mt-5">
         {!isEmpty && (
          <Card extra="w-full p-5">
            <h4 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">
              Top 5 Produk Ter-scan
            </h4>
            <div className="space-y-3">
              {analytics!.topProducts.slice(0, 5).map((p, i) => (
                <div
                  key={p.sku}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-navy-800 transition hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                      #{i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-navy-700 dark:text-white">{p.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{p.sku}</p>
                    </div>
                  </div>
                  <span className="font-bold text-brand-500">{p.scanCount} scan</span>
                </div>
              ))}
            </div>
          </Card>
        )}
        {/* {isEmpty ? (
          <Card extra="w-full p-8">
            <EmptyState />
          </Card>
        ) : (
          <Card extra="w-full p-5">
            <h4 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">
              Top 5 Produk Ter-scan
            </h4>
            <div className="space-y-3">
              {analytics!.topProducts.slice(0, 5).map((p, i) => (
                <div
                  key={p.sku}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-navy-800 transition hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                      #{i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-navy-700 dark:text-white">{p.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{p.sku}</p>
                    </div>
                  </div>
                  <span className="font-bold text-brand-500">{p.scanCount} scan</span>
                </div>
              ))}
            </div>
          </Card>
        )} */}
      </div>
    </div>
  );
};

export default AnalyticsPage;