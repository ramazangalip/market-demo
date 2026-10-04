'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { getDailySalesData, getTopProducts } from '@/lib/mockData';
import {
  TrendingUp,
  CreditCard,
  Banknote,
  Package,
  AlertTriangle,
  ShoppingCart,
  ArrowUpRight,
  ShoppingBag,
  Clock,
  ArrowRight,
  Receipt,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const { products, sales, expenses, theme } = useStore();
  const [mounted, setMounted] = useState(false);
  const [chartView, setChartView] = useState<'ciro' | 'kar'>('ciro');

  useEffect(() => {
    setMounted(true);
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Today's sales
  const todaySales = useMemo(
    () => sales.filter(s => s.date === todayStr),
    [sales, todayStr]
  );

  const todayRevenue = useMemo(
    () => todaySales.reduce((sum, s) => sum + s.total, 0),
    [todaySales]
  );

  const todayProfit = useMemo(
    () => todaySales.reduce((sum, s) => sum + s.profit, 0),
    [todaySales]
  );

  const todayTxCount = todaySales.length;
  const avgBasket = todayTxCount > 0 ? todayRevenue / todayTxCount : 0;

  // Critical stock products
  const criticalProducts = useMemo(
    () => products.filter(p => p.stock <= 5),
    [products]
  );

  // 7-day chart data
  const chartData = useMemo(() => getDailySalesData(sales), [sales]);

  // Top products
  const topProducts = useMemo(() => getTopProducts(sales), [sales]);

  // Recent 6 sales
  const recentSales = useMemo(
    () => [...sales].sort((a, b) => b.timestamp - a.timestamp).slice(0, 6),
    [sales]
  );

  // Payment breakdown today
  const cashTotal = todaySales
    .filter(s => s.paymentMethod === 'cash')
    .reduce((sum, s) => sum + s.total, 0);
  const cardTotal = todaySales
    .filter(s => s.paymentMethod === 'card')
    .reduce((sum, s) => sum + s.total, 0);
  const cashPercent = todayRevenue > 0 ? Math.round((cashTotal / todayRevenue) * 100) : 50;
  const cardPercent = todayRevenue > 0 ? 100 - cashPercent : 50;

  // Total stats
  const totalRevenue = useMemo(() => sales.reduce((sum, s) => sum + s.total, 0), [sales]);
  const totalExpense = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  const isDark = theme === 'dark';

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
              Yönetim Paneli
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Canlı
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {new Date().toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })} • Market genel performans özeti
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/kasa"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-sm shadow-emerald-600/20 hover:shadow-md transition-all duration-200 active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            Hızlı Satış Yap
          </Link>
          <Link
            href="/stok"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
          >
            <Package className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Stok Listesi
          </Link>
        </div>
      </div>

      {/* Critical Stock Alert Banner (if any) */}
      {criticalProducts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {criticalProducts.length} Üründe Kritik Stok Seviyesi!
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {criticalProducts.slice(0, 3).map(p => p.name).join(', ')}
                {criticalProducts.length > 3 ? ` ve ${criticalProducts.length - 3} ürün daha` : ''} tükenmek üzere.
              </p>
            </div>
          </div>
          <Link
            href="/stok"
            className="shrink-0 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1"
          >
            İncele
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {/* Card 1: Today's Revenue */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Bugünkü Ciro
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
              {todayRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{todayTxCount} satış işlemi yapıldı</span>
            </div>
          </div>
        </div>

        {/* Card 2: Today's Profit */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Bugünkü Net Kar
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
              {todayProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Kar Marjı: %{todayRevenue > 0 ? Math.round((todayProfit / todayRevenue) * 100) : 0}
            </p>
          </div>
        </div>

        {/* Card 3: Avg Basket */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ortalama Sepet
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
              {avgBasket.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              İşlem başına düşen tutar
            </p>
          </div>
        </div>

        {/* Card 4: Critical Stock */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Kritik Stok
            </span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
              criticalProducts.length > 0
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
              {criticalProducts.length} <span className="text-sm font-normal text-slate-400 dark:text-slate-500">Ürün</span>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {criticalProducts.length > 0 ? 'Tükenmek üzere ürünler var' : 'Tüm stoklar yeterli'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sales & Profit Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 lg:p-6 border border-slate-100 dark:border-slate-800/90 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                Haftalık Satış & Performans Trendi
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Son 7 güne ait günlük ciro ve kar grafiği
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setChartView('ciro')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  chartView === 'ciro'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Ciro (₺)
              </button>
              <button
                onClick={() => setChartView('kar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  chartView === 'kar'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Net Kar (₺)
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCiro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorKar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 12 }}
                    tickFormatter={val => `₺${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                      border: isDark ? '1px solid #1e293b' : '1px solid #f1f5f9',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`₺${Number(value).toLocaleString('tr-TR')}`, chartView === 'ciro' ? 'Ciro' : 'Net Kar']}
                    labelFormatter={(label) => `${label}`}
                  />
                  {chartView === 'ciro' ? (
                    <Area
                      type="monotone"
                      dataKey="ciro"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorCiro)"
                    />
                  ) : (
                    <Area
                      type="monotone"
                      dataKey="kar"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorKar)"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-300 dark:text-slate-600 text-sm">
                Grafik yükleniyor...
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Payment Stats & Finance Mini Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 lg:p-6 border border-slate-100 dark:border-slate-800/90 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Ödeme Yöntemleri</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Bugünkü ciro dağılımı</p>

            <div className="mt-5 space-y-4">
              {/* Cash */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Nakit
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {cashTotal.toLocaleString('tr-TR')}₺ (%{cashPercent})
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${cashPercent}%` }}
                  />
                </div>
              </div>

              {/* Card */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Kredi Kartı
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {cardTotal.toLocaleString('tr-TR')}₺ (%{cardPercent})
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${cardPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mini Finance Overview */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Toplam Bilanço
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Toplam Satış</p>
                <p className="text-base font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">
                  ₺{Math.round(totalRevenue).toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="p-3 bg-red-50/70 dark:bg-red-950/40 rounded-xl border border-red-100 dark:border-red-800/50">
                <p className="text-[11px] font-medium text-red-700 dark:text-red-400">Toplam Gider</p>
                <p className="text-base font-bold text-red-800 dark:text-red-300 mt-0.5">
                  ₺{Math.round(totalExpense).toLocaleString('tr-TR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Products & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Products */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/90 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">En Çok Satan Ürünler</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Miktar ve ciroya göre sıralı</p>
            </div>
            <Link
              href="/stok"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1"
            >
              Tüm Ürünler
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-50 dark:divide-slate-800/60 flex-1">
            {topProducts.map((prod, idx) => (
              <div
                key={prod.name}
                className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <span className="w-6 text-center text-xs font-bold text-slate-400 dark:text-slate-500 font-mono">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{prod.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{prod.quantity} adet satıldı</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {prod.revenue.toLocaleString('tr-TR')}₺
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Toplam Hasılat</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/90 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Son Satış Hareketleri</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Kasada yapılan son işlemler</p>
            </div>
            <Link
              href="/kasa"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1"
            >
              Kasa Ekranı
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-50 dark:divide-slate-800/60 flex-1">
            {recentSales.map(sale => (
              <div
                key={sale.id}
                className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{sale.receiptNo}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          sale.paymentMethod === 'cash'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                        }`}
                      >
                        {sale.paymentMethod === 'cash' ? 'Nakit' : 'Kart'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(sale.timestamp).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })} • {sale.items.length} kalem ürün
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {sale.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺
                  </p>
                  <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                    +₺{sale.profit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} kar
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
