import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth"; 

export default function AuthRedirect() {
    const { user, isLoading, isAuth } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoading) {
            return; 
        }
        if (isAuth && user && user.username) {
            navigate(`/${user.username}/profile`, { replace: true }); 
        } 
        else {
            navigate('/login', { replace: true });
        }
    }, [isLoading, isAuth, navigate, user]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white text-xl">
                Проверка статуса авторизации...
            </div>
        );
    }
    return null; 
}