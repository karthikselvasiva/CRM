import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuthStore } from '../store/authStore';

const RegisterPage: React.FC = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { register, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (password !== confirmPassword) {
            // We'll show inline, but for now use a simple alert
            return;
        }

        const success = await register({
            email,
            password,
            full_name: fullName,
        });
        if (success) {
            navigate('/login', { state: { registered: true } });
        }
    };

    const passwordsMatch = confirmPassword === '' || password === confirmPassword;

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-surface">
            <div className="w-full max-w-md mx-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-xl bg-brand-primary flex items-center justify-center text-white font-bold text-2xl mx-auto">
                        C
                    </div>
                    <h1 className="text-2xl font-bold text-brand-text mt-4">Create your account</h1>
                    <p className="text-sm text-brand-text-secondary mt-1">Get started with your CRM</p>
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
                            label="Full Name"
                            type="text"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            icon={<User className="w-4 h-4" />}
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={<Mail className="w-4 h-4" />}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Create a password (min 6 chars)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={<Lock className="w-4 h-4" />}
                            required
                        />

                        <div>
                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                icon={<Lock className="w-4 h-4" />}
                                error={!passwordsMatch ? 'Passwords do not match' : undefined}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={isLoading}
                            disabled={!passwordsMatch || password.length < 6}
                        >
                            Create Account
                        </Button>
                    </form>
                </div>

                <p className="text-center text-sm text-brand-text-secondary mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-primary hover:underline font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
