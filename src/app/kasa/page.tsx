'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Banknote,
  CreditCard,
  ShoppingBag,
  X,
  ScanBarcode,
} from 'lucide-react';

export default function KasaPage() {
  const { products, cart, addToCart, removeFromCart, updateCartItemQty, clearCart, completeSale } =
    useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q)
    );
  }, [products, searchQuery]);

  const quickProducts = useMemo(
    () => products.filter(p => p.quickAccess && p.stock > 0),
    [products]
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.salePrice * item.quantity, 0),
    [cart]
  );

  const cartItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredProducts.length > 0) {
      addToCart(filteredProducts[0]);
      setSearchQuery('');
    }
  };

  const handleSelectProduct = (product: typeof products[0]) => {
    addToCart(product);
    setSearchQuery('');
    searchRef.current?.focus();
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Hızlı Satış / Kasa</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Barkod numarası girin veya ürün arayın</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Products - 3 cols */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <ScanBarcode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Barkod numarası girin veya ürün adı yazın... (Enter ile ekle)"
              className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchQuery && filteredProducts.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
              {filteredProducts.slice(0, 8).map(product => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors border-b border-slate-50 dark:border-slate-800/80 last:border-b-0 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{product.emoji || '📦'}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{product.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">{product.barcode} • Stok: {product.stock}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {product.salePrice.toLocaleString('tr-TR')}₺
                  </span>
                </button>
              ))}
            </div>
          )}

          {searchQuery && filteredProducts.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 text-center shadow-sm">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400 dark:text-slate-500">Ürün bulunamadı</p>
            </div>
          )}

          {/* Quick Products Grid */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <span>⚡ Hızlı Ürünler</span>
              <span className="text-xs font-normal text-slate-400">({quickProducts.length})</span>
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {quickProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/90 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-200 text-center group"
                >
                  <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">
                    {product.emoji || '📦'}
                  </span>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{product.name}</p>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {product.salePrice}₺
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart - 2 cols */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/90 shadow-sm overflow-hidden sticky top-4">
            {/* Cart Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Sepet</h3>
                {cartItemCount > 0 && (
                  <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                >
                  Temizle
                </button>
              )}
            </div>

            {/* Cart Items */}
            <div className="max-h-[400px] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <ShoppingBag className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Sepet boş</p>
                  <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Ürün eklemek için arayın veya hızlı butonları kullanın</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
                  {cart.map(item => (
                    <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                      <span className="text-lg">{item.emoji || '📦'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{item.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{item.salePrice}₺ / adet</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateCartItemQty(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-slate-700 dark:text-slate-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItemQty(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 w-16 text-right">
                        {(item.salePrice * item.quantity).toLocaleString('tr-TR')}₺
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Toplam</span>
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">
                    {cartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => completeSale('cash')}
                    className="flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-sm shadow-emerald-600/20"
                  >
                    <Banknote className="w-5 h-5" />
                    Nakit
                  </button>
                  <button
                    onClick={() => completeSale('card')}
                    className="flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm shadow-indigo-600/20"
                  >
                    <CreditCard className="w-5 h-5" />
                    Kredi Kartı
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
