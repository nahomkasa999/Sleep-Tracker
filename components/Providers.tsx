"use client"

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PopupProvider } from '@/context/PopUpContext';


interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {

 const [queryClient] = useState(() => new QueryClient());

return (
    <QueryClientProvider client={queryClient}>
    <PopupProvider>
      {children}
    </PopupProvider>
    </QueryClientProvider>
  );
}