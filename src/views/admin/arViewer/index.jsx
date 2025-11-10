// src/pages/public/ARViewer.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ARViewerQrCode() {
  const { sku } = useParams();
  const [modelUrl, setModelUrl] = useState(null);
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!sku) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`https://vr.kiraproject.id/api/products/${sku}`);
        const json = await res.json();

        if (json.success && json.data.modelUrl) {
          setModelUrl(json.data.modelUrl);
          setProductName(json.data.name || sku);

          // Track scan
          await fetch('https://vr.kiraproject.id/api/scans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: json.data.id,
              sessionId: crypto.randomUUID(),
              deviceInfo: navigator.userAgent,
              referer: document.referrer,
            }),
          });
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [sku]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
          <p className="mt-6 text-lg font-medium text-gray-700">Memuat Model 3D...</p>
        </div>
      </div>
    );
  }

  if (error || !modelUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <p className="text-xl font-bold text-red-600">Model Tidak Ditemukan</p>
      </div>
    );
  }

  return (
    <>
      <model-viewer
        src={modelUrl}
        alt={productName}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="auto"
        camera-controls
        auto-rotate
        shadow-intensity="1.5"
        exposure="1"
        style={{ width: '100%', height: '100vh', background: '#f0f9ff' }}
        on-ar-status={(e) => {
          if (e.detail.status === 'session-started') {
            fetch('https://vr.kiraproject.id/api/scans', {
              method: 'POST',
              body: JSON.stringify({ productId: sku, interacted: true }),
            });
          }
        }}
      >
        <button
          slot="ar-button"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-full shadow-2xl text-lg flex items-center gap-2"
        >
          Lihat di AR
        </button>

        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur p-4 rounded-2xl shadow-xl">
          <h1 className="text-xl font-bold text-gray-800">{productName}</h1>
          <p className="text-xs text-gray-600">SKU: {sku}</p>
        </div>
      </model-viewer>
    </>
  );
}