import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuthStore } from '../store/authStore';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as any)?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        const success = await login({ email, password });
        if (success) {
            navigate(from, { replace: true });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-surface">
            <div className="w-full max-w-md mx-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-xl bg-brand-primary flex items-center justify-center text-white font-bold text-2xl mx-auto">
                        C
                    </div>
                    <h1 className="text-2xl font-bold text-brand-text mt-4">Welcome back</h1>
                    <p className="text-sm text-brand-text-secondary mt-1">Sign in to your CRM account</p>
                </div>

                {/* Form */}
                <div className="card p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={<Mail className="w-4 h-4" />}
                            required
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={<Lock className="w-4 h-4" />}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[38px] text-brand-text-secondary hover:text-brand-text"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-brand-border text-brand-primary focus:ring-brand-primary" />
                                <span className="text-brand-text-secondary">Remember me</span>
                            </label>
                            <a href="#" className="text-brand-primary hover:underline">Forgot password?</a>
                        </div>

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Sign In
                        </Button>
                    </form>

                    {/* Demo hint */}
                    <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg text-xs text-blue-700">
                        <strong>Demo credentials:</strong> admin@crm.com / admin123
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-brand-border/40" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-white text-brand-text-secondary">Or continue with</span>
                        </div>
                    </div>

                    {/* Social login */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="secondary" className="w-full">
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </Button>
                        <Button variant="secondary" className="w-full">
                            <Mail className="w-4 h-4 mr-2" />
                            Magic Link
                        </Button>
                    </div>
                </div>

                <p className="text-center text-sm text-brand-text-secondary mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-brand-primary hover:underline font-medium">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
