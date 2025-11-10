// src/views/admin/ModelsPage.tsx
import Card from "components/card";
import Widget from "components/widget/Widget";
import React, {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IoMdEye } from "react-icons/io";
import { MdClose, MdSearch, MdVisibility } from "react-icons/md";

const ThreeDModel = lazy(() => import("../ThreeDModel"));

type Model = {
  filename: string;
  name: string;
  size: number;
  sizeFormatted: string;
  url: string;
  fullUrl: string;
  modifiedAt: string;
};

export interface ThreeDModelRef {
  resetCamera: () => void;
}

const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [search, setSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // Kontrol kamera
  const modelRef = useRef<ThreeDModelRef>(null);
  const [cameraPos, setCameraPos] = useState<[number, number, number]>([0, 0, 5]);
  const [maxDist, setMaxDist] = useState(350);
  const [autoRotate, setAutoRotate] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;

  // === REDIRECT JIKA TIDAK ADA TOKEN ===
  useEffect(() => {
    if (!token || !user) {
      window.location.href = "/auth/sign-in";
    }
  }, [token, user]);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await fetch("https://vr.kiraproject.id/api/models");
      const json = await res.json();
      if (json.success) {
        const secureModels = json.data.map((model: any) => ({
          ...model,
          fullUrl: model.fullUrl.replace(/^http:/, 'https:'),
        }));
        setModels(secureModels);
      }
    } catch (err) {
      console.error("Failed to fetch models", err);
    }
  };

  const filteredData = useMemo(() => {
    return models.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.filename.toLowerCase().includes(search.toLowerCase())
    );
  }, [models, search]);

  const stats: any = useMemo(() => {
    const total = models.length;
    const totalSize = models.reduce((acc, m) => acc + m.size, 0);
    return { total, totalSize: (totalSize / 1024 / 1024).toFixed(1) };
  }, [models]);

  const formatDate = (date: string) => new Date(date).toLocaleDateString("id-ID");

  const openModal = (model: Model) => {
    setSelectedModel(model);
    setIsModalOpen(true);
    setIsLoading(true);
    setCameraPos([0, 0, 5]);
    setMaxDist(150);
    setAutoRotate(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedModel(null);
    setIsLoading(false);
    setLoadProgress(0);
  };

  const handleCameraChange = (pos: [number, number, number], maxD: number) => {
    setCameraPos(pos.map((p) => Number(p.toFixed(2))) as [number, number, number]);
    setMaxDist(maxD);
  };

  const resetCamera = () => {
    modelRef.current?.resetCamera();
  };

  // Loader Modern (tanpa progress bar)
  const Loader = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-navy-800/80 z-10 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4 p-8 bg-white dark:bg-navy-700 rounded-2xl shadow-2xl">
        {/* Spinner Modern */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-navy-600"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>

        {/* Teks dengan animasi pulse */}
        <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>Memuat model 3D</span>
          <span className="flex space-x-1">
            <span className="animate-bounce">.</span>
            <span className="animate-bounce delay-100">.</span>
            <span className="animate-bounce delay-200">.</span>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Widget */}
      <div className="mt-0 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Widget
          icon={<MdVisibility className="h-7 w-7" />}
          title="Total Model"
          subtitle={stats.total.toString()}
        />
        <Widget
          icon={<MdVisibility className="h-7 w-7 text-blue-500" />}
          title="Total Ukuran"
          subtitle={`${stats.totalSize} MB`}
        />
      </div>

      {/* Header */}
      <div className="mt-8 flex items-center gap-3 ml-[1px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
          <MdVisibility className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold text-navy-700 dark:text-white">
          Manajemen Model 3D
        </h3>
      </div>

      {/* Search */}
      <div className="mt-5">
        <div className="relative">
          <MdSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
          />
        </div>
      </div>

     
      {/* Tabel */}
      <div className="mt-5">
        <Card extra="w-full p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-navy-600">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">NAMA</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">FILENAME</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">UKURAN</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">DIMODIFIKASI</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">PREVIEW</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">DOWNLOAD</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((m) => (
                  <tr key={m.filename} className="border-b border-gray-100 dark:border-navy-700">
                    <td className="px-4 py-3 text-sm">{m.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{m.filename}</td>
                    <td className="px-4 py-3 text-sm">{m.sizeFormatted}</td>
                    <td className="px-4 py-3 text-xs">{formatDate(m.modifiedAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openModal(m)}
                        className="flex items-center gap-1 text-brand-500 hover:text-brand-600 transition-colors text-sm font-medium"
                      >
                        <IoMdEye className="w-4 h-4" />
                        Lihat 3D
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={m.fullUrl}
                        download={m.filename}
                        className="text-green-600 hover:text-green-800 hover:underline text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Unduh
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

    {/* Modal 3D Viewer */}
      {isModalOpen && selectedModel && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(0,0,0,0.5)] p-4">
          <div className="relative w-[85vw] bg-white dark:bg-navy-800 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-navy-600">
              <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                Preview 3D: {selectedModel.name}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-full bg-red-500 text-white hover:bg-red-700 transition"
              >
                <MdClose className="h-5 w-5" />
              </button>
            </div>

            {/* ==== 3D CANVAS + DOM CARD ==== */}
            <div className="relative flex-1 min-h-0 bg-gray-50 dark:bg-navy-900 overflow-hidden">

            {/* ---------- DOM CARD (Kiri & Kanan) ---------- */}
            <div className="absolute w-full justify-between z-[9999] inset-0 flex items-center gap-6 px-4 pointer-events-none">
                {/* KARTU KIRI */}
                <div className="relative left-4 w-72 md:w-80 h-48 float-container pointer-events-auto">
                  <div
                    className="relative w-full h-full preserve-3d transition-all duration-300 ease-out group"
                    style={{
                      transform: "translateY(-50%) rotateX(-20deg) rotateY(-15deg) translateZ(50px)", // Naikkan translateZ
                      top: "50%",
                      willChange: "transform",
                    }}
                    onMouseMove={e => {
                      const card = e.currentTarget;
                      const rect = card.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const cx = rect.width / 2;
                      const cy = rect.height / 2;
                      const ry = ((x - cx) / cx) * 20 - 15;
                      const rx = ((cy - y) / cy) * 20 - 20;
                      card.style.transform = `translateY(-50%) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(80px) scale(1.03)`; // Efek hover lebih tinggi
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform =
                        "translateY(-50%) rotateX(-20deg) rotateY(-15deg) translateZ(50px) scale(1)";
                    }}
                  >
                    {/* CARD CONTENT */}
                    <div className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between text-white bg-gradient-to-br from-brand-500 to-brand-700 overflow-hidden"
                    style={{
                        boxShadow: `
                          0 25px 50px -12px rgba(0, 0, 0, 0.5),
                          0 50px 100px -20px rgba(0, 0, 0, 0.4),
              0 80px 140px -30px rgba(0, 0, 0, 0.3),
              0 0 100px rgba(34, 197, 94, 0.25),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `
          }}
        >
          <div>
            <h4 className="text-lg font-bold tracking-tight">Model Aktif</h4>
            <p className="text-4xl font-extrabold mt-1">20</p>
          </div>
          <p className="text-sm opacity-80">Sedang digunakan</p>
        </div>

        {/* GLOW BACKGROUND */}
        <div 
          className="absolute -inset-12 bg-emerald-500/40 rounded-full blur-3xl animate-pulse opacity-75" 
          style={{ zIndex: -1, transform: 'translateZ(-20px)' }} 
        />
      </div>
    </div>

    {/* KARTU KANAN */}
    <div className="relative right-4 w-72 md:w-80 h-48 float-container pointer-events-auto">
      <div
        className="relative w-full h-full preserve-3d transition-all duration-300 ease-out group"
        style={{
          transform: "translateY(-50%) rotateX(-20deg) rotateY(15deg) translateZ(50px)",
          top: "50%",
          willChange: "transform",
        }}
        onMouseMove={e => {
          const card = e.currentTarget;
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const cx = rect.width / 2;
          const cy = rect.height / 2;
          const ry = ((x - cx) / cx) * 20 + 15;
          const rx = ((cy - y) / cy) * 20 - 20;
          card.style.transform = `translateY(-50%) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(80px) scale(1.03)`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform =
            "translateY(-50%) rotateX(-20deg) rotateY(15deg) translateZ(50px) scale(1)";
        }}
      >
        <div className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between text-white bg-gradient-to-br from-brand-500 to-brand-700 overflow-hidden"
        style={{
            boxShadow: `
              0 25px 50px -12px rgba(0, 0, 0, 0.5),
              0 50px 100px -20px rgba(0, 0, 0, 0.4),
              0 80px 140px -30px rgba(0, 0, 0, 0.3),
              0 0 100px rgba(34, 197, 94, 0.25),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `
          }}
        >
          <div>
            <h4 className="text-lg font-bold tracking-tight">Total Model 3D</h4>
            <p className="text-4xl font-extrabold mt-1">{stats.total}</p>
          </div>
          <p className="text-sm opacity-80">
            Ukuran: <span className="font-mono">{stats.totalSize} MB</span>
          </p>
        </div>

        <div 
          className="absolute -inset-12 bg-brand-500/40 rounded-full blur-3xl animate-pulse opacity-75" 
          style={{ zIndex: -1, transform: 'translateZ(-20px)' }} 
        />
      </div>
    </div>
            </div>

              {/* ---------- LOADER ---------- */}
              {isLoading && <Loader />}
              
              {/* ---------- 3D CANVAS (R3F) ---------- */}
              <Suspense fallback={null}>
                <ThreeDModel
                  ref={modelRef}
                  url={selectedModel.fullUrl}
                  onLoaded={() => setIsLoading(false)}
                  cameraPosition={cameraPos}
                  maxDistance={maxDist}
                  autoRotate={autoRotate}
                  onCameraChange={handleCameraChange}
                />
              </Suspense>
            </div>

            {/* Footer */}
            <div className="p-3 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-navy-600">
              Gunakan mouse untuk memutar • Scroll untuk zoom • Edit nilai di atas untuk kontrol presisi
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelsPage;