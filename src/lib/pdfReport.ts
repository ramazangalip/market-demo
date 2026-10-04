import { Sale, Expense } from './mockData';

export type ReportPeriod = '1month' | '3months' | '6months' | '1year';

export interface FinancialReportData {
  period: ReportPeriod;
  periodLabel: string;
  periodTitle: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  netMargin: number;
  grossMargin: number;
  totalTransactions: number;
  totalItemsSold: number;
  avgBasket: number;
  cashRevenue: number;
  cardRevenue: number;
  cashPercent: number;
  cardPercent: number;
  expenseCategories: { category: string; amount: number; percent: number }[];
  breakdown: {
    label: string;
    sublabel?: string;
    revenue: number;
    cost: number;
    grossProfit: number;
    expenses: number;
    netProfit: number;
    margin: number;
  }[];
  detailedExpenses: Expense[];
}

export function calculateReportData(
  period: ReportPeriod,
  sales: Sale[],
  expenses: Expense[]
): FinancialReportData {
  const now = new Date();
  const endDateStr = now.toLocaleDateString('tr-TR');

  let days = 30;
  let periodLabel = '1 Aylık Rapor';
  let periodTitle = '1 Aylık Finansal Rapor (Son 30 Gün)';

  if (period === '1month') {
    days = 30;
    periodLabel = '1 Aylık (Son 30 Gün)';
    periodTitle = '1 Aylık Finansal Gelir - Gider Raporu';
  } else if (period === '3months') {
    days = 90;
    periodLabel = '3 Aylık (Son 90 Gün / Çeyrek)';
    periodTitle = '3 Aylık Finansal Gelir - Gider Raporu (Çeyrek Dönem)';
  } else if (period === '6months') {
    days = 180;
    periodLabel = '6 Aylık (Son 180 Gün / Yarıyıl)';
    periodTitle = '6 Aylık Finansal Gelir - Gider Raporu (Yarıyıl)';
  } else if (period === '1year') {
    days = 365;
    periodLabel = '1 Yıllık (Son 365 Gün / Yıllık)';
    periodTitle = '1 Yıllık Finansal Gelir - Gider Raporu (Yıllık Bilanço)';
  }

  const startTimestamp = now.getTime() - days * 24 * 60 * 60 * 1000;
  const startDateStr = new Date(startTimestamp).toLocaleDateString('tr-TR');

  // Filter within date range
  const filteredSales = sales.filter(s => s.timestamp >= startTimestamp);
  const filteredExpenses = expenses.filter(e => e.timestamp >= startTimestamp);

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalCost = filteredSales.reduce((sum, s) => {
    const cost = s.items.reduce((c, it) => c + (it.purchasePrice || 0) * (it.quantity || 1), 0);
    return sum + cost;
  }, 0);
  const grossProfit = totalRevenue - totalCost;
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  const grossMargin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;
  const netMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  const totalTransactions = filteredSales.length;
  const totalItemsSold = filteredSales.reduce(
    (sum, s) => sum + s.items.reduce((q, it) => q + q - q + it.quantity, 0),
    0
  );
  const avgBasket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Payment Breakdown
  const cashRevenue = filteredSales
    .filter(s => s.paymentMethod === 'cash')
    .reduce((sum, s) => sum + s.total, 0);
  const cardRevenue = filteredSales
    .filter(s => s.paymentMethod === 'card')
    .reduce((sum, s) => sum + s.total, 0);
  const cashPercent = totalRevenue > 0 ? Math.round((cashRevenue / totalRevenue) * 100) : 50;
  const cardPercent = totalRevenue > 0 ? 100 - cashPercent : 50;

  // Category breakdown of expenses
  const catMap: Record<string, number> = {};
  filteredExpenses.forEach(e => {
    catMap[e.category] = (catMap[e.category] || 0) + e.amount;
  });

  const expenseCategories = Object.entries(catMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percent: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Periodic breakdown
  let breakdown: FinancialReportData['breakdown'] = [];

  if (period === '1month') {
    // 4 weeks breakdown for 1 month
    const weeks = [
      { label: '4. Hafta', sublabel: 'Son 7 Gün', start: now.getTime() - 7 * 86400000, end: now.getTime() },
      { label: '3. Hafta', sublabel: '8 - 14 Gün Önce', start: now.getTime() - 14 * 86400000, end: now.getTime() - 7 * 86400000 },
      { label: '2. Hafta', sublabel: '15 - 21 Gün Önce', start: now.getTime() - 21 * 86400000, end: now.getTime() - 14 * 86400000 },
      { label: '1. Hafta', sublabel: '22 - 30 Gün Önce', start: startTimestamp, end: now.getTime() - 21 * 86400000 },
    ].reverse();

    breakdown = weeks.map(w => {
      const wSales = filteredSales.filter(s => s.timestamp >= w.start && s.timestamp <= w.end);
      const wExps = filteredExpenses.filter(e => e.timestamp >= w.start && e.timestamp <= w.end);

      const rev = wSales.reduce((sum, s) => sum + s.total, 0);
      const cost = wSales.reduce((sum, s) => sum + s.items.reduce((c, it) => c + it.purchasePrice * it.quantity, 0), 0);
      const gp = rev - cost;
      const exp = wExps.reduce((sum, e) => sum + e.amount, 0);
      const np = gp - exp;
      const margin = rev > 0 ? Math.round((np / rev) * 100) : 0;

      return {
        label: w.label,
        sublabel: w.sublabel,
        revenue: Math.round(rev),
        cost: Math.round(cost),
        grossProfit: Math.round(gp),
        expenses: Math.round(exp),
        netProfit: Math.round(np),
        margin,
      };
    });
  } else {
    // Monthly breakdown for 3m, 6m, 1y
    const monthMap: Record<
      string,
      { revenue: number; cost: number; grossProfit: number; expenses: number; sortKey: string }
    > = {};

    filteredSales.forEach(s => {
      const d = new Date(s.timestamp);
      const key = d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
      const sortKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;

      if (!monthMap[key]) {
        monthMap[key] = { revenue: 0, cost: 0, grossProfit: 0, expenses: 0, sortKey };
      }
      const saleCost = s.items.reduce((c, it) => c + (it.purchasePrice || 0) * (it.quantity || 1), 0);
      monthMap[key].revenue += s.total;
      monthMap[key].cost += saleCost;
      monthMap[key].grossProfit += s.total - saleCost;
    });

    filteredExpenses.forEach(e => {
      const d = new Date(e.timestamp);
      const key = d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
      const sortKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;

      if (!monthMap[key]) {
        monthMap[key] = { revenue: 0, cost: 0, grossProfit: 0, expenses: 0, sortKey };
      }
      monthMap[key].expenses += e.amount;
    });

    breakdown = Object.entries(monthMap)
      .sort((a, b) => a[1].sortKey.localeCompare(b[1].sortKey))
      .map(([label, data]) => {
        const net = data.grossProfit - data.expenses;
        const margin = data.revenue > 0 ? Math.round((net / data.revenue) * 100) : 0;
        return {
          label,
          revenue: Math.round(data.revenue),
          cost: Math.round(data.cost),
          grossProfit: Math.round(data.grossProfit),
          expenses: Math.round(data.expenses),
          netProfit: Math.round(net),
          margin,
        };
      });
  }

  return {
    period,
    periodLabel,
    periodTitle,
    startDate: startDateStr,
    endDate: endDateStr,
    generatedAt: now.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    totalRevenue: Math.round(totalRevenue),
    totalCost: Math.round(totalCost),
    grossProfit: Math.round(grossProfit),
    totalExpenses: Math.round(totalExpenses),
    netProfit: Math.round(netProfit),
    netMargin,
    grossMargin,
    totalTransactions,
    totalItemsSold,
    avgBasket: Math.round(avgBasket * 100) / 100,
    cashRevenue: Math.round(cashRevenue),
    cardRevenue: Math.round(cardRevenue),
    cashPercent,
    cardPercent,
    expenseCategories,
    breakdown,
    detailedExpenses: filteredExpenses.slice(0, 40),
  };
}

export function printFinancialPDFReport(data: FinancialReportData) {
  const printWindow = window.open('', '_blank', 'width=1050,height=900');
  if (!printWindow) {
    alert('Lütfen PDF raporu yazdırmak için açılır pencerelere (popup) izin verin.');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>MarketPOS_${data.period.toUpperCase()}_Raporu_${data.endDate.replace(/\\./g, '_')}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      padding: 32px;
      line-height: 1.45;
      font-size: 13px;
    }

    .report-container {
      max-width: 900px;
      margin: 0 auto;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2.5px solid #059669;
      padding-bottom: 18px;
      margin-bottom: 22px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-badge {
      width: 46px;
      height: 46px;
      background: #059669;
      color: #ffffff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 800;
    }

    .brand h1 {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .brand p {
      font-size: 12px;
      color: #64748b;
    }

    .meta {
      text-align: right;
    }

    .meta h2 {
      font-size: 16px;
      font-weight: 700;
      color: #059669;
    }

    .meta p {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }

    /* Summary Grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 22px;
    }

    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 14px;
    }

    .kpi-title {
      font-size: 10.5px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }

    .kpi-value {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
    }

    .kpi-value.green { color: #059669; }
    .kpi-value.red { color: #dc2626; }
    .kpi-value.indigo { color: #4f46e5; }

    .kpi-sub {
      font-size: 10.5px;
      color: #94a3b8;
      margin-top: 3px;
    }

    /* Section */
    .section {
      margin-bottom: 22px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
      border-left: 3.5px solid #059669;
      padding-left: 8px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    th {
      background: #f1f5f9;
      color: #475569;
      text-align: left;
      font-weight: 600;
      padding: 8px 10px;
      border-bottom: 1px solid #cbd5e1;
      font-size: 11px;
    }

    td {
      padding: 8px 10px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }

    tr:nth-child(even) td {
      background-color: #fafafa;
    }

    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }
    .font-mono { font-family: monospace; }
    .text-emerald { color: #059669; font-weight: 600; }
    .text-red { color: #dc2626; font-weight: 600; }

    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10.5px;
      font-weight: 600;
    }

    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-gray { background: #f1f5f9; color: #475569; }

    .bar-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #059669;
      border-radius: 3px;
    }

    /* Footer & Signatures */
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
      color: #64748b;
      page-break-inside: avoid;
    }

    .sig-box {
      width: 190px;
      text-align: center;
      border-top: 1px solid #94a3b8;
      padding-top: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #334155;
    }

    @media print {
      body {
        padding: 16px;
        font-size: 11.5px;
      }
      .no-print {
        display: none !important;
      }
      @page {
        size: A4 portrait;
        margin: 10mm 10mm;
      }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <!-- Header -->
    <div class="header">
      <div class="brand">
        <div class="logo-badge">M</div>
        <div>
          <h1>MarketPOS Akıllı Market</h1>
          <p>Mali Denetim & Resmi Gelir-Gider Raporu</p>
        </div>
      </div>
      <div class="meta">
        <h2>${data.periodTitle}</h2>
        <p><strong>Dönem Aralığı:</strong> ${data.startDate} — ${data.endDate}</p>
        <p><strong>Oluşturulma:</strong> ${data.generatedAt}</p>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid">
      <div class="kpi-card">
        <div class="kpi-title">Toplam Satış Geliri</div>
        <div class="kpi-value green">${data.totalRevenue.toLocaleString('tr-TR')} ₺</div>
        <div class="kpi-sub">${data.totalTransactions} Satış İşlemi (${data.totalItemsSold} Ürün)</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Satılan Mal Maliyeti</div>
        <div class="kpi-value">${data.totalCost.toLocaleString('tr-TR')} ₺</div>
        <div class="kpi-sub">Brüt Kar: ${(data.totalRevenue - data.totalCost).toLocaleString('tr-TR')} ₺ (%${data.grossMargin})</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Toplam İşletme Gideri</div>
        <div class="kpi-value red">${data.totalExpenses.toLocaleString('tr-TR')} ₺</div>
        <div class="kpi-sub">${data.expenseCategories.length} Gider Kategorisi</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Dönem Net Kar / Zarar</div>
        <div class="kpi-value ${data.netProfit >= 0 ? 'green' : 'red'}">
          ${data.netProfit >= 0 ? '+' : ''}${data.netProfit.toLocaleString('tr-TR')} ₺
        </div>
        <div class="kpi-sub">Net Kar Marjı: %${data.netMargin}</div>
      </div>
    </div>

    <!-- Period Breakdown Table -->
    <div class="section">
      <div class="section-title">1. ${data.period === '1month' ? 'Haftalık' : 'Aylık'} Gelir - Gider & Kar Tablosu</div>
      <table>
        <thead>
          <tr>
            <th>${data.period === '1month' ? 'Hafta / Dönem' : 'Dönem / Ay'}</th>
            <th class="text-right">Satış Cirosu</th>
            <th class="text-right">Mal Maliyeti</th>
            <th class="text-right">Brüt Kar</th>
            <th class="text-right">İşletme Gideri</th>
            <th class="text-right">Net Kar / Zarar</th>
            <th class="text-center">Net Marj</th>
          </tr>
        </thead>
        <tbody>
          ${data.breakdown
            .map(
              m => `
            <tr>
              <td class="font-bold">
                ${m.label}
                ${m.sublabel ? `<span style="font-size:10px; color:#64748b; font-weight:normal; margin-left:4px;">(${m.sublabel})</span>` : ''}
              </td>
              <td class="text-right">${m.revenue.toLocaleString('tr-TR')} ₺</td>
              <td class="text-right">${m.cost.toLocaleString('tr-TR')} ₺</td>
              <td class="text-right text-emerald">+${m.grossProfit.toLocaleString('tr-TR')} ₺</td>
              <td class="text-right text-red">-${m.expenses.toLocaleString('tr-TR')} ₺</td>
              <td class="text-right font-bold ${m.netProfit >= 0 ? 'text-emerald' : 'text-red'}">
                ${m.netProfit >= 0 ? '+' : ''}${m.netProfit.toLocaleString('tr-TR')} ₺
              </td>
              <td class="text-center">
                <span class="badge ${m.margin >= 0 ? 'badge-green' : 'badge-red'}">%${m.margin}</span>
              </td>
            </tr>
          `
            )
            .join('')}
          <tr style="background:#f8fafc; font-weight:700; border-top:2px solid #cbd5e1;">
            <td>GENEL TOPLAM (${data.periodLabel})</td>
            <td class="text-right">${data.totalRevenue.toLocaleString('tr-TR')} ₺</td>
            <td class="text-right">${data.totalCost.toLocaleString('tr-TR')} ₺</td>
            <td class="text-right text-emerald">+${data.grossProfit.toLocaleString('tr-TR')} ₺</td>
            <td class="text-right text-red">-${data.totalExpenses.toLocaleString('tr-TR')} ₺</td>
            <td class="text-right ${data.netProfit >= 0 ? 'text-emerald' : 'text-red'}">
              ${data.netProfit >= 0 ? '+' : ''}${data.netProfit.toLocaleString('tr-TR')} ₺
            </td>
            <td class="text-center">
              <span class="badge ${data.netMargin >= 0 ? 'badge-green' : 'badge-red'}">%${data.netMargin}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Expense Category Breakdown & Payment Stats Grid -->
    <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 16px;" class="section">
      <!-- Category Breakdown -->
      <div>
        <div class="section-title">2. Gider Kategorileri Dağılımı</div>
        <table>
          <thead>
            <tr>
              <th>Gider Kategorisi</th>
              <th class="text-right">Toplam Tutar</th>
              <th style="width: 110px;">Payı (%)</th>
            </tr>
          </thead>
          <tbody>
            ${data.expenseCategories
              .map(
                cat => `
              <tr>
                <td class="font-bold">${cat.category}</td>
                <td class="text-right text-red">-${cat.amount.toLocaleString('tr-TR')} ₺</td>
                <td>
                  <div class="bar-wrap">
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${cat.percent}%; background:#ef4444;"></div>
                    </div>
                    <span style="font-size:10px; font-weight:600; color:#64748b; width:26px;">%${cat.percent}</span>
                  </div>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <!-- Payment Methods & Kasa Summary -->
      <div>
        <div class="section-title">3. Ödeme & Kasa Dağılımı</div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px;">
            <span>💵 Nakit Satışlar</span>
            <strong>${data.cashRevenue.toLocaleString('tr-TR')} ₺ (%${data.cashPercent})</strong>
          </div>
          <div class="progress-bar" style="margin-bottom:12px;">
            <div class="progress-fill" style="width:${data.cashPercent}%;"></div>
          </div>

          <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:12px;">
            <span>💳 Kredi Kartı Satışlar</span>
            <strong>${data.cardRevenue.toLocaleString('tr-TR')} ₺ (%${data.cardPercent})</strong>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${data.cardPercent}%; background:#6366f1;"></div>
          </div>
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; font-size:11.5px; color:#475569;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span>Ortalama Sepet Tutarı:</span>
            <strong>${data.avgBasket.toLocaleString('tr-TR')} ₺</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>Brüt Kar Marjı:</span>
            <strong class="text-emerald">%${data.grossMargin}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Expense Transactions -->
    <div class="section">
      <div class="section-title">4. Dönem İçindeki Başlıca Gider Kalemleri</div>
      <table>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Kategori</th>
            <th>Açıklama</th>
            <th>Ödeme Şekli</th>
            <th class="text-right">Tutar</th>
          </tr>
        </thead>
        <tbody>
          ${data.detailedExpenses
            .slice(0, 15)
            .map(
              e => `
            <tr>
              <td class="font-mono text-center" style="font-size:11px;">${e.date}</td>
              <td><span class="badge badge-gray">${e.category}</span></td>
              <td>${e.description}</td>
              <td><span style="font-size:11px; color:#64748b;">${e.paymentMethod}</span></td>
              <td class="text-right text-red">-${e.amount.toLocaleString('tr-TR')} ₺</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>
        <p>MarketPOS Otomatik Finansal Denetim ve Muhasebe Sistemi</p>
        <p>Rapor Kodu: RPR-${data.period.toUpperCase()}-${Date.now().toString().slice(-6)}</p>
      </div>
      <div class="sig-box">
        İşletme Yetkilisi / Kaşe - İmza
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
