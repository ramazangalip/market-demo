'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { EXPENSE_CATEGORIES } from '@/lib/mockData';
import {
  calculateReportData,
  printFinancialPDFReport,
  ReportPeriod,
} from '@/lib/pdfReport';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  X,
  Calendar,
  Tag,
  FileText,
  CreditCard,
  Check,
  Printer,
  FileDown,
  BarChart3,
  Sparkles,
  ArrowRight,
  Receipt,
  Layers,
} from 'lucide-react';

export default function GelirGiderPage() {
  const { sales, expenses, addExpense } = useStore();

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('1month');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | '1month' | '3months' | '6months' | '1year'>('all');

  const [newExpense, setNewExpense] = useState({
    category: EXPENSE_CATEGORIES[0],
    description: '',
    amount: '',
    paymentMethod: 'Nakit',
    date: new Date().toISOString().split('T')[0],
  });

  // Filtered on-page data based on active tab
  const filteredData = useMemo(() => {
    if (activeTabFilter === 'all') {
      return {
        sales,
        expenses,
      };
    }
    const days = activeTabFilter === '1month' ? 30 : activeTabFilter === '3months' ? 90 : activeTabFilter === '6months' ? 180 : 365;
    const targetTimestamp = Date.now() - days * 24 * 60 * 60 * 1000;
    return {
      sales: sales.filter(s => s.timestamp >= targetTimestamp),
      expenses: expenses.filter(e => e.timestamp >= targetTimestamp),
    };
  }, [sales, expenses, activeTabFilter]);

  const totalRevenue = useMemo(
    () => Math.round(filteredData.sales.reduce((sum, s) => sum + s.total, 0)),
    [filteredData.sales]
  );

  const totalExpenses = useMemo(
    () => Math.round(filteredData.expenses.reduce((sum, e) => sum + e.amount, 0)),
    [filteredData.expenses]
  );

  const netBalance = totalRevenue - totalExpenses;

  const sortedExpenses = useMemo(
    () => [...filteredData.expenses].sort((a, b) => b.timestamp - a.timestamp),
    [filteredData.expenses]
  );

  // Dynamic Report Data based on selected period
  const reportData = useMemo(() => {
    return calculateReportData(selectedPeriod, sales, expenses);
  }, [selectedPeriod, sales, expenses]);

  const handleAddExpense = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;
    addExpense({
      category: newExpense.category,
      description: newExpense.description,
      amount: Number(newExpense.amount),
      paymentMethod: newExpense.paymentMethod,
      date: newExpense.date,
    });
    setNewExpense({
      category: EXPENSE_CATEGORIES[0],
      description: '',
      amount: '',
      paymentMethod: 'Nakit',
      date: new Date().toISOString().split('T')[0],
    });
    setShowAddModal(false);
  };

  const handleGeneratePDF = () => {
    printFinancialPDFReport(reportData);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gelir - Gider</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Mali durum özeti, gider takibi ve PDF raporlama</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* PDF Report Trigger Button */}
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-emerald-600/20"
          >
            <FileDown className="w-4 h-4" />
            PDF Raporu Oluştur
          </button>

          {/* Add Expense Trigger Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Gider Ekle
          </button>
        </div>
      </div>

      {/* Period Filter Tabs on Page */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {[
          { id: 'all', label: 'Tüm Zamanlar' },
          { id: '1month', label: 'Son 1 Ay (30 Gün)' },
          { id: '3months', label: 'Son 3 Ay (90 Gün)' },
          { id: '6months', label: 'Son 6 Ay (180 Gün)' },
          { id: '1year', label: 'Son 1 Yıl (365 Gün)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTabFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
              activeTabFilter === tab.id
                ? 'bg-slate-800 dark:bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/90 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Toplam Satış Geliri</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalRevenue.toLocaleString('tr-TR')} ₺
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {filteredData.sales.length} satış işlemi
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/90 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-50 dark:bg-red-950/60 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-500 dark:text-red-400" />
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Toplam Gider</span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {totalExpenses.toLocaleString('tr-TR')} ₺
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {filteredData.expenses.length} gider kaydı
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/90 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              netBalance >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/60' : 'bg-red-50 dark:bg-red-950/60'
            }`}>
              <Wallet className={`w-5 h-5 ${netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`} />
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Bakiye</span>
          </div>
          <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {netBalance >= 0 ? '+' : ''}
            {netBalance.toLocaleString('tr-TR')} ₺
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Gelir - Gider farkı
          </p>
        </div>
      </div>

      {/* Expense History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/90 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Gider Geçmişi</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{sortedExpenses.length} kayıt</span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">Tarih</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">Kategori</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider">Açıklama</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">Tutar</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider">Ödeme</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sortedExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                      {new Date(expense.date).toLocaleDateString('tr-TR')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg font-medium border border-indigo-100 dark:border-indigo-900/60">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{expense.description}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                      -{expense.amount.toLocaleString('tr-TR')} ₺
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                      {expense.paymentMethod}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
          {sortedExpenses.map(expense => (
            <div key={expense.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg font-medium border border-indigo-100 dark:border-indigo-900/60">
                    {expense.category}
                  </span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1.5">{expense.description}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {new Date(expense.date).toLocaleDateString('tr-TR')} • {expense.paymentMethod}
                  </p>
                </div>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                  -{expense.amount.toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>
          ))}
        </div>

        {sortedExpenses.length === 0 && (
          <div className="py-12 text-center">
            <Wallet className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Henüz gider kaydı yok</p>
          </div>
        )}
      </div>

      {/* PDF Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Finansal PDF Raporu Oluştur</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Dönem seçin ve profesyonel mali rapor çıktısı alın</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Period Selection Buttons */}
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-2">
                  Rapor Dönemi Seçimi
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: '1month', label: '1 Aylık', desc: 'Son 30 Gün' },
                    { id: '3months', label: '3 Aylık', desc: 'Son 90 Gün (Çeyrek)' },
                    { id: '6months', label: '6 Aylık', desc: 'Son 180 Gün (Yarıyıl)' },
                    { id: '1year', label: '1 Yıllık', desc: 'Son 365 Gün (Yıllık)' },
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPeriod(p.id as ReportPeriod)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        selectedPeriod === p.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold block">{p.label}</span>
                        {selectedPeriod === p.id && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Live Preview Box */}
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-slate-800 dark:text-white">
                      {reportData.periodTitle}
                    </span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    {reportData.startDate} — {reportData.endDate}
                  </span>
                </div>

                {/* 4 KPI cards with period-specific values */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-semibold">Satış Cirosu</span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                      {reportData.totalRevenue.toLocaleString('tr-TR')} ₺
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                      {reportData.totalTransactions} Satış Fişi
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-semibold">Mal Maliyeti</span>
                    <span className="text-base font-bold text-slate-700 dark:text-slate-200 block mt-0.5">
                      {reportData.totalCost.toLocaleString('tr-TR')} ₺
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                      Brüt Kar: %{reportData.grossMargin}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-semibold">İşletme Gideri</span>
                    <span className="text-base font-bold text-red-600 dark:text-red-400 block mt-0.5">
                      {reportData.totalExpenses.toLocaleString('tr-TR')} ₺
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                      {reportData.expenseCategories.length} Gider Kategorisi
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-semibold">Net Kar / Zarar</span>
                    <span className={`text-base font-bold block mt-0.5 ${reportData.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
                      {reportData.netProfit >= 0 ? '+' : ''}{reportData.netProfit.toLocaleString('tr-TR')} ₺
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 block">
                      Net Marj: %{reportData.netMargin}
                    </span>
                  </div>
                </div>

                {/* Period Breakdown Mini Table Preview */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 overflow-hidden text-xs">
                  <div className="px-3.5 py-2 bg-slate-100/70 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800">
                    <span>{selectedPeriod === '1month' ? 'Haftalık Kırılım' : 'Aylık Kırılım'} ({reportData.breakdown.length} Dönem)</span>
                    <span className="text-[11px] text-slate-400 font-normal">Ciro / Gider / Net Kar</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {reportData.breakdown.map((row, idx) => (
                      <div key={idx} className="px-3.5 py-2 flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-800 dark:text-white">{row.label}</span>
                        <div className="flex items-center gap-3 font-mono text-[11px]">
                          <span className="text-emerald-600 dark:text-emerald-400">+{row.revenue.toLocaleString('tr-TR')}₺</span>
                          <span className="text-red-600 dark:text-red-400">-{row.expenses.toLocaleString('tr-TR')}₺</span>
                          <span className={`font-bold ${row.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
                            {row.netProfit >= 0 ? '+' : ''}{row.netProfit.toLocaleString('tr-TR')}₺
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakdown Mini Info */}
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <span>💵 Nakit: <strong>%{reportData.cashPercent}</strong> | 💳 Kart: <strong>%{reportData.cardPercent}</strong></span>
                  <span>Ort. Sepet: <strong>{reportData.avgBasket.toLocaleString('tr-TR')} ₺</strong></span>
                  <span>Dönem Kaydı: <strong>{reportData.detailedExpenses.length} Gider</strong></span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  onClick={handleGeneratePDF}
                  className="flex-2 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/20 inline-flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  PDF Olarak Kaydet / Yazdır ({reportData.periodLabel})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Yeni Gider Ekle</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Gider Kategorisi
                </label>
                <select
                  value={newExpense.category}
                  onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Açıklama *
                </label>
                <input
                  type="text"
                  required
                  value={newExpense.description}
                  onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="örn: Kasım dönemi elektrik faturası"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" /> Tutar (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newExpense.amount}
                    onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" /> Ödeme Yöntemi
                  </label>
                  <select
                    value={newExpense.paymentMethod}
                    onChange={e => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="Nakit" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Nakit</option>
                    <option value="Kredi Kartı" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Kredi Kartı</option>
                    <option value="Havale" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Havale</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Tarih
                </label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm shadow-indigo-600/20 inline-flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
