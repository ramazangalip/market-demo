export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  quickAccess?: boolean;
  emoji?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  receiptNo: string;
  items: CartItem[];
  total: number;
  profit: number;
  paymentMethod: 'cash' | 'card';
  date: string;
  timestamp: number;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  date: string;
  timestamp: number;
}

export const EXPENSE_CATEGORIES = [
  'Toptancı Ödemesi',
  'Dükkan Kirası',
  'Personel Maaşı',
  'Elektrik Faturası',
  'Su Faturası',
  'Doğalgaz Faturası',
  'Temizlik Malzemesi',
  'Vergi & Muhasebe',
  'Bakım & Onarım',
  'Diğer',
];

export const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Ülker Çikolatalı Gofret',
    barcode: '8690504011234',
    category: 'Atıştırmalık',
    purchasePrice: 8,
    salePrice: 12,
    stock: 3,
    emoji: '🍫',
  },
  {
    id: '2',
    name: 'Sütaş Süt 1L',
    barcode: '8690123456789',
    category: 'Süt Ürünleri',
    purchasePrice: 28,
    salePrice: 36,
    stock: 14,
    quickAccess: true,
    emoji: '🥛',
  },
  {
    id: '3',
    name: 'Somun Ekmek',
    barcode: '8690000000011',
    category: 'Fırın',
    purchasePrice: 8,
    salePrice: 10,
    stock: 4,
    quickAccess: true,
    emoji: '🍞',
  },
  {
    id: '4',
    name: 'Çaykur Rize Turist Çay 1kg',
    barcode: '8690888777665',
    category: 'İçecek',
    purchasePrice: 180,
    salePrice: 220,
    stock: 8,
    emoji: '🍵',
  },
  {
    id: '5',
    name: 'Erikli Su 0.5L',
    barcode: '8690111222333',
    category: 'İçecek',
    purchasePrice: 4,
    salePrice: 7.5,
    stock: 45,
    quickAccess: true,
    emoji: '💧',
  },
  {
    id: '6',
    name: 'Yumurta (15\'li)',
    barcode: '8690555444333',
    category: 'Temel Gıda',
    purchasePrice: 65,
    salePrice: 85,
    stock: 12,
    quickAccess: true,
    emoji: '🥚',
  },
  {
    id: '7',
    name: 'Banvit Tavuk Göğüs 1kg',
    barcode: '8690666777888',
    category: 'Et & Tavuk',
    purchasePrice: 140,
    salePrice: 180,
    stock: 5,
    emoji: '🍗',
  },
  {
    id: '8',
    name: 'Torku Tam Buğday Makarna',
    barcode: '8690777888999',
    category: 'Temel Gıda',
    purchasePrice: 18,
    salePrice: 25,
    stock: 22,
    emoji: '🍝',
  },
  {
    id: '9',
    name: 'Coca-Cola 1L',
    barcode: '8690333444555',
    category: 'İçecek',
    purchasePrice: 22,
    salePrice: 32,
    stock: 18,
    quickAccess: true,
    emoji: '🥤',
  },
  {
    id: '10',
    name: 'Domates (1kg)',
    barcode: '8690444555666',
    category: 'Meyve & Sebze',
    purchasePrice: 25,
    salePrice: 38,
    stock: 10,
    emoji: '🍅',
  },
  {
    id: '11',
    name: 'Eti Tutku Bisküvi',
    barcode: '8690999888777',
    category: 'Atıştırmalık',
    purchasePrice: 12,
    salePrice: 18,
    stock: 2,
    emoji: '🍪',
  },
  {
    id: '12',
    name: 'Sana Margarin 250g',
    barcode: '8690222111000',
    category: 'Süt Ürünleri',
    purchasePrice: 32,
    salePrice: 42,
    stock: 7,
    emoji: '🧈',
  },
];

