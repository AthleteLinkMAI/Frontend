import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getCookie } from "@/lib/csrf";

interface User {
    full_name: string,
    username: string,
    email: string,
    telegram: string,
    gender: string,
    birth_date: string,
    city: string,
    secret_question?: string | null,
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const fetchUser = async (): Promise<User | null> => {
  const response = await fetch(`${apiUrl}/profile/me`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    return null;
  }
  return response.json();
};

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ['auth-user'],
    queryFn: fetchUser,
    retry: false, 
    staleTime: 1000 * 60 * 5,
  });

  const logoutUser = async () => {
    try {
        const csrfToken = getCookie('csrftoken');
        if (!csrfToken) {
          console.error('no csrf token')
        }


        const response = await fetch(`${apiUrl}/user/logout/`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken || '',
            },
            credentials: 'include', 
        });

        if (response.ok) {
            queryClient.setQueryData(['auth-user'], null);
            console.log('Successfull logout');
            navigate('/'); 
            
            return true;
        } else {
            console.error("Logout failed on server side.");
            queryClient.setQueryData(['auth-user'], null);
            navigate('/'); 
            return false;
        }
    } catch (error) {
        console.error("Network error during logout:", error);
        queryClient.setQueryData(['auth-user'], null);
        navigate('/login');
        return false;
    }
  };

  return {
    user,           
    isLoading,      
    isAuth: !!user,
    logoutUser,
    refetchUser: refetch,
  };
}