import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

export const TopNav: React.FC = () => {
    const { user, logout } = useAuthStore();
    const { sidebarCollapsed } = useUIStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user?.fullName
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    return (
        <header
            className={`fixed top-0 right-0 h-topnav bg-white border-b border-brand-border/40 flex items-center justify-between px-6 z-20 transition-all duration-300 ${sidebarCollapsed ? 'left-16' : 'left-sidebar'
                }`}
        >
            {/* Search */}
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
                <input
                    type="text"
                    placeholder="Search contacts, deals, tasks..."
                    className="input pl-10 h-9 bg-brand-surface border-transparent focus:bg-white focus:border-brand-border"
                />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <button
                    className="relative p-2 rounded-md text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text transition-colors"
                    title="Notifications"
                    id="notification-bell"
                >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-danger rounded-full" />
                </button>

                {/* User menu */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex items-center gap-2 p-1.5 rounded-md hover:bg-brand-surface transition-colors"
                        id="user-menu"
                    >
                        <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold">
                            {initials}
                        </div>
                        <span className="text-sm font-medium text-brand-text hidden md:inline">
                            {user?.fullName || 'User'}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-brand-text-secondary transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {menuOpen && (
                        <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-brand-border/40 py-1 z-30">
                            <div className="px-4 py-2 border-b border-brand-border/40">
                                <p className="text-sm font-medium text-brand-text">{user?.fullName}</p>
                                <p className="text-xs text-brand-text-secondary">{user?.email}</p>
                                <p className="text-xs text-brand-primary mt-0.5 capitalize">{user?.role?.replace('_', ' ')}</p>
                            </div>
                            <button
                                onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-brand-text hover:bg-brand-surface transition-colors"
                            >
                                <User className="w-4 h-4" />
                                Profile
                            </button>
                            <button
                                onClick={() => { navigate('/settings'); setMenuOpen(false); }}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-brand-text hover:bg-brand-surface transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </button>
                            <div className="border-t border-brand-border/40 mt-1">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
