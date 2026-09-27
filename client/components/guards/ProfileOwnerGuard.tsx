import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";


const ProfileOwnerGuard = ({ children }) => {
    const { username } = useParams();
    const { user, isLoading } = useAuth();
    if(isLoading){
        return <div className="text-white text-center p-10">Загрузка данных профиля...</div>;
    }
    if(!user){
        console.log('Сюды нельзя');
        return <Navigate to="/" replace />;
    }
    if(user.username !== username) {
        console.log('Низя');
        return <Navigate to={`/${username}/`} replace />;
    }
    return <>{children}</>;
}

export default ProfileOwnerGuard;