import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";


const ProfileOwnerGuard = ({ children }) => {
    const { nickname } = useParams();
    const { user, isLoading } = useAuth();
	// console.log("guard check", user);
    if(isLoading){
        return <div className="text-white text-center p-10">Загрузка данных профиля...</div>;
    }
    if(!user){
        console.log('Сюды нельзя');
        return <Navigate to="/register" replace />;
    }
    if(user.nickname !== nickname) {
        console.log('Низя');
        return <Navigate to={`/${nickname}/`} replace />;
    }
    return <>{children}</>;
}

export default ProfileOwnerGuard;