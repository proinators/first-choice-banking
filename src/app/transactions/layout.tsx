import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#031d44] to-[#04395e] text-white">
      {/* Header */}
      <div className="bg-white/10 shadow-sm backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-white">First Choice Banking</h1>
        </div>
      </div>
      
      {/* Main Content */}
      <main className={`${inter.className} max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white`}>
        {children}
      </main>
    </div>
  );
}
