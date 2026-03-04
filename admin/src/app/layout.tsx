import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IG Reply Helper – Admin',
  description: 'Manage Instagram DM auto-replies',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white shadow-sm">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-6">
            <span className="text-xl font-bold tracking-tight">WorkWear IG 回覆小幫手</span>
            <nav className="flex gap-4 text-sm font-medium text-gray-500">
              <a href="/" className="hover:text-gray-900">概覽</a>
              <a href="/conversations" className="hover:text-gray-900">對話</a>
              <a href="/faqs" className="hover:text-gray-900">常見問題</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
