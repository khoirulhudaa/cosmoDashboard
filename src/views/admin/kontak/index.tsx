import React, { useState, useEffect } from "react";
import { BsInstagram, BsTwitter } from "react-icons/bs";
import { MdAdd, MdDelete, MdEdit, MdSave, MdCancel, MdPhone, MdEmail, MdFacebook, MdWhatsapp, MdLocationOn, MdWeb } from "react-icons/md";

type Kontak = {
  id: string;
  type: "phone" | "email" | "facebook" | "instagram" | "twitter" | "whatsapp" | "website" | "address";
  label: string;
  value: string;
  isEditing?: boolean;
};

const KontakPage: React.FC = () => {
  const [kontakList, setKontakList] = useState<Kontak[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newType, setNewType] = useState<Kontak["type"]>("phone");

  // Load dari localStorage atau gunakan data dummy jika kosong
  useEffect(() => {
    const saved = localStorage.getItem("kontakList");
    if (saved && JSON.parse(saved).length > 0) {
      setKontakList(JSON.parse(saved));
    } else {
      const dummyKontak: Kontak[] = [
        { id: "1", type: "phone", label: "Ketua RW", value: "081234567890" },
        { id: "2", type: "phone", label: "Sekretaris RW", value: "082345678901" },
        { id: "3", type: "email", label: "Email Resmi", value: "rw001.cempakaputih@gmail.com" },
        { id: "4", type: "whatsapp", label: "Grup Warga", value: "6281234567890" },
        { id: "5", type: "facebook", label: "Facebook RW", value: "https://facebook.com/rw001cempaka" },
        { id: "6", type: "address", label: "Alamat Kantor RW", value: "Jl. Cempaka Putih Raya No. 1, RT 001/RW 005, Jakarta Pusat" },
      ];
      setKontakList(dummyKontak);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("kontakList", JSON.stringify(kontakList));
  }, [kontakList]);

  // Tambah Kontak
  const handleAdd = () => {
    if (!newLabel.trim() || !newValue.trim()) {
      alert("Label dan nilai wajib diisi!");
      return;
    }
    const newKontak: Kontak = {
      id: Date.now().toString(),
      type: newType,
      label: newLabel,
      value: newValue,
    };
    setKontakList((prev) => [...prev, newKontak]);
    setNewLabel("");
    setNewValue("");
    setNewType("phone");
  };

  // Edit Mode
  const toggleEdit = (id: string) => {
    setKontakList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, isEditing: !k.isEditing } : k))
    );
  };

  // Simpan Edit
  const saveEdit = (id: string, label: string, value: string) => {
    if (!label.trim() || !value.trim()) {
      alert("Label dan nilai tidak boleh kosong!");
      return;
    }
    setKontakList((prev) =>
      prev.map((k) =>
        k.id === id ? { ...k, label, value, isEditing: false } : k
      )
    );
  };

  // Hapus
  const handleDelete = (id: string) => {
    if (window.confirm("Hapus kontak ini?")) {
      setKontakList((prev) => prev.filter((k) => k.id !== id));
    }
  };

  // Icon berdasarkan tipe
  const getIcon = (type: Kontak["type"], size: number = 20) => {
    switch (type) {
      case "phone": return <MdPhone className={`h-${size/4} w-${size/4}`} />;
      case "email": return <MdEmail className={`h-${size/4} w-${size/4}`} />;
      case "facebook": return <MdFacebook className={`h-${size/4} w-${size/4}`} />;
      case "instagram": return <BsInstagram className={`h-${size/4} w-${size/4}`} />;
      case "twitter": return <BsTwitter className={`h-${size/4} w-${size/4}`} />;
      case "whatsapp": return <MdWhatsapp className={`h-${size/4} w-${size/4}`} />;
      case "website": return <MdWeb className={`h-${size/4} w-${size/4}`} />;
      case "address": return <MdLocationOn className={`h-${size/4} w-${size/4}`} />;
    }
  };

  // Warna ikon
  const getIconColor = (type: Kontak["type"]) => {
    switch (type) {
      case "phone": return "text-green-600";
      case "email": return "text-blue-600";
      case "facebook": return "text-blue-700";
      case "instagram": return "text-pink-600";
      case "twitter": return "text-sky-500";
      case "whatsapp": return "text-green-500";
      case "website": return "text-indigo-600";
      case "address": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="pt-3 pb-6 max-w-full mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-700 dark:text-white flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/20 text-brand-500">
            <MdPhone className="h-7 w-7" />
          </div>
          Kontak & Media Sosial
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Kelola semua kontak dan link media sosial di satu tempat.
        </p>
      </div>

      {/* Form Tambah Baru */}
      <div className="mb-10 p-6 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-navy-800 dark:to-navy-700 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-4">Tambah Kontak Baru</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe Kontak</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as Kontak["type"])}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white"
            >
              <option value="phone">Telepon</option>
              <option value="email">Email</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="website">Website</option>
              <option value="address">Alamat</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Label</label>
            <input
              type="text"
              placeholder="Contoh: Ketua RW"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nilai</label>
            <input
              type="text"
              placeholder={newType === "phone" ? "08123456789" : newType === "email" ? "email@contoh.com" : "https://..."}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-white font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
        >
          <MdAdd className="h-5 w-5" />
          Tambah Kontak
        </button>
      </div>

      {/* Daftar Kontak – Full Form Inline Edit */}
      <div className={`gap-4 grid ${kontakList.length === 1 ? 'grid-cols-1' : kontakList.length === 0 ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {kontakList.length === 0 ? (
          <div className="w-full flex items-center justify-center flex-col text-center py-16 text-gray-500 dark:text-gray-400">
            <MdPhone className="mx-auto h-16 w-16 mb-3 text-gray-300 dark:text-gray-600" />
            <p>Belum ada kontak. Tambahkan kontak pertama Anda!</p>
          </div>
        ) : (
          kontakList.map((kontak) => (
            <div
              key={kontak.id}
              className="group p-5 bg-white dark:bg-navy-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-navy-600"
            >
              <div className="flex items-start justify-center gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 p-3 rounded-xl ${getIconColor(kontak.type)} bg-gray-50 dark:bg-navy-700`}>
                  {getIcon(kontak.type, 24)}
                </div>

                {/* Form Edit atau Tampil */}
                <div className="flex-1">
                  {kontak.isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        defaultValue={kontak.label}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const input = e.target as HTMLInputElement;
                            saveEdit(kontak.id, input.value, (e.currentTarget.parentElement?.nextElementSibling?.querySelector("input") as HTMLInputElement)?.value || kontak.value);
                          }
                        }}
                      />
                      <input
                        type="text"
                        defaultValue={kontak.value}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const input = e.target as HTMLInputElement;
                            saveEdit(kontak.id, (e.currentTarget.parentElement?.previousElementSibling?.querySelector("input") as HTMLInputElement)?.value || kontak.label, input.value);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-navy-700 dark:text-white">{kontak.label}</p>
                      <a
                        href={
                          kontak.type === "phone" ? `tel:${kontak.value}` :
                          kontak.type === "email" ? `mailto:${kontak.value}` :
                          kontak.type === "whatsapp" ? `https://wa.me/${kontak.value.replace(/[^\d]/g, "")}` :
                          kontak.value
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 dark:text-brand-400 hover:underline text-sm break-all"
                      >
                        {kontak.value}
                      </a>
                    </div>
                  )}
                </div>

                {/* Aksi */}
                <div className="flex gap-2 opacity-100 transition-opacity">
                  {kontak.isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          const labelInput = document.querySelector(`input[defaultValue="${kontak.label}"]`) as HTMLInputElement;
                          const valueInput = document.querySelector(`input[defaultValue="${kontak.value}"]`) as HTMLInputElement;
                          saveEdit(kontak.id, labelInput?.value || kontak.label, valueInput?.value || kontak.value);
                        }}
                        className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                      >
                        <MdSave className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleEdit(kontak.id)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-600 dark:text-gray-300"
                      >
                        <MdCancel className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleEdit(kontak.id)}
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                      >
                        <MdEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(kontak.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                      >
                        <MdDelete className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KontakPage;