import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import ToastContainer from '@/components/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MarketPOS - Akıllı Market Yönetim Sistemi',
  description: 'Bakkal ve market işletmeleri için modern POS ve yönetim çözümü',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 antialiased min-h-screen selection:bg-emerald-500 selection:text-white`}>
        <StoreProvider>
          <Sidebar />
          <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
            {children}
            <footer className="lg:hidden px-4 pb-28 pt-2 text-center text-[10px] text-slate-400/80 dark:text-slate-500/80">
              Bu sistem{' '}
              <a
                href="https://visiondevstudio.com.tr/"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-slate-600 dark:hover:text-slate-300"
              >
                VisionDevStudio
              </a>{' '}
              tarafından tasarlanmıştır.
            </footer>
          </main>
          <ToastContainer />
        </StoreProvider>
      </body>
    </html>
  );
}
