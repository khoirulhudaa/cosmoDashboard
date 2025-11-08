import Card from "components/card";
import Widget from "components/widget/Widget";
import React, { useEffect, useState } from "react";
import { MdHealthAndSafety, MdCheckCircle, MdCancel } from "react-icons/md";

type Health = {
  success: boolean;
  message: string;
  timestamp: string;
  environment: string;
  features: {
    chatgpt: boolean;
    rag: boolean;
    whatsapp: boolean;
  };
};

const HealthPage: React.FC = () => {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch("https://vr.kiraproject.id/health");
      const json = await res.json();
      setHealth(json);
    } catch (err) {
      console.error("Health check failed", err);
    }
  };

  if (!health) return <div>Loading...</div>;

  return (
    <div>
      {/* Status */}
      <div className="mt-0 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Widget
          icon={health.success ? <MdCheckCircle className="h-7 w-7 text-green-500" /> : <MdCancel className="h-7 w-7 text-red-500" />}
          title="Status Backend"
          subtitle={health.success ? "Online" : "Offline"}
        />
        <Widget icon={<MdHealthAndSafety className="h-7 w-7" />} title="Environment" subtitle={health.environment} />
      </div>

      {/* Header */}
      <div className="mt-8 flex items-center gap-3 ml-[1px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
          <MdHealthAndSafety className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold text-navy-700 dark:text-white">Health & System Status</h3>
      </div>

      {/* Info */}
      <div className="mt-5">
        <Card extra="w-full p-5">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Pesan</p>
              <p className="font-medium">{health.message}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Waktu Cek</p>
              <p className="font-mono text-sm">{new Date(health.timestamp).toLocaleString("id-ID")}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Fitur Aktif</p>
              <div className="flex gap-4">
                <span className={`flex items-center gap-1 text-sm ${health.features?.chatgpt ? "text-green-600" : "text-gray-400"}`}>
                  <MdCheckCircle /> ChatGPT
                </span>
                <span className={`flex items-center gap-1 text-sm ${health.features?.rag ? "text-green-600" : "text-gray-400"}`}>
                  <MdCheckCircle /> RAG
                </span>
                <span className={`flex items-center gap-1 text-sm ${health.features?.whatsapp ? "text-green-600" : "text-gray-400"}`}>
                  <MdCheckCircle /> WhatsApp
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HealthPage;