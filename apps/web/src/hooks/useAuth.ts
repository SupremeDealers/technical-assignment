import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';

interface AuthState {
    user: User | null;
    isLoading: boolean;
}

export function useAuth() {
    const navigate = useNavigate();
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isLoading: true,
    });

    useEffect(() => {
        // Try to load user from localStorage
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                const user = JSON.parse(storedUser) as User;
                setAuthState({ user, isLoading: false });
            } catch {
                // Invalid stored user data, clear everything
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setAuthState({ user: null, isLoading: false });
            }
        } else {
            setAuthState({ user: null, isLoading: false });
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({ user: null, isLoading: false });
        navigate('/auth/login');
    }, [navigate]);

    const setUser = useCallback((user: User) => {
        localStorage.setItem('user', JSON.stringify(user));
        setAuthState({ user, isLoading: false });
    }, []);

    return {
        user: authState.user,
        isLoading: authState.isLoading,
        isAuthenticated: !!authState.user,
        logout,
        setUser,
    };
}
