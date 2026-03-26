import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Medicines from "./pages/Medicines";
import Checkups from "./pages/Checkups";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import SettingsPage from "./pages/Settings";
import Login from "./pages/Login";
import JoinFamily from "./pages/JoinFamily";
import InviteLanding from "./pages/InviteLanding";
import ShaderHeroDemo from "./pages/ShaderHeroDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/shader-demo" element={<ShaderHeroDemo />} />
          <Route path="/join" element={<JoinFamily />} />
          <Route path="/invite/:token" element={<InviteLanding />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/medicines" element={<Medicines />} />
            <Route path="/checkups" element={<Checkups />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
