import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { Card } from '../components/Card';
import { reportsAPI } from '../api/services';

interface DashboardMetrics {
    kpis: {
        totalRevenue: number;
        activeDeals: number;
        winRate: number;
        newLeads: number;
    };
    revenueTrend: { month: string; revenue: number; target: number }[];
    leadsByStatus: { name: string; value: number }[];
    pipeline: { stage: string; count: number; value: number }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ReportsPage: React.FC = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await reportsAPI.dashboard();
                setMetrics(res.data.data as DashboardMetrics);
            } catch (err) {
                console.error("Failed to load dashboard metrics", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    };

    if (isLoading || !metrics) {
        return <div className="p-8 text-center text-brand-text-secondary">Loading analytics...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-brand-text">Reports & Analytics</h1>
                <p className="text-sm text-brand-text-secondary mt-1">High-level overview of sales performance and pipeline health.</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-brand-text-secondary font-medium">Total Revenue</p>
                        <p className="text-2xl font-bold text-brand-text">{formatCurrency(metrics.kpis.totalRevenue)}</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-brand-text-secondary font-medium">Active Deals</p>
                        <p className="text-2xl font-bold text-brand-text">{metrics.kpis.activeDeals}</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-brand-text-secondary font-medium">Win Rate</p>
                        <p className="text-2xl font-bold text-brand-text">{metrics.kpis.winRate}%</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-brand-text-secondary font-medium">New Leads (30d)</p>
                        <p className="text-2xl font-bold text-brand-text">{metrics.kpis.newLeads}</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Trend */}
                <Card title="Revenue Trend" className="col-span-1 lg:col-span-2 min-h-[400px]">
                    <div className="h-[320px] w-full mt-4 text-sm">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dy={10} />
                                <YAxis
                                    tickFormatter={(val) => `$${val / 1000}k`}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B' }}
                                />
                                <RechartsTooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="revenue" name="Actual Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                <Bar dataKey="target" name="Target" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Leads Donut */}
                <Card title="Leads by Status" className="col-span-1 min-h-[400px]">
                    <div className="h-[320px] w-full mt-4 text-sm flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={metrics.leadsByStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {metrics.leadsByStatus.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                    itemStyle={{ color: '#0f172a' }}
                                />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '13px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Pipeline Funnel / Bar */}
            <Card title="Pipeline Snapshot" className="min-h-[350px]">
                <div className="h-[280px] w-full mt-4 text-sm">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metrics.pipeline} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dx={-10} width={100} />
                            <RechartsTooltip
                                formatter={(value: number, name: string) => name === 'value' ? formatCurrency(value) : value}
                                cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                            />
                            <Bar dataKey="count" name="Deal Count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                            <Bar dataKey="value" name="Pipeline Value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

export default ReportsPage;
