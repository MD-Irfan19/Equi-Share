// Core dependencies
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// UI Components
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Auth & Layout
import { AuthProvider } from "./hooks/useAuth";
import { AuthGuard } from "./components/AuthGuard";
import Layout from "./components/Layout";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Groups from "./pages/Groups";
import GroupCreateJoin from "./pages/GroupCreateJoin";
import GroupDashboard from "./pages/GroupDashboard";
import NewExpense from "./pages/NewExpense";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import Demo from "@/pages/Demo";

// Initialize React Query client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* Protected dashboard routes */}
            <Route path="/dashboard" element={<AuthGuard><Layout /></AuthGuard>}>
              <Route index element={<Dashboard />} />
              
              {/* Group management */}
              <Route path="groups" element={<Groups />} />
              <Route path="groups/new" element={<GroupCreateJoin />} />
              <Route path="groups/:groupId" element={<GroupDashboard />} />
              
              {/* Financial features */}
              <Route path="expenses" element={<div>Expenses Page Coming Soon</div>} />
              <Route path="expenses/new" element={<NewExpense />} />
              <Route path="settlements" element={<div>Settlements Page Coming Soon</div>} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reports" element={<div>Reports Page Coming Soon</div>} />
            </Route>

            <Route path="/demo" element={<Demo />} />

            {/* 404 handler */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