// Generate 12 months of realistic expenses
export function generateInitialExpenses(): Expense[] {
  const expenses: Expense[] = [];
  const now = new Date();
  let expId = 1;

  for (let m = 0; m < 12; m++) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;
    const monthStr = month.toString().padStart(2, '0');
    const monthName = targetDate.toLocaleDateString('tr-TR', { month: 'long' });

    // Dükkan Kirası
    expenses.push({
      id: `e-${expId++}`,
      category: 'Dükkan Kirası',
      description: `${monthName} ayı dükkan kirası`,
      amount: 18000,
      paymentMethod: 'Havale',
      date: `${year}-${monthStr}-01`,
      timestamp: new Date(`${year}-${monthStr}-01T10:00:00`).getTime(),
    });

    // Personel Maaşı
    expenses.push({
      id: `e-${expId++}`,
      category: 'Personel Maaşı',
      description: `Kasiyer & Personel - ${monthName} maaşı`,
      amount: 22000,
      paymentMethod: 'Havale',
      date: `${year}-${monthStr}-01`,
      timestamp: new Date(`${year}-${monthStr}-01T11:00:00`).getTime(),
    });

    // Elektrik Faturası
    expenses.push({
      id: `e-${expId++}`,
      category: 'Elektrik Faturası',
      description: `${monthName} elektrik tüketim faturası`,
      amount: 3200 + (m % 3) * 250,
      paymentMethod: m % 2 === 0 ? 'Nakit' : 'Kredi Kartı',
      date: `${year}-${monthStr}-15`,
      timestamp: new Date(`${year}-${monthStr}-15T14:30:00`).getTime(),
    });

    // Su Faturası
    expenses.push({
      id: `e-${expId++}`,
      category: 'Su Faturası',
      description: `${monthName} su tüketim faturası`,
      amount: 850 + (m % 4) * 80,
      paymentMethod: 'Kredi Kartı',
      date: `${year}-${monthStr}-18`,
      timestamp: new Date(`${year}-${monthStr}-18T09:15:00`).getTime(),
    });

    // Doğalgaz Faturası
    const isWinter = [11, 0, 1, 2].includes(targetDate.getMonth());
    expenses.push({
      id: `e-${expId++}`,
      category: 'Doğalgaz Faturası',
      description: `${monthName} ısınma ve doğalgaz gideri`,
      amount: isWinter ? 3400 : 1200,
      paymentMethod: 'Havale',
      date: `${year}-${monthStr}-22`,
      timestamp: new Date(`${year}-${monthStr}-22T16:00:00`).getTime(),
    });

    // Toptancı Ödemeleri (ayda 3 kez)
    for (let w = 1; w <= 3; w++) {
      const day = (w * 7 + 2).toString().padStart(2, '0');
      expenses.push({
        id: `e-${expId++}`,
        category: 'Toptancı Ödemesi',
        description: `Hafta ${w} gıda ve içecek toptancı sevkiyatı`,
        amount: 11500 + ((m + w) % 4) * 900,
        paymentMethod: 'Havale',
        date: `${year}-${monthStr}-${day}`,
        timestamp: new Date(`${year}-${monthStr}-${day}T12:00:00`).getTime(),
      });
    }

    // Temizlik Malzemesi
    expenses.push({
      id: `e-${expId++}`,
      category: 'Temizlik Malzemesi',
      description: `${monthName} sarf & hijyen malzemeleri`,
      amount: 1450 + (m % 3) * 150,
      paymentMethod: 'Nakit',
      date: `${year}-${monthStr}-10`,
      timestamp: new Date(`${year}-${monthStr}-10T13:45:00`).getTime(),
    });
  }

  return expenses.sort((a, b) => b.timestamp - a.timestamp);
}

export const initialExpenses: Expense[] = generateInitialExpenses();

// Generate mock sales for last 365 days
export function generateMockSales(products: Product[]): Sale[] {
  const sales: Sale[] = [];
  const now = new Date();
  let receiptCounter = 1000;

  for (let dayOffset = 365; dayOffset >= 0; dayOffset--) {
    const day = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    const dateStr = day.toISOString().split('T')[0];

    // More density in recent days, steady across the whole year
    const numSales = dayOffset <= 30 ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 3) + 4;

    for (let s = 0; s < numSales; s++) {
      receiptCounter++;
      const numItems = Math.floor(Math.random() * 4) + 1;
      const items: CartItem[] = [];
      let total = 0;
      let profit = 0;

      for (let i = 0; i < numItems; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 3) + 1;
        const existing = items.find(it => it.id === product.id);
        if (existing) {
          existing.quantity += qty;
        } else {
          items.push({ ...product, quantity: qty });
        }
        total += product.salePrice * qty;
        profit += (product.salePrice - product.purchasePrice) * qty;
      }

      sales.push({
        id: `sale-${receiptCounter}`,
        receiptNo: `#${receiptCounter}`,
        items,
        total: Math.round(total * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        paymentMethod: Math.random() > 0.4 ? 'cash' : 'card',
        date: dateStr,
        timestamp: day.getTime() + s * 1200000 + 28800000,
      });
    }
  }

  return sales;
}

export function getDailySalesData(sales: Sale[]) {
  const dailyMap: Record<string, { date: string; ciro: number; kar: number; islemSayisi: number }> = {};
  const now = new Date();

  // Last 7 days only for dashboard mini chart
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    dailyMap[dateStr] = { date: dateStr, ciro: 0, kar: 0, islemSayisi: 0 };
  }

  sales.forEach(sale => {
    if (dailyMap[sale.date]) {
      dailyMap[sale.date].ciro += sale.total;
      dailyMap[sale.date].kar += sale.profit;
      dailyMap[sale.date].islemSayisi += 1;
    }
  });

  return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date)).map(d => ({
    ...d,
    ciro: Math.round(d.ciro),
    kar: Math.round(d.kar),
    label: new Date(d.date).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' }),
  }));
}

export function getTopProducts(sales: Sale[]) {
  const productMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productMap[item.id]) {
        productMap[item.id] = { name: item.name, quantity: 0, revenue: 0 };
      }
      productMap[item.id].quantity += item.quantity;
      productMap[item.id].revenue += item.salePrice * item.quantity;
    });
  });

  return Object.values(productMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map(p => ({ ...p, revenue: Math.round(p.revenue) }));
}
