'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Product,
  CartItem,
  Sale,
  Expense,
  initialProducts,
  initialExpenses,
  generateMockSales,
} from './mockData';

interface StoreContextType {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  cart: CartItem[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQty: (productId: string, delta: number) => void;
  clearCart: () => void;
  completeSale: (paymentMethod: 'cash' | 'card') => Sale | null;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp'>) => void;
  toasts: Toast[];
  dismissToast: (id: string) => void;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const StoreContext = createContext<StoreContextType | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [initialized, setInitialized] = useState(false);

  // Initialize from localStorage or defaults
  useEffect(() => {
    try {
      const DATA_VERSION = 'v4';
      const storedVersion = localStorage.getItem('market-data-version');
      const storedTheme = localStorage.getItem('market-theme') as 'light' | 'dark' | null;

      let prods = initialProducts;
      let exps = initialExpenses;
      let sls = generateMockSales(initialProducts);

      if (storedVersion === DATA_VERSION) {
        const storedProducts = localStorage.getItem('market-products');
        const storedSales = localStorage.getItem('market-sales');
        const storedExpenses = localStorage.getItem('market-expenses');

        if (storedProducts) prods = JSON.parse(storedProducts);
        if (storedSales) sls = JSON.parse(storedSales);
        if (storedExpenses) exps = JSON.parse(storedExpenses);
      } else {
        // Upgrade to full 1-year historical dataset
        localStorage.setItem('market-data-version', DATA_VERSION);
        localStorage.setItem('market-products', JSON.stringify(prods));
        localStorage.setItem('market-sales', JSON.stringify(sls));
        localStorage.setItem('market-expenses', JSON.stringify(exps));
      }

      setProducts(prods);
      setSales(sls);
      setExpenses(exps);

      if (storedTheme === 'dark' || storedTheme === 'light') {
        setThemeState(storedTheme);
        document.documentElement.classList.toggle('dark', storedTheme === 'dark');
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setThemeState('dark');
        document.documentElement.classList.add('dark');
      } else {
        setThemeState('light');
        document.documentElement.classList.remove('dark');
      }
    } catch {
      setProducts(initialProducts);
      setSales(generateMockSales(initialProducts));
      setExpenses(initialExpenses);
    }
    setInitialized(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem('market-products', JSON.stringify(products));
  }, [products, initialized]);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem('market-sales', JSON.stringify(sales));
  }, [sales, initialized]);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem('market-expenses', JSON.stringify(expenses));
  }, [expenses, initialized]);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('market-theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('market-theme', nextTheme);
        document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      } catch {
        // ignore
      }
      return nextTheme;
    });
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToCart = useCallback((product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateCartItemQty = useCallback((productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: Math.min(newQty, item.stock) };
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const completeSale = useCallback(
    (paymentMethod: 'cash' | 'card') => {
      if (cart.length === 0) return null;

      const total = cart.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
      const profit = cart.reduce(
        (sum, item) => sum + (item.salePrice - item.purchasePrice) * item.quantity,
        0
      );
      const receiptNo = `#${1000 + sales.length + 1}`;
      const now = new Date();

      const sale: Sale = {
        id: `sale-${Date.now()}`,
        receiptNo,
        items: [...cart],
        total: Math.round(total * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        paymentMethod,
        date: now.toISOString().split('T')[0],
        timestamp: now.getTime(),
      };

      // Decrease stock
      setProducts(prev =>
        prev.map(p => {
          const cartItem = cart.find(c => c.id === p.id);
          if (cartItem) {
            return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
          }
          return p;
        })
      );

      setSales(prev => [...prev, sale]);
      setCart([]);
      showToast(`Satış Başarılı! Fiş No: ${receiptNo}`, 'success');

      return sale;
    },
    [cart, sales.length, showToast]
  );

  const addProduct = useCallback(
    (product: Omit<Product, 'id'>) => {
      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
      };
      setProducts(prev => [...prev, newProduct]);
      showToast(`"${product.name}" ürün listesine eklendi.`, 'success');
    },
    [showToast]
  );

  const updateProduct = useCallback(
    (updatedProduct: Product) => {
      setProducts(prev =>
        prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
      );
      setCart(prev =>
        prev
          .map(item =>
            item.id === updatedProduct.id
              ? {
                  ...item,
                  name: updatedProduct.name,
                  barcode: updatedProduct.barcode,
                  category: updatedProduct.category,
                  purchasePrice: updatedProduct.purchasePrice,
                  salePrice: updatedProduct.salePrice,
                  stock: updatedProduct.stock,
                  emoji: updatedProduct.emoji,
                  quickAccess: updatedProduct.quickAccess,
                  quantity: Math.min(item.quantity, updatedProduct.stock),
                }
              : item
          )
          .filter(item => item.quantity > 0)
      );
      showToast(`"${updatedProduct.name}" bilgileri güncellendi.`, 'success');
    },
    [showToast]
  );

  const deleteProduct = useCallback(
    (productId: string) => {
      setProducts(prev => prev.filter(p => p.id !== productId));
      setCart(prev => prev.filter(item => item.id !== productId));
      showToast('Ürün silindi.', 'info');
    },
    [showToast]
  );

  const addExpense = useCallback(
    (expense: Omit<Expense, 'id' | 'timestamp'>) => {
      const newExpense: Expense = {
        ...expense,
        id: `e-${Date.now()}`,
        timestamp: Date.now(),
      };
      setExpenses(prev => [...prev, newExpense]);
      showToast('Gider kaydedildi.', 'success');
    },
    [showToast]
  );

  if (!initialized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 dark:text-slate-600 text-lg font-medium">MarketPOS Yükleniyor...</div>
      </div>
    );
  }

  return (
    <StoreContext.Provider
      value={{
        products,
        sales,
        expenses,
        cart,
        theme,
        toggleTheme,
        setTheme,
        addToCart,
        removeFromCart,
        updateCartItemQty,
        clearCart,
        completeSale,
        addProduct,
        updateProduct,
        deleteProduct,
        addExpense,
        toasts,
        dismissToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
