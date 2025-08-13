"use client";

import RefreshToken from "@/components/refresh-token";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable refetching on window focus
      refetchOnMount: false, // Disable refetching on mount
    },
  },
});

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      {children}
      <RefreshToken />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
