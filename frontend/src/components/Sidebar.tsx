import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    UserPlus,
    TrendingUp,
    CheckSquare,
    Mail,
    BarChart3,
    Zap,
    Settings,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useUIStore } from '../store/uiStore';

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Contacts', path: '/contacts', icon: <Users className="w-5 h-5" /> },
    { label: 'Leads', path: '/leads', icon: <UserPlus className="w-5 h-5" /> },
    { label: 'Deals', path: '/deals', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Tasks', path: '/tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { label: 'Email', path: '/email', icon: <Mail className="w-5 h-5" /> },
    { label: 'Reports', path: '/reports', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Automations', path: '/automations', icon: <Zap className="w-5 h-5" /> },
    { label: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
];

export const Sidebar: React.FC = () => {
    const { sidebarCollapsed, toggleSidebar } = useUIStore();
    const location = useLocation();

    return (
        <aside
            className={`fixed left-0 top-0 h-full bg-brand-dark flex flex-col z-30 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-sidebar'
                }`}
        >
            {/* Logo */}
            <div className="h-topnav flex items-center px-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-bold text-sm">
                        C
                    </div>
                    {!sidebarCollapsed && (
                        <span className="text-white font-semibold text-lg tracking-tight">CRM</span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${isActive
                                ? 'sidebar-active text-white'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                            title={sidebarCollapsed ? item.label : undefined}
                        >
                            {item.icon}
                            {!sidebarCollapsed && <span>{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Collapse toggle */}
            <button
                onClick={toggleSidebar}
                className="flex items-center justify-center h-12 border-t border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
                {sidebarCollapsed ? (
                    <ChevronRight className="w-5 h-5" />
                ) : (
                    <ChevronLeft className="w-5 h-5" />
                )}
            </button>
        </aside>
    );
};
