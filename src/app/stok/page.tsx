'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Product } from '@/lib/mockData';
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  X,
  Filter,
  Trash2,
  Edit2,
  TrendingUp,
  Zap,
  Check,
} from 'lucide-react';

const COMMON_CATEGORIES = [
  'Atıştırmalık',
  'Süt Ürünleri',
  'Fırın',
  'İçecek',
  'Temel Gıda',
  'Et & Tavuk',
  'Meyve & Sebze',
  'Temizlik',
  'Kişisel Bakım',
  'Diğer',
];

const PRESET_EMOJIS = ['🍫', '🥛', '🍞', '🍵', '💧', '🥚', '🍗', '🍝', '🥤', '🍅', '🍪', '🧈', '🧀', '🍎', '🧴', '🧼', '📦'];

export default function StokPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  
  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    barcode: '',
    category: 'Atıştırmalık',
    purchasePrice: '',
    salePrice: '',
    stock: '',
    quickAccess: false,
    emoji: '📦',
  });

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    barcode: '',
    category: '',
    purchasePrice: '',
    salePrice: '',
    stock: '',
    quickAccess: false,
    emoji: '📦',
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['Tümü', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (showCriticalOnly) {
      result = result.filter(p => p.stock <= 5);
    }
    if (selectedCategory !== 'Tümü') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, searchQuery, showCriticalOnly, selectedCategory]);

  const criticalCount = useMemo(() => products.filter(p => p.stock <= 5).length, [products]);

  // Handle opening Edit modal
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      barcode: product.barcode,
      category: product.category,
      purchasePrice: product.purchasePrice.toString(),
      salePrice: product.salePrice.toString(),
      stock: product.stock.toString(),
      quickAccess: !!product.quickAccess,
      emoji: product.emoji || '📦',
    });
  };

  // Handle Save Edit
  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingProduct) return;

    if (!editForm.name.trim() || !editForm.barcode.trim() || !editForm.purchasePrice || !editForm.salePrice || editForm.stock === '') {
      return;
    }

    const updated: Product = {
      id: editingProduct.id,
      name: editForm.name.trim(),
      barcode: editForm.barcode.trim(),
      category: editForm.category.trim() || 'Diğer',
      purchasePrice: Math.max(0, Number(editForm.purchasePrice)),
      salePrice: Math.max(0, Number(editForm.salePrice)),
      stock: Math.max(0, Number(editForm.stock)),
      quickAccess: editForm.quickAccess,
      emoji: editForm.emoji || '📦',
    };

    updateProduct(updated);
    setEditingProduct(null);
  };

  // Handle Add Product
  const handleAddProduct = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newProduct.name || !newProduct.barcode || !newProduct.purchasePrice || !newProduct.salePrice || newProduct.stock === '') {
      return;
    }
    addProduct({
      name: newProduct.name.trim(),
      barcode: newProduct.barcode.trim(),
      category: newProduct.category.trim() || 'Diğer',
      purchasePrice: Math.max(0, Number(newProduct.purchasePrice)),
      salePrice: Math.max(0, Number(newProduct.salePrice)),
      stock: Math.max(0, Number(newProduct.stock)),
      quickAccess: newProduct.quickAccess,
      emoji: newProduct.emoji || '📦',
    });
    setNewProduct({
      name: '',
      barcode: '',
      category: 'Atıştırmalık',
      purchasePrice: '',
      salePrice: '',
      stock: '',
      quickAccess: false,
      emoji: '📦',
    });
    setShowAddModal(false);
  };

  // Profit calculation helpers
  const editPurchase = Number(editForm.purchasePrice) || 0;
  const editSale = Number(editForm.salePrice) || 0;
  const editProfit = editSale - editPurchase;
  const editMargin = editSale > 0 ? Math.round((editProfit / editSale) * 100) : 0;

  const newPurchase = Number(newProduct.purchasePrice) || 0;
  const newSale = Number(newProduct.salePrice) || 0;
  const newProfit = newSale - newPurchase;
  const newMargin = newSale > 0 ? Math.round((newProfit / newSale) * 100) : 0;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Stok Yönetimi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {products.length} ürün kayıtlı • Toplam stok değeri:{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {products.reduce((sum, p) => sum + p.salePrice * p.stock, 0).toLocaleString('tr-TR')} ₺
            </span>
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          Yeni Ürün Ekle
        </button>
      </div>

      {/* Filters and Category Pills */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Ürün adı, barkod veya kategori ara..."
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowCriticalOnly(!showCriticalOnly)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
              showCriticalOnly
                ? 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-400 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Filter className="w-4 h-4" />
            Kritik Stok ({criticalCount})
          </button>
        </div>

        {/* Category horizontal scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium ${
                selectedCategory === cat
                  ? 'bg-slate-800 dark:bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table & Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/90 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">Ürün</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">Barkod</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">Kategori</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">Alış</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">Satış</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">Kar (Birim)</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">Stok</th>
                <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider">Durum</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredProducts.map(product => {
                const profit = product.salePrice - product.purchasePrice;
                const margin = product.salePrice > 0 ? Math.round((profit / product.salePrice) * 100) : 0;

                return (
                  <tr key={product.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl flex-shrink-0">{product.emoji || '📦'}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{product.name}</span>
                            {product.quickAccess && (
                              <span
                                title="Hızlı Satışta Görünür"
                                className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200/60 dark:border-amber-800/60"
                              >
                                <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                Hızlı
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">
                        {product.barcode}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm text-slate-500 dark:text-slate-400">{product.purchasePrice.toLocaleString('tr-TR')} ₺</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{product.salePrice.toLocaleString('tr-TR')} ₺</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        +{profit.toLocaleString('tr-TR')} ₺
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal ml-1">(%{margin})</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{product.stock}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">adet</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {product.stock <= 5 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-lg border border-red-100 dark:border-red-900/60">
                          <AlertTriangle className="w-3 h-3" />
                          Kritik ({product.stock})
                        </span>
                      ) : product.stock <= 10 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg border border-amber-100 dark:border-amber-900/60">
                          Azalan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/60">
                          Yeterli
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                          title="Ürünü Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                          title="Ürünü Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredProducts.map(product => {
            const profit = product.salePrice - product.purchasePrice;
            const margin = product.salePrice > 0 ? Math.round((profit / product.salePrice) * 100) : 0;

            return (
              <div key={product.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{product.emoji || '📦'}</span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{product.name}</p>
                        {product.quickAccess && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800/60">
                            <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            Hızlı
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{product.barcode}</span>
                        <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Alış / Satış</span>
                    <span className="font-medium text-slate-600 dark:text-slate-300">{product.purchasePrice}₺</span>
                    <span className="font-bold text-slate-800 dark:text-white ml-1">/ {product.salePrice}₺</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Birim Kar</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{profit}₺ (%{margin})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px]">Stok Durumu</span>
                    {product.stock <= 5 ? (
                      <span className="font-bold text-red-600 dark:text-red-400 inline-flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" />
                        {product.stock} Adet
                      </span>
                    ) : (
                      <span className="font-bold text-slate-700 dark:text-slate-200">{product.stock} Adet</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-base font-medium text-slate-600 dark:text-slate-300">Aradığınız kriterlere uygun ürün bulunamadı</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Filtreleri temizleyerek veya yeni ürün ekleyerek devam edebilirsiniz.</p>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Ürün Bilgilerini Güncelle</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">ID: {editingProduct.id}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
              {/* Emoji Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Ürün Simgesi / Emoji</label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                  {PRESET_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, emoji })}
                      className={`w-9 h-9 flex-shrink-0 text-lg rounded-xl flex items-center justify-center transition-all ${
                        editForm.emoji === emoji
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 scale-105 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Ürün Adı *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Ürün adı giriniz"
                />
              </div>

              {/* Barcode and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Barkod No *</label>
                  <input
                    type="text"
                    required
                    value={editForm.barcode}
                    onChange={e => setEditForm({ ...editForm, barcode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="8690..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Kategori</label>
                  <select
                    value={editForm.category}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    {COMMON_CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prices and Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Alış Fiyatı (₺) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editForm.purchasePrice}
                    onChange={e => setEditForm({ ...editForm, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Satış Fiyatı (₺) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editForm.salePrice}
                    onChange={e => setEditForm({ ...editForm, salePrice: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Stok Adedi *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.stock}
                    onChange={e => setEditForm({ ...editForm, stock: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Profit & Margin live preview badge */}
              <div className="flex items-center justify-between p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 rounded-2xl">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Tahmini Birim Kar & Marj:</span>
                </div>
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {editProfit >= 0 ? `+${editProfit.toFixed(2)} ₺` : `${editProfit.toFixed(2)} ₺`}
                  <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-200/60 dark:bg-emerald-800/60 rounded text-[11px]">
                    %{editMargin} Marj
                  </span>
                </div>
              </div>

              {/* Quick Access POS toggle */}
              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={editForm.quickAccess}
                  onChange={e => setEditForm({ ...editForm, quickAccess: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Hızlı Satış Ekranında Göster</span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Kasa ekranındaki sık satılan ürünler ızgarasında yer alsın.</p>
                </div>
              </label>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-sm shadow-emerald-600/20 inline-flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Güncellemeyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Yeni Ürün Ekle</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 pt-4">
              {/* Emoji Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Ürün Simgesi / Emoji</label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                  {PRESET_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewProduct({ ...newProduct, emoji })}
                      className={`w-9 h-9 flex-shrink-0 text-lg rounded-xl flex items-center justify-center transition-all ${
                        newProduct.emoji === emoji
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 scale-105 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Ürün Adı *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="örn: Eti Çikolatalı Gofret"
                />
              </div>

              {/* Barcode and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Barkod No *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.barcode}
                    onChange={e => setNewProduct({ ...newProduct, barcode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="8690123456789"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Kategori</label>
                  <select
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    {COMMON_CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prices and Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Alış Fiyatı (₺) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newProduct.purchasePrice}
                    onChange={e => setNewProduct({ ...newProduct, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Satış Fiyatı (₺) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newProduct.salePrice}
                    onChange={e => setNewProduct({ ...newProduct, salePrice: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Stok Adedi *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProduct.stock}
                    onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Profit & Margin live preview badge */}
              {newSale > 0 && (
                <div className="flex items-center justify-between p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Tahmini Birim Kar & Marj:</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {newProfit >= 0 ? `+${newProfit.toFixed(2)} ₺` : `${newProfit.toFixed(2)} ₺`}
                    <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-200/60 dark:bg-emerald-800/60 rounded text-[11px]">
                      %{newMargin} Marj
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Access POS toggle */}
              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={newProduct.quickAccess}
                  onChange={e => setNewProduct({ ...newProduct, quickAccess: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Hızlı Satış Ekranında Göster</span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Kasa ekranındaki sık satılan ürünler ızgarasında yer alsın.</p>
                </div>
              </label>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-sm shadow-emerald-600/20 inline-flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Ürünü Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
