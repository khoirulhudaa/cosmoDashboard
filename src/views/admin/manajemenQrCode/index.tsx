import Card from "components/card";
import Widget from "components/widget/Widget";
import React, { useEffect, useMemo, useState } from "react";
import { MdDownload, MdQrCode, MdRefresh, MdSearch } from "react-icons/md";

type QRItem = {
  sku: string;
  name: string;
  qrCode: string;
  url: string;
};

const QRCodesPage: React.FC = () => {
  const [qrs, setQRs] = useState<QRItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateAllQRs();
  }, []);

  const generateAllQRs = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://vr.kiraproject.id/api/products/qr/generate-all", { method: "POST" });
      const json = await res.json();
      if (json.success) setQRs(json.data);
    } catch (err) {
      alert("Gagal generate QR");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return qrs.filter((q) =>
      q.sku.toLowerCase().includes(search.toLowerCase()) ||
      q.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [qrs, search]);

  const downloadQR = (base64: string, sku: string) => {
    const link = document.createElement("a");
    link.href = base64;
    link.download = `QR-${sku}.png`;
    link.click();
  };

  return (
    <div>
      {/* Widget */}
      <div className="mt-0 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Widget icon={<MdQrCode className="h-7 w-7" />} title="Total QR" subtitle={qrs.length.toString()} />
        <Widget icon={<MdRefresh className="h-7 w-7 text-green-500" />} title="Status" subtitle={loading ? "Generating..." : "Ready"} />
      </div>

      {/* Header */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 ml-[1px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
            <MdQrCode className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">QR Code Management</h3>
        </div>
        <button
          onClick={generateAllQRs}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:opacity-50"
        >
          <MdRefresh className="h-5 w-5" />
          Generate Ulang Semua
        </button>
      </div>

      {/* Search */}
      <div className="mt-5">
        <div className="relative">
          <MdSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari SKU atau nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
          />
        </div>
      </div>

      {/* Grid QR */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredData.map((qr) => (
          <Card key={qr.sku} extra="p-4">
            <div className="flex flex-col items-center">
              <img src={qr.qrCode} alt={qr.sku} className="w-32 h-32 mb-3" />
              <p className="font-medium text-sm">{qr.sku}</p>
              <p className="text-xs text-gray-600 truncate w-full text-center">{qr.name}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => downloadQR(qr.qrCode, qr.sku)}
                  className="flex items-center gap-1 text-xs px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 dark:bg-navy-700 dark:hover:bg-navy-600"
                >
                  <MdDownload className="h-4 w-4" />
                  Download
                </button>
                {/* <a
                  href={qr.url}
                  target="_blank"
                  className="text-xs px-3 py-1 bg-brand-500 text-white rounded hover:bg-brand-600"
                >
                  AR View
                </a> */}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QRCodesPage;