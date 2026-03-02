import React, { useState, useEffect } from 'react';
import {
    Building2, Columns, Palette, Users, Puzzle,
    Key, Save, Plus, Trash2, Settings
} from 'lucide-react';
import { Card, Button, Input, EmptyState } from '../components';
import { settingsAPI } from '../api/services';

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Data states
    const [profile, setProfile] = useState<any>(null);
    const [stages, setStages] = useState<any[]>([]);
    const [fields, setFields] = useState<any[]>([]);
    const [integrations, setIntegrations] = useState<any[]>([]);
    const [apiKeys, setApiKeys] = useState<any[]>([]);

    // Form states
    const [newKeyName, setNewKeyName] = useState('');

    useEffect(() => {
        loadData(activeTab);
    }, [activeTab]);

    const loadData = async (tab: string) => {
        setIsLoading(true);
        try {
            switch (tab) {
                case 'profile': {
                    const profRes = await settingsAPI.getProfile();
                    setProfile(profRes.data.data);
                    break;
                }
                case 'pipeline': {
                    const pipeRes = await settingsAPI.listPipelineStages();
                    setStages(pipeRes.data.data as any[]);
                    break;
                }
                case 'fields': {
                    const fieldsRes = await settingsAPI.listCustomFields();
                    setFields(fieldsRes.data.data as any[]);
                    break;
                }
                case 'integrations': {
                    const intRes = await settingsAPI.listIntegrations();
                    setIntegrations(intRes.data.data as any[]);
                    break;
                }
                case 'apikeys': {
                    const keysRes = await settingsAPI.listApiKeys();
                    setApiKeys(keysRes.data.data as any[]);
                    break;
                }
                // Add more cases as fully implemented
                default:
                    break;
            }
        } catch (err) {
            console.error("Failed to load settings data", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await settingsAPI.updateProfile(profile);
            alert("Settings saved successfully.");
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleIntegration = async (id: string) => {
        try {
            await settingsAPI.toggleIntegration(id);
            loadData('integrations');
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateApiKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName.trim()) return;
        setIsSaving(true);
        try {
            await settingsAPI.createApiKey(newKeyName);
            setNewKeyName('');
            loadData('apikeys');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRevokeApiKey = async (id: string) => {
        if (!confirm("Revoke this key? Apps using it will immediately lose access.")) return;
        try {
            await settingsAPI.revokeApiKey(id);
            loadData('apikeys');
        } catch (err) {
            console.error(err);
        }
    };

    const tabs = [
        { id: 'profile', icon: <Building2 className="w-4 h-4" />, label: 'Company Profile' },
        { id: 'pipeline', icon: <Columns className="w-4 h-4" />, label: 'Pipeline Stages' },
        { id: 'fields', icon: <Palette className="w-4 h-4" />, label: 'Custom Fields' },
        { id: 'users', icon: <Users className="w-4 h-4" />, label: 'Users & Permissions' },
        { id: 'integrations', icon: <Puzzle className="w-4 h-4" />, label: 'Integrations' },
        { id: 'apikeys', icon: <Key className="w-4 h-4" />, label: 'API Keys' },
    ];

    const renderProfileForm = () => {
        if (!profile) return null;
        return (
            <Card title="Company Information" className="max-w-3xl">
                <form onSubmit={handleSaveProfile} className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-brand-text mb-1">Company Name</label>
                            <Input
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-text mb-1">Timezone</label>
                            <select
                                className="input"
                                value={profile.timezone}
                                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                            >
                                <option value="America/New_York">Eastern Time (US & Canada)</option>
                                <option value="America/Chicago">Central Time (US & Canada)</option>
                                <option value="America/Denver">Mountain Time (US & Canada)</option>
                                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                                <option value="UTC">UTC</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-text mb-1">Currency</label>
                            <select
                                className="input"
                                value={profile.currency}
                                onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-text mb-1">Language</label>
                            <select
                                className="input"
                                value={profile.language}
                                onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-brand-border">
                        <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />} isLoading={isSaving}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Card>
        );
    };

    const renderPipelineStages = () => (
        <Card title="Sales Pipeline Stages" className="max-w-4xl">
            <p className="text-sm text-brand-text-secondary mt-1 mb-6">Customize the stages that deals move through in your sales process.</p>
            <div className="space-y-3">
                {stages.map((stage) => (
                    <div key={stage.id} className="flex items-center gap-4 p-3 border border-brand-border rounded-lg bg-brand-surface">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stage.color }}></div>
                        <div className="flex-1 font-medium text-brand-text">{stage.name}</div>
                        <div className="text-sm text-brand-text-secondary">Stage {stage.order}</div>
                        <Button variant="secondary">Edit</Button>
                    </div>
                ))}
            </div>
        </Card>
    );

    const renderCustomFields = () => (
        <Card title="Custom Fields" className="max-w-4xl">
            <p className="text-sm text-brand-text-secondary mt-1 mb-6">Add specialized data fields to your records.</p>
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-brand-border text-sm text-brand-text-secondary">
                        <th className="pb-3 font-medium">Label</th>
                        <th className="pb-3 font-medium">Module</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                    {fields.map(f => (
                        <tr key={f.id} className="text-sm border-brand-border text-brand-text">
                            <td className="py-3 font-medium">{f.label}</td>
                            <td className="py-3 capitalize">{f.module}</td>
                            <td className="py-3">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">{f.type}</span>
                            </td>
                            <td className="py-3 text-right">
                                <button className="text-brand-primary hover:underline">Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );

    const renderIntegrations = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map(integ => (
                <Card key={integ.id} className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                            {/* Generic icon, in reality replace with brand logos */}
                            <Puzzle className="w-6 h-6" />
                        </div>
                        <label className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={integ.status === 'connected'}
                                    onChange={() => handleToggleIntegration(integ.id)}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${integ.status === 'connected' ? 'bg-brand-primary' : 'bg-gray-300'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${integ.status === 'connected' ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                        </label>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-brand-text text-lg">{integ.name}</h3>
                        <p className="text-sm text-brand-text-secondary mt-1">
                            {integ.status === 'connected'
                                ? `Connected since ${new Date(integ.connected_at).toLocaleDateString()}`
                                : 'Not connected'}
                        </p>
                    </div>
                    {integ.status === 'connected' && (
                        <div className="mt-4 pt-4 border-t border-brand-border">
                            <button className="text-sm text-brand-primary font-medium hover:underline flex items-center gap-1">
                                <Settings className="w-4 h-4" /> Configure
                            </button>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );

    const renderApiKeys = () => (
        <Card title="API Keys" className="max-w-4xl">
            <p className="text-sm text-brand-text-secondary mt-1 mb-6">Manage developer access keys for external integrations.</p>

            <form onSubmit={handleCreateApiKey} className="flex gap-3 mb-8 pb-8 border-b border-brand-border">
                <Input
                    placeholder="E.g., Production Zapier Sync"
                    className="max-w-xs"
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                />
                <Button type="submit" variant="primary" icon={<Plus className="w-4 h-4" />} isLoading={isSaving}>Generate Key</Button>
            </form>

            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-brand-border text-sm text-brand-text-secondary">
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium">Key Prefix</th>
                        <th className="pb-3 font-medium">Created</th>
                        <th className="pb-3 font-medium"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                    {apiKeys.map(key => (
                        <tr key={key.id} className="text-sm border-brand-border text-brand-text">
                            <td className="py-4 font-medium">{key.name}</td>
                            <td className="py-4 font-mono text-xs">{key.key_preview}</td>
                            <td className="py-4 text-brand-text-secondary">{new Date(key.created_at).toLocaleDateString()}</td>
                            <td className="py-4 text-right">
                                <button onClick={() => handleRevokeApiKey(key.id)} className="text-red-500 hover:text-red-700 flex items-center justify-end gap-1 ml-auto">
                                    <Trash2 className="w-4 h-4" /> Revoke
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 shrink-0 bg-white rounded-xl shadow-sm border border-brand-border flex flex-col overflow-hidden h-fit">
                <div className="p-4 border-b border-brand-border">
                    <h2 className="font-semibold text-brand-text">Configuration</h2>
                </div>
                <div className="p-2 space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-brand-primary text-white shadow-sm'
                                : 'text-brand-text-secondary hover:bg-brand-gray/50 hover:text-brand-text'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto pb-12">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-brand-text">{tabs.find(t => t.id === activeTab)?.label}</h1>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center text-brand-text-secondary">Loading configuration...</div>
                ) : (
                    <>
                        {activeTab === 'profile' && renderProfileForm()}
                        {activeTab === 'pipeline' && renderPipelineStages()}
                        {activeTab === 'fields' && renderCustomFields()}
                        {activeTab === 'integrations' && renderIntegrations()}
                        {activeTab === 'apikeys' && renderApiKeys()}
                        {activeTab === 'users' && (
                            <Card className="max-w-4xl">
                                <EmptyState icon={<Users className="w-8 h-8" />} title="User Management" description="Coming in v2.0" />
                            </Card>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;
