'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Professional Tabler icons
import { TbLoader2, TbAlertCircle, TbArrowRight, TbShieldCheck, TbTool, TbUser } from 'react-icons/tb';

// Phosphor icons for premium look
import { PiWrenchDuotone, PiShieldCheckDuotone, PiSparkle } from 'react-icons/pi';

// Heroicons for accents
import { HiOutlineSparkles } from 'react-icons/hi2';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            router.push('/');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (role: 'admin' | 'worker') => {
        const credentials = role === 'admin'
            ? { email: 'admin@fieldservice.com', password: 'admin123' }
            : { email: 'worker@fieldservice.com', password: 'worker123' };

        setEmail(credentials.email);
        setPassword(credentials.password);
        setError('');
        setLoading(true);

        try {
            await login(credentials.email, credentials.password);
            router.push('/');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center gradient-animated p-4 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo and Title */}
                <div className="text-center mb-8 animate-fade-in-up" style={{ animationFillMode: 'forwards' }}>
                    <div className="relative inline-flex items-center justify-center mb-6 group">
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary to-purple-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-purple-600 shadow-2xl shadow-primary/30 flex items-center justify-center">
                            <PiWrenchDuotone className="w-10 h-10 text-white" />
                            <div className="absolute -top-1 -right-1">
                                <HiOutlineSparkles className="w-5 h-5 text-yellow-400" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent mb-3">
                        Field Management
                    </h1>
                    <p className="text-slate-400 flex items-center justify-center gap-2">
                        <PiShieldCheckDuotone className="w-5 h-5 text-emerald-400" />
                        Secure sign in to your account
                    </p>
                </div>

                {/* Login Form */}
                <div
                    className="relative animate-fade-in-up opacity-0"
                    style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
                >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-purple-600/50 rounded-3xl blur opacity-30" />
                    <div className="relative bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 animate-fade-in-up">
                                    <TbAlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group w-full py-4 px-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <TbLoader2 className="w-5 h-5 animate-spin" />
                                        Signing in...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Sign in
                                        <TbArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </form>

                        {/* Demo credentials */}
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <p className="text-xs text-slate-500 text-center mb-4 uppercase tracking-wider font-medium">
                                Quick Demo Access
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleDemoLogin('admin')}
                                    disabled={loading}
                                    className="group p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all text-left disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                            <TbShieldCheck className="w-4 h-4 text-white" />
                                        </div>
                                        <p className="font-semibold text-white group-hover:text-primary transition-colors">Admin</p>
                                    </div>
                                    <p className="text-xs text-slate-500">Full dashboard access</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDemoLogin('worker')}
                                    disabled={loading}
                                    className="group p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all text-left disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                            <TbTool className="w-4 h-4 text-white" />
                                        </div>
                                        <p className="font-semibold text-white group-hover:text-cyan-400 transition-colors">Worker</p>
                                    </div>
                                    <p className="text-xs text-slate-500">Field worker portal</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p
                    className="text-center mt-8 text-xs text-slate-600 animate-fade-in-up opacity-0"
                    style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
                >
                    © 2026 FieldMgmt. Professional Field Service Management.
                </p>
            </div>
        </div>
    );
}
