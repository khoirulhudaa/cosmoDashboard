// src/pages/public/ARViewer.jsx
import '@google/model-viewer';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, Camera, Check, Download, Home, Info, Link, Share2, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ARViewerQrCode() {
  const { sku } = useParams();
  const modelViewerRef = useRef(null);

  const [modelUrl, setModelUrl] = useState(null);
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [arStatus, setArStatus] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareStatus, setShareStatus] = useState('');

  // Zoom
  const [cameraDistance, setCameraDistance] = useState(2);
  const minDistance = 0.5;
  const maxDistance = 10;

  // Format nama produk
  const formatName = (str) => {
    if (!str) return '';
    return str
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // === FETCH PRODUCT ===
  useEffect(() => {
    if (!sku) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`https://vr.kiraproject.id/api/products/${sku}`);
        const json = await res.json();

        if (json.success && json.data.modelUrl) {
          let secureModelUrl = json.data.modelUrl;

          // PAKSA HTTPS
          if (secureModelUrl.startsWith('http://')) {
            secureModelUrl = 'https://' + secureModelUrl.slice(7);
          }
          secureModelUrl = secureModelUrl.replace(/^http:/, 'https:');

          setModelUrl(secureModelUrl);
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
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [sku]);

  // === MODEL VIEWER EVENTS ===
  useEffect(() => {
    const viewer = modelViewerRef.current;
    if (!viewer || !modelUrl) return;

    const handleLoad = () => {
      setLoading(false);
      setLoadError(null);
    };

    const handleError = (e) => {
      const msg = e.detail?.sourceError?.message || 'Gagal memuat model 3D';
      setLoadError(msg);
      setLoading(false);
    };

    const handleARStatus = (e) => {
      setArStatus(e.detail.status);
      if (e.detail.status === 'session-started') {
        fetch('https://vr.kiraproject.id/api/scans', {
          method: 'POST',
          body: JSON.stringify({ productId: sku, interacted: true }),
        });
      }
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);
    viewer.addEventListener('ar-status', handleARStatus);

    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
      viewer.removeEventListener('ar-status', handleARStatus);
    };
  }, [modelUrl, sku]);

  // === UPDATE CAMERA ===
  useEffect(() => {
    const viewer = modelViewerRef.current;
    if (viewer && !loading && !loadError) {
      viewer.cameraOrbit = `0deg 75deg ${cameraDistance}m`;
      viewer.fieldOfView = '30deg';
    }
  }, [cameraDistance, loading, loadError]);

  // === PINCH ZOOM ===
  useEffect(() => {
    const viewer = modelViewerRef.current;
    if (!viewer || loading || loadError) return;

    let startDistance = 0;
    let isPinching = false;

    const getPinchDistance = (touches) => {
      const [t1, t2] = touches;
      return Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        isPinching = true;
        startDistance = getPinchDistance(e.touches);
      }
    };

    const handleTouchMove = (e) => {
      if (isPinching && e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = getPinchDistance(e.touches);
        const delta = startDistance - currentDistance;
        const newDistance = cameraDistance + delta * 0.001;

        setCameraDistance(prev => Math.max(minDistance, Math.min(maxDistance, newDistance)));
        startDistance = currentDistance;
      }
    };

    const handleTouchEnd = () => {
      isPinching = false;
    };

    viewer.addEventListener('touchstart', handleTouchStart, { passive: false });
    viewer.addEventListener('touchmove', handleTouchMove, { passive: false });
    viewer.addEventListener('touchend', handleTouchEnd);

    return () => {
      viewer.removeEventListener('touchstart', handleTouchStart);
      viewer.removeEventListener('touchmove', handleTouchMove);
      viewer.removeEventListener('touchend', handleTouchEnd);
    };
  }, [cameraDistance, loading, loadError]);

  // === FUNGSI AR (HANYA DARI TOMBOL KLIK) ===
  const startAR = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.activateAR();
    }
  };

  // === DOWNLOAD ===
  const handleDownload = async () => {
    if (!modelUrl) return;
    setDownloading(true);
    try {
      const response = await fetch(modelUrl, { mode: 'cors' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const fileName = modelUrl.split('/').pop()?.split('?')[0] || 'model.glb';
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Gagal download: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  // === SHARE ===
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(modelUrl);
      setShareStatus('copied');
      setTimeout(() => setShareStatus(''), 2000);
    } catch {
      alert('Gagal salin link');
    }
  };

  const shareToWhatsApp = () => {
    const text = `Lihat produk ${productName}: ${modelUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const isARActive = arStatus === 'session-started';

  // === RENDER: LOADING ===
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

  // === RENDER: ERROR ===
  if (error || !modelUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <p className="text-xl font-bold text-red-600">Model Tidak Ditemukan</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-black to-cyan-950 text-white p-6">
        <Info className="w-12 h-12 text-yellow-400 mb-4" />
        <h3 className="text-xl font-bold mb-2">Gagal Memuat Model</h3>
        <p className="text-sm text-center max-w-md mb-4">{loadError}</p>
        <div className="flex gap-3">
          <button onClick={handleDownload} className="px-5 py-2 bg-emerald-600 rounded-full text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Download
          </button>
          <button onClick={() => window.history.back()} className="px-5 py-2 bg-cyan-600 rounded-full text-sm flex items-center gap-2">
            <Home className="w-4 h-4" /> Kembali
          </button>
        </div>
      </div>
    );
  }

  // === RENDER UTAMA ===
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-black via-cyan-950 to-black">

      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 255, 255, 0.5) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 255, 255, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            backgroundPosition: 'center bottom',
            transform: 'perspective(300px) rotateX(45deg) scale(3.2) translateY(0%)',
            transformOrigin: 'center bottom',
            animation: 'gridMove 18s linear infinite',
            filter: 'brightness(1.3)',
          }}
        />
      </div>

      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl opacity-10 animate-pulse" />
      </div>

      {/* MODEL VIEWER */}
      <model-viewer
        ref={modelViewerRef}
        src={modelUrl}
        alt={productName}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="auto"
        ar-placement="floor"
        camera-controls
        auto-rotate
        shadow-intensity="1.5"
        exposure="1.0"
        field-of-view="30deg"
        interaction-prompt="none"
        crossorigin="anonymous"
        loading="eager"
        touch-action="none"
        ar-tracking="true"
        style={{ 
          width: '100%', 
          height: '100%',
          background: 'linear-gradient(to bottom, #000000, #0e7490, #000000)',
        }}
      >
        {/* POSTER */}
        <div slot="poster" className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-900 to-cyan-800">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="font-medium">Memuat 3D...</p>
          </div>
        </div>

        {/* TOMBOL AR - HANYA SLOT, TANPA onClick! */}
        {/* <button
          slot="ar-button"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-full shadow-2xl text-lg flex items-center gap-2"
        >
          <Box className="w-5 h-5" />
          Lihat di AR
        </button> */}

        {/* INFO PRODUK */}
      </model-viewer>

      {/* STATUS BAR */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[94vw] z-50 pointer-events-none">
        <div className="max-w-full mx-auto backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-2 shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-md py-1.5 px-3">
              <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-white text-xs md:text-sm">
                {formatName(productName)}
              </span>
            </div>

            <div className="flex md:justify-end justify-center w-full md:w-max items-center gap-2">
              <AnimatePresence mode="wait">
                {isARActive ? (
                  <motion.button
                    key="exit"
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                    onClick={() => window.history.back()}
                    className="bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 px-4 rounded-full text-xs flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" /> Keluar
                  </motion.button>
                ) : (
                  <motion.button
                    key="ar"
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                    onClick={startAR} // ← VALID USER GESTURE
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2.5 px-2.5 rounded-full text-xs flex items-center gap-1"
                  >
                    <Box className="w-3.5 h-3.5" /> PREVIEW AR
                  </motion.button>
                )}
              </AnimatePresence>

              <button onClick={() => window.history.back()} className="p-2.5 bg-white/10 rounded-full">
                <Home className="w-4 h-4 text-white" />
              </button>

              <button onClick={handleDownload} disabled={downloading} className="p-2.5 bg-white/10 rounded-full disabled:opacity-50">
                {downloading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4 text-white" />}
              </button>

              <div className="relative">
                <button onClick={() => setShowShareMenu(!showShareMenu)} className="p-2.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
                  <Share2 className="w-4 h-4 text-white" />
                </button>
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full right-0 mt-3 w-40 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl shadow-xl text-xs"
                    >
                      <button onClick={copyToClipboard} className="w-full px-3 py-2.5 flex items-center gap-2 text-white hover:bg-white/20">
                        {shareStatus === 'copied' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Link className="w-3.5 h-3.5" />}
                        {shareStatus === 'copied' ? 'Tersalin!' : 'Salin Link'}
                      </button>
                      <button onClick={shareToWhatsApp} className="w-full px-3 py-2.5 flex items-center gap-2 text-white hover:bg-white/20 border-t border-white/20">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.884 3.488" /></svg>
                        WhatsApp
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}