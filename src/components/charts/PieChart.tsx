import MiniCalendar from "components/calendar/MiniCalendar";
import Widget from "components/widget/Widget";
import Card from "components/card";
import React, { useEffect, useMemo, useState } from "react";
import { MdQrCode, MdVisibility, MdHealthAndSafety, MdModelTraining, MdDownload } from "react-icons/md";
import { IoDocuments } from "react-icons/io5";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

// === TYPES ===
type Product = {
  id: number;
  sku: string;
  name: string;
  scanCount: number;
  category: "OIL" | "GENERAL";
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
  size: number;
};

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<ScanAnalytics | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [qrCount, setQrCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // === FETCH DATA ===
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [pRes, aRes, hRes, mRes, qrRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/scans/analytics"),
          fetch("/api/health"),
          fetch("/api/models"),
          fetch("/api/products/qr/generate-all", { method: "POST" }),
        ]);

        const [pJson, aJson, hJson, mJson, qrJson] = await Promise.all([
          pRes.json(),
          aRes.json(),
          hRes.json(),
          mRes.json(),
          qrRes.json(),
        ]);

        if (pJson.success) setProducts(pJson.data);
        if (aJson.success) setAnalytics(aJson.data);
        if (hJson.success) setHealth(hJson);
        if (mJson.success) setModels(mJson.data);
        if (qrJson.success) setQrCount(qrJson.data.length);
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  // === STATS ===
  const stats = useMemo(() => {
    const totalScans = analytics?.totalScans || 0;
    const totalProducts = products.length;
    const oilProducts = products.filter(p => p.category === "OIL").length;
    const totalModels = models.length;
    const totalModelSize = (models.reduce((a, m) => a + m.size, 0) / 1024 / 1024).toFixed(1);
    return { totalScans, totalProducts, oilProducts, totalModels, totalModelSize, qrCount };
  }, [analytics, products, models, qrCount]);

  // === BAR CHART: Top 5 Produk Ter-scan ===
  const barChartOptions: ApexOptions = {
    chart: { type: "bar", height: 350, toolbar: { show: false } },
    plotOptions: {
      bar: { horizontal: true, borderRadius: 8, columnWidth: "55%" },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: analytics?.topProducts.slice(0, 5).map(p => p.sku) || [],
      labels: { style: { fontSize: "12px" } },
    },
    yaxis: { title: { text: "Jumlah Scan" } },
    colors: ["#3B82F6"],
    tooltip: { y: { formatter: (val) => `${val} kali` } },
    grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
    title: { text: "Top 5 Produk Ter-scan", align: "left", style: { fontSize: "16px", fontWeight: 600 } },
  };

  const barChartSeries: ApexAxisChartSeries = [
    { name: "Scan Count", data: analytics?.topProducts.slice(0, 5).map(p => p.scanCount) || [] },
  ];

  // === DONUT CHART: Kategori ===
  const donutChartOptions: ApexOptions = {
    chart: { type: "donut" },
    labels: ["OIL", "GENERAL"],
    colors: ["#3B82F6", "#10B981"],
    legend: { position: "bottom" },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              color: "#6b7280",
            },
          },
        },
      },
    },
    title: { text: "Distribusi Kategori Produk", align: "left", style: { fontSize: "16px", fontWeight: 600 } },
  };

  const donutChartSeries: ApexNonAxisChartSeries = [
    stats.oilProducts,
    stats.totalProducts - stats.oilProducts,
  ];

  // === LOADING STATE ===
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      {/* === WIDGETS === */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
        <Widget icon={<MdQrCode className="h-7 w-7" />} title="Total Produk" subtitle={stats.totalProducts.toString()} />
        <Widget icon={<MdVisibility className="h-7 w-7 text-blue-500" />} title="Total Scan" subtitle={stats.totalScans.toString()} />
        <Widget icon={<MdModelTraining className="h-7 w-7 text-green-500" />} title="Model 3D" subtitle={stats.totalModels.toString()} />
        <Widget icon={<MdDownload className="h-7 w-7 text-purple-500" />} title="QR Generated" subtitle={stats.qrCount.toString()} />
        <Widget icon={<MdHealthAndSafety className="h-7 w-7 text-orange-500" />} title="Backend" subtitle={health?.success ? "Online" : "Offline"} />
        <Widget icon={<IoDocuments className="h-6 w-6" />} title="Storage Model" subtitle={`${stats.totalModelSize} MB`} />
      </div>

      {/* === CHARTS === */}
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Bar Chart */}
        <Card extra="p-5">
          <div className="h-80">
            <Chart
              options={barChartOptions}
              series={barChartSeries}
              type="bar"
              height="100%"
            />
          </div>
        </Card>

        {/* Donut Chart */}
        <Card extra="p-5">
          <div className="h-80">
            <Chart
              options={donutChartOptions}
              series={donutChartSeries}
              type="donut"
              height="100%"
            />
          </div>
        </Card>
      </div>

      {/* === TABEL & KALENDER === */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Tabel Produk Terbaru */}
        <Card extra="w-full p-5">
          <h4 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">Produk Terbaru</h4>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-navy-600">
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-white">SKU</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-white">NAMA</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 dark:text-white">SCAN</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .sort((a, b) => b.id - a.id)
                  .slice(0, 5)
                  .map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 dark:border-navy-700">
                      <td className="px-3 py-2 text-xs font-mono">{p.sku}</td>
                      <td className="px-3 py-2 text-sm max-w-xs truncate">{p.name}</td>
                      <td className="px-3 py-2 text-sm text-center">{p.scanCount}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Kalender + Status */}
        <div className="grid grid-cols-1 gap-5">
          <Card extra="p-5">
            <h4 className="mb-3 text-lg font-semibold text-navy-700 dark:text-white">Kalender</h4>
            <MiniCalendar />
          </Card>

          <Card extra="p-5">
            <h4 className="mb-3 text-lg font-semibold text-navy-700 dark:text-white">Status Sistem</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Backend</span>
                <span className={`font-medium ${health?.success ? "text-green-600" : "text-red-600"}`}>
                  {health?.success ? "Online" : "Offline"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Environment</span>
                <span className="font-medium">{health?.environment || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last Check</span>
                <span className="font-mono text-xs">
                  {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString("id-ID") : "-"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;