'use client';

import { BankingProvider } from '@/context/BankingContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <BankingProvider>{children}</BankingProvider>;
}
