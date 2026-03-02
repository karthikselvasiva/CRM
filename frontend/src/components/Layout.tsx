import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useUIStore } from '../store/uiStore';

export const Layout: React.FC = () => {
    const { sidebarCollapsed } = useUIStore();

    return (
        <div className="min-h-screen bg-brand-surface">
            <Sidebar />
            <TopNav />
            <main
                className={`pt-topnav transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-sidebar'
                    }`}
            >
                <div className="max-w-content mx-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
