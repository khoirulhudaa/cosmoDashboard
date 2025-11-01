import Card from "components/card";
import Widget from "components/widget/Widget";
import React, { useEffect, useState } from "react";
import { MdTrendingUp, MdVisibility, MdInfo } from "react-icons/md";

type Analytics = {
  totalScans: number;
  totalProducts: number;
  topProducts: { sku: string; name: string; scanCount: number }[];
};

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://vr.kiraproject.id/api/scans/analytics");
      const json = await res.json();
      if (json.success) {
        setAnalytics(json.data);
      } else {
        setAnalytics(null);
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  // === EMPTY STATE COMPONENT ===
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-navy-700">
        <MdInfo className="h-8 w-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-navy-700 dark:text-white">
        Data Belum Tersedia
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Belum ada aktivitas scan. Mulai gunakan QR code untuk melihat statistik.
      </p>
    </div>
  );

  // === LOADING STATE ===
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-500">Memuat analytics...</div>
      </div>
    );
  }

  // === KONDISI KOSONG ===
  const isEmpty = !analytics || 
    analytics.totalScans === 0 || 
    analytics.topProducts.length === 0;

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
      <div className="mt-8 flex items-center gap-3 ml-[1px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
          <MdTrendingUp className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold text-navy-700 dark:text-white">
          Scan Analytics & Tracking
        </h3>
      </div>

      {/* === KONTEN UTAMA === */}
      <div className="mt-5">
        {isEmpty ? (
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
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;