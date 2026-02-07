import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLogin, useRegister } from '../hooks/useAuthMutations';
import { cn } from '../utils/cn';
import { KanbanSquare } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const { register, handleSubmit, formState: { errors }, reset, clearErrors } = useForm();

  useEffect(() => {
    reset();
    clearErrors();
  }, [isLogin, reset, clearErrors]);

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  const onSubmit = (data: any) => {
    if (isLogin) {
      loginMutation.mutate(data);
    } else {
      registerMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2 bg-gray-100 p-4">
       <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg shadow-md">
          <KanbanSquare className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Task Management
        </h1>
      </div>
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Name Field - Only for Register */}
          {!isLogin && (
            <div>
              <input 
                {...register('name', { 
                  required: !isLogin && 'Full Name is required' 
                })} 
                placeholder="Full Name"
                className={cn(
                  "w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
                  errors.name ? "border-red-500" : "border-gray-300"
                )}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>
              )}
            </div>
          )}
          
          {/* Email Field */}
          <div>
            <input 
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })} 
              placeholder="Email"
              className={cn(
                "w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
                errors.email ? "border-red-500" : "border-gray-300"
              )}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{String(errors.email.message)}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <input 
              type="password" 
              {...register('password', { 
                required: 'Password is required', 
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })} 
              placeholder="Password"
              className={cn(
                "w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
                errors.password ? "border-red-500" : "border-gray-300"
              )}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{String(errors.password.message)}</p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={cn(
              "w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition-colors",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}