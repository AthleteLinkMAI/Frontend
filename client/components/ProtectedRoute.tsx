import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { tokenStorage } from "@/lib/tokenStorage";

export default function ProtectedRoute() {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-black text-white">
				Загрузка...
			</div>
		);
	}

	if (!user && !tokenStorage.getAccess()) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
}