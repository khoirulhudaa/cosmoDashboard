import Card from 'components/card';
import Widget from 'components/widget/Widget';
import { useEffect, useMemo, useState } from 'react';
import { MdClose, MdDownload, MdQrCode, MdRefresh, MdSearch } from 'react-icons/md';
import { generateQRWithLogo } from 'utils';
import ThreeDModel from '../ThreeDModel';

type Product = {
  sku: string;
  name: string;
};

type QRItem = {
  sku: string;
  name: string;
  qrCode: string | null;
  url: string;
};

const QRCodesPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [qrs, setQRs] = useState<QRItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);

  const token = localStorage.getItem('token');

  // === CEK LOGIN ===
  useEffect(() => {
    if (!token) {
      window.location.href = '/auth/sign-in';
    } else {
      fetchProducts();
    }
  }, []);

  // === AMBIL PRODUK (hanya SKU + name) ===
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://vr.kiraproject.id/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setProducts(json.data.map((p: any) => ({ sku: p.sku, name: p.name })));
      }
    } catch (err) {
      alert('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  // === GENERATE QR DARI SKU (Manual) ===
  useEffect(() => {
    const generateAllQRs = async () => {
      const baseUrl = 'https://cosmo-dashboard-3d.vercel.app/ar';
      const qrList: QRItem[] = [];

      for (const product of products) {
        const url = `${baseUrl}/${product.sku}`;
        let qrCode: string | null = null;

        try {
          qrCode = await generateQRWithLogo(url, '/logo.jpg');
        } catch (err) {
          console.warn(`Gagal generate QR untuk ${product.sku}`, err);
        }

        qrList.push({
          sku: product.sku,
          name: product.name,
          qrCode,
          url,
        });
      }

      setQRs(qrList);
    };

    if (products.length > 0) {
      generateAllQRs();
    }
  }, [products]);

  // === FILTER ===
  const filteredData = useMemo(() => {
    return qrs.filter(
      (q) =>
        q.sku.toLowerCase().includes(search.toLowerCase()) ||
        q.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [qrs, search]);

  // === DOWNLOAD ===
  const downloadQR = (base64: string, sku: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = `COSMO-QR-${sku}.png`;
    link.click();
  };

  // === PREVIEW 3D ===
  const openARView = async (sku: string) => {
    setIsModelLoading(true);
    setIsModalOpen(true);
    try {
      const res = await fetch(`https://vr.kiraproject.id/api/products/${sku}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setSelectedProduct(json.data);
      else setIsModalOpen(false);
    } catch {
      alert('Gagal memuat model');
      setIsModalOpen(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setIsModelLoading(false);
  };

  return (
    <div className="p-6">
      {/* Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Widget icon={<MdQrCode className="h-7 w-7" />} title="Total QR" subtitle={qrs.length} />
        <Widget icon={<MdRefresh className="h-7 w-7 text-green-500" />} title="Status" subtitle={loading ? 'Loading...' : 'Ready'} />
      </div>

      {/* Header */}
      <div className="mt-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
            <MdQrCode className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold">QR Code Management</h3>
        </div>
        <button
          onClick={fetchProducts}
          disabled={loading}
          className="flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 disabled:opacity-50"
        >
          <MdRefresh className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mt-5 relative">
        <MdSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari SKU atau nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      {/* Grid QR */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredData.map((qr) => (
          <Card key={qr.sku}>
            <div className="flex flex-col items-center p-4">
              {qr.qrCode ? (
                <img src={qr.qrCode} alt={qr.sku} className="w-32 h-32 mb-3" />
              ) : (
                <div className="w-32 h-32 bg-gray-200 border-2 border-dashed rounded-xl mb-3 flex items-center justify-center">
                  <span className="text-xs text-gray-500">Generating...</span>
                </div>
              )}
              <p className="font-medium text-sm">{qr.sku}</p>
              <p className="text-xs text-gray-600 text-center truncate w-full">{qr.name}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => qr.qrCode && downloadQR(qr.qrCode, qr.sku)}
                  disabled={!qr.qrCode}
                  className="text-xs px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1 disabled:opacity-50"
                >
                  <MdDownload className="h-4 w-4" /> Download
                </button>
                <button
                  onClick={() => openARView(qr.sku)}
                  className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Preview 3D
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* MODAL 3D */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-6xl bg-white dark:bg-navy-800 rounded-xl shadow-2xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">Preview 3D: {selectedProduct.name}</h3>
              <button onClick={closeModal} className="p-2 bg-red-500 text-white rounded-full">
                <MdClose className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex-1 overflow-hidden bg-gray-50">
              {isModelLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                </div>
              )}
              <ThreeDModel
                url={selectedProduct.modelUrl}
                onLoaded={() => setIsModelLoading(false)}
                cameraPosition={[0, 1, 3]}
                autoRotate={true}
              />
            </div>
            <div className="p-3 text-center text-xs border-t">
              Gunakan mouse untuk memutar • Scroll untuk zoom
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodesPage;