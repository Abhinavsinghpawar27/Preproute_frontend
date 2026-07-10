import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/useAuthStore';

// Validation Schema
const loginSchema = z.object({
  userId: z.string().min(1, { message: 'User ID is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange', // Validate on change so the button disabled state is reactive
    defaultValues: {
      userId: '',
      password: '',
    },
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      // Real API shape: { status: "success", data: { token, user } }
      if (response.status === 'success' && response.data?.token && response.data?.user) {
        login(response.data.token, response.data.user);
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const apiMessage = error?.response?.data?.message || 'Failed to connect to authentication server.';
      toast.error(apiMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Column: Line-art Illustration panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#EBF0FC] items-center justify-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 text-[#5B7FEC] opacity-40 text-2xl font-bold select-none">+</div>
        <div className="absolute bottom-20 right-20 text-[#5B7FEC] opacity-40 text-3xl font-bold select-none">+</div>
        <div className="absolute top-1/3 right-12 w-6 h-6 rounded-full border-4 border-[#5B7FEC] opacity-20"></div>
        <div className="absolute bottom-1/4 left-16 w-8 h-8 rounded-full border-4 border-[#5B7FEC] opacity-20"></div>
        
        {/* Line art illustration */}
        <div className="w-full max-w-md p-8 flex flex-col items-center">
          <svg
            viewBox="0 0 400 300"
            className="w-full h-auto text-gray-700"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Table */}
            <line x1="40" y1="200" x2="360" y2="200" stroke="#374151" strokeWidth="4" />
            <line x1="80" y1="200" x2="80" y2="280" stroke="#374151" strokeWidth="3" />
            <line x1="320" y1="200" x2="320" y2="280" stroke="#374151" strokeWidth="3" />
            <line x1="160" y1="200" x2="160" y2="280" stroke="#E5E7EB" strokeWidth="1.5" />
            <line x1="240" y1="200" x2="240" y2="280" stroke="#E5E7EB" strokeWidth="1.5" />

            {/* Laptop */}
            <path d="M100,190 L160,190" stroke="#374151" strokeWidth="4" />
            <polygon points="100,190 120,150 160,150 160,190" fill="#F3F4F6" stroke="#374151" />
            <path d="M90,195 L170,195 L180,200 L80,200 Z" fill="#9CA3AF" stroke="#374151" />

            {/* Person sitting */}
            {/* Chair back */}
            <line x1="270" y1="180" x2="270" y2="270" stroke="#9CA3AF" strokeWidth="3" />
            <line x1="260" y1="270" x2="285" y2="270" stroke="#9CA3AF" strokeWidth="3" />
            {/* Head */}
            <circle cx="210" cy="95" r="20" fill="#FFFFFF" stroke="#374151" />
            <path d="M205,95 Q210,98 215,95" stroke="#374151" /> {/* Smile */}
            <circle cx="205" cy="90" r="1.5" fill="#374151" />
            <circle cx="215" cy="90" r="1.5" fill="#374151" />
            {/* Graduation Cap / Teacher Hat */}
            <polygon points="180,75 210,65 240,75 210,85" fill="#5B7FEC" stroke="#374151" />
            <rect x="202" y="75" width="16" height="10" fill="#5B7FEC" stroke="#374151" />
            
            {/* Body */}
            <path d="M190,160 C190,120 230,120 230,160 Z" fill="#FFFFFF" stroke="#374151" strokeWidth="2.5" />
            <line x1="210" y1="160" x2="210" y2="250" stroke="#374151" strokeWidth="3" />
            <line x1="210" y1="250" x2="230" y2="250" stroke="#374151" strokeWidth="3" />
            
            {/* Arms / Hands typing */}
            <path d="M195,145 L160,160 L145,185" stroke="#374151" fill="none" />
            <path d="M225,145 L245,170 C245,170 240,185 240,195" stroke="#374151" fill="none" />
          </svg>
        </div>
      </div>

      {/* Right Column: Login form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              {/* Squiggle above "p" */}
              <svg
                className="absolute -top-3 left-1 text-[#5B7FEC] w-8 h-4"
                viewBox="0 0 30 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M2 10 Q 8 2, 15 10 T 28 5" />
              </svg>
              <span className="text-3xl font-extrabold text-[#5B7FEC]">P</span>
            </div>
            <span className="text-3xl font-extrabold text-[#374151]">repRoute</span>
          </div>

          {/* Titles */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Login</h2>
            <p className="mt-2 text-sm text-gray-500 font-medium">
              Use your company provided Login credentials
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              
              {/* User ID Field */}
              <div>
                <label htmlFor="userId" className="block text-sm font-semibold text-gray-700">
                  User ID
                </label>
                <div className="mt-1">
                  <input
                    {...register('userId')}
                    id="userId"
                    type="text"
                    placeholder="Enter User ID"
                    className={`block w-full px-4 py-3 rounded-lg border bg-[#FAFAFA] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B7FEC] focus:border-transparent transition-all duration-150 ${
                      errors.userId ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.userId && (
                    <p className="mt-1.5 text-xs text-red-600 font-semibold">{errors.userId.message}</p>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    {...register('password')}
                    id="password"
                    type="password"
                    placeholder="Enter Password"
                    className={`block w-full px-4 py-3 rounded-lg border bg-[#FAFAFA] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B7FEC] focus:border-transparent transition-all duration-150 ${
                      errors.password ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-600 font-semibold">{errors.password.message}</p>
                  )}
                </div>
              </div>

            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="text-sm"></div>
              <div className="text-sm">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast('Forgot password flow is not implemented in backend. Please use the default credentials.', { icon: 'ℹ️' });
                  }}
                  className="font-semibold text-sm text-[#5B7FEC] hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={!isValid || isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white transition-all duration-200 ${
                  !isValid
                    ? 'bg-[#A2BAF7] cursor-not-allowed'
                    : 'bg-[#5B7FEC] hover:bg-[#4A6FD8] hover:shadow-lg active:scale-[0.98]'
                } ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
