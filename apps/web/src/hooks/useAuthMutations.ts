import { useMutation } from '@tanstack/react-query';
import { loginApi, registerApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const { saveUser } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      saveUser(data.user);
      toast.success('Welcome back!');
      navigate('/board');
    },
    onError: (error: any) => {
      console.error("Login failed", error);
    }
  });
};

export const useRegister = () => {
  const { saveUser } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      saveUser(data.user);
      toast.success('Account created! Welcome.');
      navigate('/board');
    },
  });
};