import React, { useState } from 'react';
import { User, Mail, Shield, Save, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/authService';

const ProfilePage: React.FC = () => {
    const { user, fetchProfile } = useAuthStore();
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await authApi.updateProfile({ full_name: fullName });
            await fetchProfile();
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Failed to update profile:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const roleLabel: Record<string, string> = {
        admin: 'Administrator',
        sales_manager: 'Sales Manager',
        sales_rep: 'Sales Representative',
        viewer: 'Viewer',
    };

    const roleBadgeVariant: Record<string, 'blue' | 'green' | 'yellow' | 'gray'> = {
        admin: 'blue',
        sales_manager: 'green',
        sales_rep: 'yellow',
        viewer: 'gray',
    };

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-brand-text">Profile</h1>
                <p className="text-sm text-brand-text-secondary mt-1">Manage your account settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile info */}
                <div className="lg:col-span-2">
                    <Card title="Personal Information">
                        <form onSubmit={handleSave} className="space-y-4 p-4">
                            {saved && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Profile updated successfully
                                </div>
                            )}

                            <Input
                                label="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                icon={<User className="w-4 h-4" />}
                            />

                            <Input
                                label="Email"
                                value={user.email}
                                icon={<Mail className="w-4 h-4" />}
                                disabled
                            />

                            <div className="pt-2">
                                <Button type="submit" isLoading={isSaving}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Role & Team */}
                <div className="space-y-4">
                    <Card title="Role & Permissions">
                        <div className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-brand-primary" />
                                <div>
                                    <p className="text-sm font-medium text-brand-text">
                                        {roleLabel[user.role] || user.role}
                                    </p>
                                    <Badge variant={roleBadgeVariant[user.role] || 'gray'}>
                                        {user.role}
                                    </Badge>
                                </div>
                            </div>
                            <p className="text-xs text-brand-text-secondary">
                                Your role is assigned by your team administrator.
                            </p>
                        </div>
                    </Card>

                    <Card title="Account Details">
                        <div className="p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-brand-text-secondary">User ID</span>
                                <span className="text-brand-text font-mono text-xs">{user.id.slice(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-brand-text-secondary">Team ID</span>
                                <span className="text-brand-text font-mono text-xs">{user.teamId.slice(0, 12)}...</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
