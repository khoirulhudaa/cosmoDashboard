import Card from "components/card";
import Widget from "components/widget/Widget";
import React, { useEffect, useMemo, useState } from "react";
import { MdAdd, MdDelete, MdEdit, MdQrCode, MdSearch, MdVisibility } from "react-icons/md";

type Product = {
  id: number;
  sku: string;
  name: string;
  category: "OIL" | "GENERAL";
  description: string;
  modelUrl: string;
  price: string;
  scanCount: number;
  viewCount: number;
};

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [models, setModels] = useState<{ filename: string; name: string; fullUrl: string }[]>([]);

  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "GENERAL" as Product["category"],
    description: "",
    modelUrl: "",
    price: "",
  });

  // Load products & models
  useEffect(() => {
    fetchProducts();
    fetchModels();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("https://vr.kiraproject.id/api/products");
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await fetch("https://vr.kiraproject.id/api/models");
      const json = await res.json();
      if (json.success) setModels(json.data);
    } catch (err) {
      console.error("Failed to fetch models", err);
    }
  };

  const filteredData = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.sku.toLowerCase().includes(search.toLowerCase()) ||
          p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = filterCategory === "all" || p.category === filterCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => b.id - a.id);
  }, [products, search, filterCategory]);

  const stats = useMemo(() => {
    const total = products.length;
    const oil = products.filter((p) => p.category === "OIL").length;
    const general = products.filter((p) => p.category === "GENERAL").length;
    return { total, oil, general };
  }, [products]);

  const handleSubmit = async () => {
    if (!form.sku || !form.name || !form.price) {
      alert("SKU, Nama, dan Harga wajib diisi!");
      return;
    }

    const url = editItem ? `https://vr.kiraproject.id/api/products/${editItem.id}` : "https://vr.kiraproject.id/api/products";
    const method = editItem ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        fetchProducts();
        resetModal();
      }
    } catch (err) {
      alert("Gagal menyimpan produk");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Hapus produk ini?")) return;
    try {
      await fetch(`https://vr.kiraproject.id/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (err) {
      alert("Gagal menghapus");
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({ sku: "", name: "", category: "GENERAL", description: "", modelUrl: "", price: "" });
  };

  const openEdit = (item: Product) => {
    setEditItem(item);
    setForm({
      sku: item.sku,
      name: item.name,
      category: item.category,
      description: item.description,
      modelUrl: item.modelUrl,
      price: item.price,
    });
    setShowModal(true);
  };

  return (
    <div>
      {/* Widget Summary */}
      <div className="mt-0 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Widget icon={<MdQrCode className="h-7 w-7" />} title="Total Produk" subtitle={stats.total.toString()} />
        <Widget icon={<MdVisibility className="h-7 w-7 text-blue-500" />} title="OIL" subtitle={stats.oil.toString()} />
        <Widget icon={<MdVisibility className="h-7 w-7 text-green-500" />} title="GENERAL" subtitle={stats.general.toString()} />
      </div>

      {/* Header + Tambah */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 ml-[1px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500/20 text-brand-500">
            <MdQrCode className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-navy-700 dark:text-white">Manajemen Produk</h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
        >
          <MdAdd className="h-5 w-5" />
          Tambah Produk
        </button>
      </div>

      {/* Filter */}
      <div className="mt-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari SKU atau nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full md:w-48 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-navy-700 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
          >
            <option value="all">Semua Kategori</option>
            <option value="OIL">OIL</option>
            <option value="GENERAL">GENERAL</option>
          </select>
        </div>
      </div>

      {/* Tabel */}
      <div className="mt-5">
        <Card extra="w-full p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:border-navy-600">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">NAMA</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">KATEGORI</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">HARGA</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">SCAN</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-white">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 dark:border-navy-700">
                    <td className="px-4 py-3 font-mono text-sm">{p.sku}</td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate" title={p.name}>{p.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${p.category === "OIL" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">Rp {parseInt(p.price).toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-sm">{p.scanCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="text-blue-500 hover:text-blue-700">
                          <MdEdit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700">
                          <MdDelete className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetModal} />
          <Card extra="relative w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-xl font-bold text-navy-700 dark:text-white">
              {editItem ? "Edit" : "Tambah"} Produk
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SKU</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="OA-250"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  disabled={!!editItem}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Produk</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="COSMO Oil Absorbent"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as Product["category"] })}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                >
                  <option value="GENERAL">GENERAL</option>
                  <option value="OIL">OIL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Harga (Rp)</label>
                <input
                  type="text"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, "") })}
                  placeholder="250000"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model 3D</label>
                <select
                  value={form.modelUrl}
                  onChange={(e) => setForm({ ...form, modelUrl: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                >
                  <option value="">Pilih Model</option>
                  {models.map((m) => (
                    <option key={m.filename} value={m.fullUrl}>
                      {m.name} ({m.filename})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={resetModal} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-navy-600 dark:text-white dark:hover:bg-navy-700">
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
              >
                {editItem ? "Simpan" : "Tambah"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;