import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProfileOwnerGuard from "./components/guards/ProfileOwnerGuard";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Authors from "./pages/Authors"
import AuthRedirect from "./pages/ProtectedProfile";
import ProfileStats from "./pages/ProfileStats";
import PublicProfile from "./pages/PublicProfile";
import Requests from "./pages/Requests";
import Settings from "./pages/Settings";
import AllRequests from "./pages/AllRequests";
import RequestData from "./pages/RequestData";
import CreateRequest from "./pages/CreateRequest";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* --- ПУБЛИЧНЫЕ МАРШРУТЫ (Доступны всем) --- */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<AuthRedirect />} />
          <Route path="/requests" element={<AllRequests />} />
          {/* --- ПРИВАТНЫЕ МАРШРУТЫ (Только для авторизованных) --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/:username" element={<PublicProfile />} />
            <Route path="/:username/authors" element={<ProfileOwnerGuard><Authors /></ProfileOwnerGuard>} />
            <Route path="/:username/profile" element={<ProfileOwnerGuard><Profile /></ProfileOwnerGuard>} />
            <Route path="/:username/stats" element={<ProfileOwnerGuard><ProfileStats /></ProfileOwnerGuard>} />
            <Route path="/:username/requests" element={<ProfileOwnerGuard><Requests /></ProfileOwnerGuard>} />
            <Route path="/:username/settings" element={<ProfileOwnerGuard><Settings /></ProfileOwnerGuard>} />
            <Route path="/requests/:id" element={<RequestData />} />
            <Route path="/requests/create" element={<CreateRequest />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
