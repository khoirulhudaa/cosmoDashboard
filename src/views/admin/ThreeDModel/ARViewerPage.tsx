// src/views/admin/ARViewerPage.tsx
import React, { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { useSearchParams } from "react-router-dom";
import ThreeDModel from "../ThreeDModel";

interface ProductModel {
  sku: string;
  name: string;
  modelUrl: string; // full URL ke .glb
}

const ARViewerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sku = searchParams.get("sku");
  const [product, setProduct] = useState<ProductModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sku) {
      setError("SKU tidak ditemukan di URL");
      setLoading(false);
      return;
    }

    // Ambil data produk berdasarkan SKU
    const fetchProductModel = async () => {
      try {
        const res = await fetch(`https://vr.kiraproject.id/api/products/qr/model?sku=${sku}`);
        const json = await res.json();

        if (json.success && json.data) {
          setProduct(json.data);
        } else {
          setError("Model tidak ditemukan untuk SKU ini");
        }
      } catch (err) {
        setError("Gagal memuat model");
      } finally {
        setLoading(false);
      }
    };

    fetchProductModel();
  }, [sku]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-xl">Memuat model 3D...</div>;
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-red-500">{error || "Produk tidak ditemukan"}</p>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-600"
        >
          Tutup
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/70 to-transparent text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{product.name}</h2>
            <p className="text-sm opacity-80">SKU: {product.sku}</p>
          </div>
          <button
            onClick={() => window.close()}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3D Viewer */}
      <div className="flex-1">
        <ThreeDModel
          url={product.modelUrl.replace(/^http:/, "https:")}
          onLoaded={() => {}}
          cameraPosition={[0, 0, 5]}
          maxDistance={300}
          autoRotate={true}
        />
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white text-center text-xs">
        <p>Geser untuk memutar • Cubit untuk zoom</p>
      </div>
    </div>
  );
};

export default ARViewerPage;