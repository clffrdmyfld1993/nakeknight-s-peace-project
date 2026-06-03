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
import Analytics from "./pages/Analytics.tsx";
import Coverage from "./pages/Coverage.tsx";
import About from "./pages/About.tsx";
import Press from "./pages/Press.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Join from "./pages/Join.tsx";
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
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/coverage" element={<Coverage />} />
          <Route path="/about" element={<About />} />
          <Route path="/press" element={<Press />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/join" element={<Join />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
