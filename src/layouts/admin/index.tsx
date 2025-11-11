// src/layouts/admin/index.tsx
import Footer from "components/footer/Footer";
import Navbar from "components/navbar";
import Sidebar from "components/sidebar";
import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import routes from "routes";
import { motion } from "framer-motion";
import { Sparkles, X, Mic } from "lucide-react";

// === API CONFIG ===
const API_BASE = 'https://vr.kiraproject.id';

// === Fallback RuleBot ===
const ruleBot = (text: string, model?: any): string => {
  const t = text.toLowerCase();
  const name = model?.name?.toLowerCase() || '';
  if (/halo|hi|hai/.test(t)) return 'Halo! Ada yang bisa saya bantu?';
  if (/toilet/.test(t) || name.includes('toilet')) return 'Toilet pintar: flush otomatis, hemat air 50%, pemanas dudukan.';
  if (/sepatu|shoe/.test(t) || name.includes('shoe')) return 'Sepatu tahan air, anti-slip, memory foam.';
  if (/tisu|tissue/.test(t) || name.includes('tissue')) return 'Tisu 3 ply ultra-soft, hypoallergenic, aroma therapy.';
  if (/astronaut/.test(t) || name.includes('astronaut')) return 'Model astronaut NASA EMU, cocok untuk VR luar angkasa.';
  if (/kotak|box/.test(t) || name.includes('box')) return 'Kotak kemasan premium: emboss, foil, food-safe.';
  return `Maaf, saya belum paham: "${text}". Coba tanya fitur produk!`;
};

