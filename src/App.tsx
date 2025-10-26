import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "@/lib/app-context";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Pool from "@/pages/Pool";
import VsAIPool from "@/pages/VsAIPool";
import VsMarketPool from "@/pages/VsMarketPool";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pool/:id" element={<Pool />} />
            <Route path="/vsai/pool/:id" element={<VsAIPool />} />
            <Route path="/vsmarket/pool/:id" element={<VsMarketPool />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;


