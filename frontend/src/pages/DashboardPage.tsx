import React from 'react';
import {
    Users,
    TrendingUp,
    DollarSign,
    CheckSquare,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import { Card } from '../components';

interface StatCardProps {
    title: string;
    value: string;
    change?: number;
    icon: React.ReactNode;
    iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, iconBg }) => (
    <Card className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${iconBg}`}>
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-sm text-brand-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-brand-text mt-1">{value}</p>
            {change !== undefined && (
                <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${change >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
                    {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(change)}% from last month
                </div>
            )}
        </div>
    </Card>
);

const DashboardPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-brand-text">Dashboard</h1>
                <p className="text-sm text-brand-text-secondary mt-1">Welcome back! Here's your sales overview.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Contacts"
                    value="2,847"
                    change={12.5}
                    icon={<Users className="w-5 h-5 text-brand-primary" />}
                    iconBg="bg-brand-primary/10"
                />
                <StatCard
                    title="Active Deals"
                    value="64"
                    change={8.2}
                    icon={<TrendingUp className="w-5 h-5 text-brand-success" />}
                    iconBg="bg-brand-success/10"
                />
                <StatCard
                    title="Revenue (MTD)"
                    value="$128,450"
                    change={-3.1}
                    icon={<DollarSign className="w-5 h-5 text-brand-warning" />}
                    iconBg="bg-brand-warning/10"
                />
                <StatCard
                    title="Tasks Due Today"
                    value="12"
                    icon={<CheckSquare className="w-5 h-5 text-brand-danger" />}
                    iconBg="bg-brand-danger/10"
                />
            </div>

            {/* Chart Placeholder Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card title="Revenue Over Time">
                    <div className="h-64 flex items-center justify-center text-brand-text-secondary text-sm">
                        Chart will be rendered here with Recharts (Phase 7)
                    </div>
                </Card>
                <Card title="Deals by Stage">
                    <div className="h-64 flex items-center justify-center text-brand-text-secondary text-sm">
                        Pipeline chart will be rendered here with Recharts (Phase 7)
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card title="Recent Activities" className="lg:col-span-2">
                    <div className="h-48 flex items-center justify-center text-brand-text-secondary text-sm">
                        Activity feed coming in Phase 5
                    </div>
                </Card>
                <Card title="Top Sales Reps">
                    <div className="h-48 flex items-center justify-center text-brand-text-secondary text-sm">
                        Leaderboard coming in Phase 7
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
