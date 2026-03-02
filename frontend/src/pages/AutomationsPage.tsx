import React, { useState, useEffect } from 'react';
import { Zap, Activity, Plus, PlayCircle, Settings2, Trash2 } from 'lucide-react';
import { Button, EmptyState } from '../components';
import RuleBuilderModal, { RuleFormData } from '../components/RuleBuilderModal';
import { automationsAPI } from '../api/services';

interface AutomationRule {
    id: string;
    name: string;
    description: string;
    trigger_type: string;
    is_active: boolean;
    created_at: string;
}

interface AutomationLog {
    id: string;
    rule_name: string;
    trigger_event: string;
    status: 'success' | 'failed' | 'pending';
    executed_at: string;
    details: string;
}

const AutomationsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'rules' | 'logs'>('rules');
    const [rules, setRules] = useState<AutomationRule[]>([]);
    const [logs, setLogs] = useState<AutomationLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<RuleFormData | null>(null);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'rules') {
                const res = await automationsAPI.listRules();
                setRules(res.data.data as AutomationRule[]);
            } else {
                const res = await automationsAPI.listLogs();
                setLogs(res.data.data as AutomationLog[]);
            }
        } catch (err) {
            console.error("Failed to load automations data", err);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveRule = async (data: RuleFormData) => {
        try {
            if (editingRule && (editingRule as any).id) {
                await automationsAPI.updateRule((editingRule as any).id, data as any);
            } else {
                await automationsAPI.createRule(data as any);
            }
            fetchData();
        } catch (err) {
            console.error("Failed to save rule", err);
        }
    };

    const handleDeleteRule = async (id: string) => {
        if (!confirm("Are you sure you want to delete this rule?")) return;
        try {
            await automationsAPI.deleteRule(id);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleRule = async (rule: AutomationRule) => {
        try {
            await automationsAPI.updateRule(rule.id, { ...rule, is_active: !rule.is_active } as any);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
        }).format(new Date(dateStr));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand-text flex items-center gap-2">
                        <Zap className="w-6 h-6 text-brand-primary" />
                        Automation Engine
                    </h1>
                    <p className="text-sm text-brand-text-secondary mt-1">Automate workflows, assign tasks, and trigger actions automatically.</p>
                </div>
                {activeTab === 'rules' && (
                    <Button
                        variant="primary"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => { setEditingRule(null); setIsBuilderOpen(true); }}
                    >
                        Create Rule
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-brand-border">
                <button
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'rules'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-brand-text-secondary hover:text-brand-text hover:border-brand-border'
                        }`}
                    onClick={() => setActiveTab('rules')}
                >
                    <Settings2 className="w-4 h-4" />
                    Active Rules
                </button>
                <button
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'logs'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-brand-text-secondary hover:text-brand-text hover:border-brand-border'
                        }`}
                    onClick={() => setActiveTab('logs')}
                >
                    <Activity className="w-4 h-4" />
                    Execution Log
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-brand-border min-h-[400px]">
                {isLoading ? (
                    <div className="p-8 text-center text-brand-text-secondary">Loading...</div>
                ) : activeTab === 'rules' ? (
                    rules.length === 0 ? (
                        <div className="p-12">
                            <EmptyState
                                icon={<Zap className="w-12 h-12" />}
                                title="No Automations Yet"
                                description="Create your first rule to start automating your CRM workflows."
                            />
                        </div>
                    ) : (
                        <div className="divide-y divide-brand-border">
                            {rules.map(rule => (
                                <div key={rule.id} className="p-6 flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row hover:bg-brand-surface/50 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-base font-semibold text-brand-text">{rule.name}</h3>
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize border border-gray-200">
                                                Trigger: {rule.trigger_type.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-brand-text-secondary line-clamp-2">{rule.description || 'No description provided.'}</p>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0">
                                        <label className="flex items-center cursor-pointer">
                                            <div className="relative">
                                                <input type="checkbox" className="sr-only" checked={rule.is_active} onChange={() => handleToggleRule(rule)} />
                                                <div className={`block w-10 h-6 rounded-full transition-colors ${rule.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${rule.is_active ? 'transform translate-x-4' : ''}`}></div>
                                            </div>
                                            <div className="ml-3 text-sm font-medium text-brand-text-secondary w-12">
                                                {rule.is_active ? 'Active' : 'Paused'}
                                            </div>
                                        </label>
                                        <div className="h-6 w-px bg-brand-border"></div>
                                        <button
                                            // TODO: Fetch full rule details to edit. For now just passing partial.
                                            onClick={async () => {
                                                const res = await automationsAPI.getRule(rule.id);
                                                setEditingRule(res.data.data as any);
                                                setIsBuilderOpen(true);
                                            }}
                                            className="text-brand-primary text-sm font-medium hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRule(rule.id)}
                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-md"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    logs.length === 0 ? (
                        <div className="p-12">
                            <EmptyState
                                icon={<Activity className="w-12 h-12" />}
                                title="No Executions Yet"
                                description="When an automation is triggered, the result will appear here."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-brand-border bg-brand-surface text-xs text-brand-text-secondary uppercase tracking-wider">
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium">Rule Executed</th>
                                        <th className="p-4 font-medium">Trigger Event</th>
                                        <th className="p-4 font-medium">Time</th>
                                        <th className="p-4 font-medium hidden md:table-cell">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border">
                                    {logs.map(log => (
                                        <tr key={log.id} className="hover:bg-brand-surface/30">
                                            <td className="p-4">
                                                {log.status === 'success' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                        <PlayCircle className="w-3.5 h-3.5" /> Success
                                                    </span>
                                                ) : log.status === 'failed' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                        <Activity className="w-3.5 h-3.5" /> Failed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm font-medium text-brand-text">{log.rule_name}</td>
                                            <td className="p-4 text-sm text-brand-text-secondary capitalize">{log.trigger_event.replace(/_/g, ' ')}</td>
                                            <td className="p-4 text-sm text-brand-text-secondary">{formatDate(log.executed_at)}</td>
                                            <td className="p-4 text-sm text-brand-text-secondary hidden md:table-cell truncate max-w-[200px]" title={log.details}>{log.details}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>

            <RuleBuilderModal
                isOpen={isBuilderOpen}
                onClose={() => setIsBuilderOpen(false)}
                onSave={handleSaveRule}
                initialData={editingRule || undefined}
            />
        </div>
    );
};

export default AutomationsPage;
