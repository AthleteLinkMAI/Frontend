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
import PasswordResetRequest from "./pages/PasswordResetRequest";
import PasswordResetConfirm from "./pages/PasswordResetConfirm";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

export const App = () => (
	<QueryClientProvider client={queryClient}>
		<TooltipProvider>
			<Toaster />
			<Sonner />
			<BrowserRouter
			future={{
				v7_startTransition: true,
				v7_relativeSplatPath: true,
			}}>
				<ErrorBoundary>
					<Routes>
						{/* --- ПУБЛИЧНЫЕ МАРШРУТЫ (Доступны всем) --- */}
						<Route path="/" element={<Index />} />

						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route path="/password-reset" element={<PasswordResetRequest />} />
						<Route path="/password-reset/confirm" element={<PasswordResetConfirm />} />
						<Route path="/profile/:nickname" element={<AuthRedirect />} />

						<Route path="/authors" element={<Authors />} />

						<Route path="/user/:userId" element={<PublicProfile />} />

						{/* --- ПРИВАТНЫЕ МАРШРУТЫ (Только для авторизованных) --- */}
						<Route element={<ProtectedRoute />}>
							{/* <Route path="/stats" element={<ProfileStats />} /> */}
							<Route path="/profile" element={<Profile />} />
							<Route path="/my-requests" element={<Requests />} />
							<Route path="/settings" element={<Settings />} />
							<Route path="/requests" element={<AllRequests />} />
							<Route path="/requests/:id" element={<RequestData />} />
							<Route path="/requests/create" element={<CreateRequest />} />
							<Route path="/leaderboard" element={<Leaderboard />} />
						</Route>

						<Route path="*" element={<NotFound />} />
					</Routes>
				</ErrorBoundary>
			</BrowserRouter>
		</TooltipProvider>
	</QueryClientProvider>
);