export default function Admin(props: { [x: string]: any }) {
  const { ...rest } = props;
  const location = useLocation();
  const [open, setOpen] = React.useState(true);
  const [currentRoute] = React.useState("Main Dashboard");

  // === CHAT STATE ===
  const [showChat, setShowChat] = React.useState(false);
  const [messages, setMessages] = React.useState<{ role: 'user' | 'bot'; content: string; id: number }[]>([]);
  const [inputText, setInputText] = React.useState('');
  const [isListening, setIsListening] = React.useState(false);
  const [isLoadingAI, setIsLoadingAI] = React.useState(false);
  const [selectedSku, setSelectedSku] = React.useState('');
  const [selectedProductName, setSelectedProductName] = React.useState('');
  const [products, setProducts] = React.useState<any[]>([]);
  const recognitionRef = React.useRef<any>(null);
  const chatHistoryRef = React.useRef<HTMLDivElement>(null);

  // === FETCH PRODUK ===
  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        const json = await res.json();
        if (json.success) setProducts(json.data);
      } catch (err) {
        console.warn('Gagal fetch produk:', err);
      }
    };
    fetchProducts();
  }, []);

  React.useEffect(() => {
    // Cek apakah browser support Speech Recognition
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI() as any; // <--- any di sini saja

      recognition.lang = 'id-ID';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('Speech Recognition tidak didukung di browser ini.');
    }

    // Cleanup saat component unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  // === TEXT TO SPEECH ===
  const speak = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) return resolve();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'id-ID';
      utter.rate = 0.9;
      // utter.onend = resolve;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    });
  };

  // === TAMBAH PESAN ===
  const addMessage = (role: 'user' | 'bot', content: string) => {
    setMessages(prev => [...prev, { role, content, id: Date.now() }]);
    setTimeout(() => {
      if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }
    }, 50);
  };

  // === KIRIM KE LLM ===
  const sendToLLM = async (message: string): Promise<string> => {
    const payload = selectedSku
      ? { sku: selectedSku, question: message }
      : { message };

    const endpoint = selectedSku
      ? `${API_BASE}/api/llm/product-chat`
      : `${API_BASE}/api/llm/chat`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) return json.data.response;
      throw new Error();
    } catch {
      return ruleBot(message, products.find(p => p.sku === selectedSku));
    }
  };

  // === HANDLE SEND ===
  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userText = text.trim();
    addMessage('user', userText);
    setInputText('');
    setIsLoadingAI(true);
    const reply = await sendToLLM(userText);
    addMessage('bot', reply);
    await speak(reply);
    setIsLoadingAI(false);
  };

  // === TOGGLE MIC ===
  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
    setIsListening(!isListening);
  };

  // === HANDLE SKU CHANGE ===
  const handleSkuChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sku = e.target.value;
    const product = products.find(p => p.sku === sku);
    setSelectedSku(sku);
    setSelectedProductName(product?.name || '');
  };

  // === SIDEBAR RESIZE EFFECT ===
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // === UPDATE CURRENT ROUTE ===
  React.useEffect(() => {
    getActiveRoute(routes);
  }, [location.pathname]);

  const getActiveRoute = (routes: any[]): string => {
    for (let i = 0; i < routes.length; i++) {
      if (window.location.href.indexOf(routes[i].layout + "/" + routes[i].path) !== -1) {
        return routes[i].name;
      }
    }
    return "Main Dashboard";
  };

  const getActiveNavbar = (routes: any[]): boolean => {
    for (let i = 0; i < routes.length; i++) {
      if (window.location.href.indexOf(routes[i].layout + "/" + routes[i].path) !== -1) {
        return routes[i].secondary || false;
      }
    }
    return false;
  };

  const getRoutes = (routes: any[]): any[] => {
    const routeElements: any[] = [];

    const traverse = (route: any, parentKey = "") => {
      const key = `${parentKey}-${route.path}`;
      if (route.layout === "/admin" && route.component) {
        routeElements.push(
          <Route path={`/${route.path}`} element={route.component} key={key} />
        );
      }
      if (route.subRoutes?.length) {
        route.subRoutes.forEach((sub: any) => traverse(sub, key));
      }
    };

    routes.forEach((route) => traverse(route));
    return routeElements;
  };

  document.documentElement.dir = "ltr";

  return (
    <div className="flex h-full w-full">
      {/* SIDEBAR */}
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* MAIN CONTENT */}
      <div className="h-full w-full bg-brand-100/10 dark:!bg-navy-900 flex-1">
        <main
          className={`
            mx-3 h-full px-2 flex-none transition-all duration-200
            ${open ? "xl:ml-[21vw]" : "xl:ml-0"}
          `}
        >
          <div className="h-full flex flex-col">
            {/* Navbar */}
            <Navbar
              onOpenSidenav={() => setOpen(true)}
              brandText={currentRoute}
              secondary={getActiveNavbar(routes)}
              {...rest}
            />

            {/* Content */}
            <div className="flex-1 mx-auto w-full max-w-full p-2 md:p-4">
              <Routes>
                {getRoutes(routes)}
                <Route path="/" element={<Navigate to="/admin/default" replace />} />
              </Routes>
            </div>

            {/* Footer */}
            <div className="p-3">
              <Footer />
            </div>
          </div>
        </main>

        {/* === CHATBOT FLOATING (DITAMBAHKAN SAJA) === */}
        <div className="fixed bottom-6 right-6 z-[999999999]">
          {/* Toggle Button */}
          {!showChat && (
            <motion.button
              onClick={() => setShowChat(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-purple-500/50 transition-all"
            >
              <Sparkles className="w-7 h-7" />
            </motion.button>
          )}

          {/* Chat Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: showChat ? 1 : 0, scale: showChat ? 1 : 0.8, y: showChat ? 0 : 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`absolute bottom-0 right-0 w-96 h-96 md:h-[82vh] backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex flex-col ${showChat ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{
              backgroundImage: 'linear-gradient(to bottom right, rgba(15, 23, 42, 0.95), rgba(88, 28, 135, 0.95))',
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">COSMO AI</h3>
                  <p className="text-xs text-cyan-300">
                    {selectedProductName || selectedSku ? selectedProductName || `SKU: ${selectedSku}` : 'Chat Umum'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="text-white hover:text-red-400 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={chatHistoryRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.length === 0 && (
                <div className="text-center text-white/50 text-sm mt-8">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-cyan-400 animate-pulse" />
                  <p>Pilih produk atau tanya umum!</p>
                </div>
              )}
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-white/10 text-cyan-100 border border-white/10'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {isLoadingAI && (
                <div className="flex justify-start">
                  <div className="bg-white/10 border border-white/10 p-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/10 space-y-2">
              <select
                value={selectedSku}
                onChange={handleSkuChange}
                className="w-full bg-purple-600 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
              >
                <option className="text-white" value="">Chat Umum</option>
                {products.map((product) => (
                  <option className="text-black" key={product.sku} value={product.sku}>
                    {product.name} (SKU: {product.sku})
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
                  placeholder={selectedProductName ? `Tanya ${selectedProductName}...` : "Tanya apa saja..."}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition"
                />
                <button
                  onClick={toggleMic}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition ${isListening ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                </button>
                <button
                  onClick={() => handleSend(inputText)}
                  disabled={!inputText.trim()}
                  className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Custom Scrollbar */}
        {/* <style jsx>{`
          .scrollbar-thin::-webkit-scrollbar { width: 6px; }
          .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
          .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
        `}</style> */}
      </div>
    </div>
  );
}