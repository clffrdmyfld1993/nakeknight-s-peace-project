import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SiteNav from "./components/SiteNav";
import Index from "./pages/Index.tsx";
import Command from "./pages/Command.tsx";
import Store from "./pages/Store.tsx";
import License from "./pages/License.tsx";
import Pitch from "./pages/Pitch.tsx";
import Costumes from "./pages/Costumes.tsx";
import Social from "./pages/Social.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SiteNav />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/command" element={<Command />} />
          <Route path="/store" element={<Store />} />
          <Route path="/license" element={<License />} />
          <Route path="/pitch" element={<Pitch />} />
          <Route path="/costumes" element={<Costumes />} />
          <Route path="/social" element={<Social />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
