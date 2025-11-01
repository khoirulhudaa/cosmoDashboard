import Card from "components/card";
import Widget from "components/widget/Widget";
import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts"; // <-- langsung import
import {
    MdArticle,
    MdAssignment,
    MdHome,
    MdLocationCity,
    MdPeople,
    MdSwapHoriz,
    MdWarning,
} from "react-icons/md";

/* -------------------------------------------------------------------------- */
/*                               Demo / Persisted data                        */
/* -------------------------------------------------------------------------- */
const demoData = {
  kk_per_rt: { "01": 5, "02": 3, "03": 4, "04": 9, "05": 7, "06": 4, "07": 5, "08": 4, "09": 5, "10": 4 },
  kk_per_rw: { "01": 15, "02": 20, "03": 15 },
  num_kelurahan: 1,
  num_penerima_bantuan: 113,
  total_warga: 153,
  num_pindah: 57,
  num_meninggal: 49,
  num_kk_sementara: 23,
};

const StatistikPage: React.FC = () => {
  const [stats, setStats] = useState(demoData);

  /* --------------------------- localStorage sync -------------------------- */
  useEffect(() => {
    const saved = localStorage.getItem("statistikData");
    if (saved) {
      try { setStats(JSON.parse(saved)); }
      catch (e) { console.error("Parse statistik error:", e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("statistikData", JSON.stringify(stats));
  }, [stats]);

  /* ------------------------------- Helpers ------------------------------- */
  const totalKK = Object.values(stats.kk_per_rt).reduce((a, b) => a + b, 0);
  const wargaHidup = stats.total_warga - stats.num_pindah - stats.num_meninggal;
  const kkResmi = totalKK - stats.num_kk_sementara;

  return (
    <div >
      {/* ==================== Charts Grid ==================== */}
      <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ---------- 1. KK per RT – Bar ---------- */}
        <Card extra="p-6">
          <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Jumlah KK per RT
          </h4>
          <ApexCharts
            type="bar"
            height={300}
            series={[{ name: "KK", data: Object.values(stats.kk_per_rt) }]}
            options={{
              chart: { toolbar: { show: false } },
              plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
              dataLabels: { enabled: false },
              xaxis: {
                categories: Object.keys(stats.kk_per_rt).map((rt) => `RT ${rt}`),
                labels: { style: { colors: "#9CA3AF" } },
              },
              yaxis: { labels: { style: { colors: "#9CA3AF" } } },
              colors: ["#3B82F6"],
              tooltip: { theme: "dark" },
            }}
          />
        </Card>

        {/* ---------- 2. KK per RW – Donut ---------- */}
        <Card extra="p-6">
          <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Jumlah KK per RW
          </h4>
          <ApexCharts
            type="donut"
            height={300}
            series={Object.values(stats.kk_per_rw)}
            options={{
              labels: Object.keys(stats.kk_per_rw).map((rw) => `RW ${rw}`),
              colors: ["#10B981", "#F59E0B", "#EF4444"],
              legend: { position: "bottom", labels: { colors: "#9CA3AF" } },
              dataLabels: { enabled: false },
              plotOptions: { pie: { donut: { size: "65%" } } },
              tooltip: { theme: "dark" },
            }}
          />
        </Card>

        {/* ---------- 3. Status Penduduk – Pie ---------- */}
        <Card extra="p-6">
          <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Status Penduduk
          </h4>
          <ApexCharts
            type="pie"
            height={300}
            series={[wargaHidup, stats.num_pindah, stats.num_meninggal]}
            options={{
              labels: ["Hidup", "Pindah", "Meninggal"],
              colors: ["#10B981", "#F59E0B", "#EF4444"],
              legend: { position: "bottom", labels: { colors: "#9CA3AF" } },
              dataLabels: { enabled: true, style: { colors: ["#fff"] } },
              tooltip: { theme: "dark" },
            }}
          />
        </Card>

        {/* ---------- 4. Penerima Bantuan – Horizontal Bar ---------- */}
        <Card extra="p-6">
          <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Penerima Bantuan
          </h4>
          <ApexCharts
            type="bar"
            height={200}
            series={[{ name: "Jumlah", data: [stats.num_penerima_bantuan, stats.total_warga] }]}
            options={{
              chart: { toolbar: { show: false } },
              plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
              dataLabels: { enabled: false },
              xaxis: {
                categories: ["Penerima", "Total Warga"],
                labels: { style: { colors: "#9CA3AF" } },
              },
              colors: ["#10B981", "#6B7280"],
              tooltip: { theme: "dark" },
            }}
          />
        </Card>

        {/* ---------- 5. KK NIK Sementara – Radial Bar ---------- */}
        <Card extra="p-6">
          <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            KK NIK Sementara
          </h4>
          <ApexCharts
            type="radialBar"
            height={300}
            series={[Math.round((stats.num_kk_sementara / totalKK) * 100)]}
            options={{
              plotOptions: {
                radialBar: {
                  hollow: { size: "65%" },
                  track: { background: "#E5E7EB" },
                  dataLabels: {
                    show: true,
                    name: { show: false },
                    value: { fontSize: "20px", color: "#EF4444" },
                  },
                },
              },
              labels: ["Sementara"],
              colors: ["#EF4444"],
              tooltip: { enabled: false },
            }}
          />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {stats.num_kk_sementara} dari {totalKK} KK
            </p>
          </div>
        </Card>

        {/* ---------- 6. Kelurahan – Big Number ---------- */}
        <Card extra="p-6">
          <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Jumlah Kelurahan
          </h4>
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-6xl font-bold text-brand-600 dark:text-brand-400">
              {stats.num_kelurahan}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Kelurahan Aktif
            </p>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default StatistikPage;