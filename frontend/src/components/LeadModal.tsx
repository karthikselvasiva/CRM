import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';

export interface LeadFormData {
    name: string;
    email: string;
    phone: string;
    company: string;
    source: string;
    score: number;
    status: string;
}

interface LeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: LeadFormData) => Promise<void>;
    initialData?: Partial<LeadFormData>;
    title?: string;
}

const LeadModal: React.FC<LeadModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    title = 'Add Lead',
}) => {
    const [form, setForm] = useState<LeadFormData>({
        name: '', email: '', phone: '', company: '',
        source: '', score: 50, status: 'new',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                company: initialData.company || '',
                source: initialData.source || '',
                score: initialData.score ?? 50,
                status: initialData.status || 'new',
            });
        } else {
            setForm({ name: '', email: '', phone: '', company: '', source: '', score: 50, status: 'new' });
        }
        setError('');
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setError('Lead name is required');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await onSubmit(form);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to save lead');
        } finally {
            setIsSubmitting(false);
        }
    };

    const update = (field: keyof LeadFormData, value: string | number) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <Input
                    label="Name *"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Full name"
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        placeholder="lead@company.com"
                    />
                    <Input
                        label="Phone"
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        placeholder="+1-555-0100"
                    />
                </div>

                <Input
                    label="Company"
                    value={form.company}
                    onChange={(e) => update('company', e.target.value)}
                    placeholder="Company name"
                />

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-brand-text">Source</label>
                        <select
                            value={form.source}
                            onChange={(e) => update('source', e.target.value)}
                            className="input"
                        >
                            <option value="">Select source</option>
                            <option value="website">Website</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="referral">Referral</option>
                            <option value="cold-call">Cold Call</option>
                            <option value="conference">Conference</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-brand-text">Status</label>
                        <select
                            value={form.status}
                            onChange={(e) => update('status', e.target.value)}
                            className="input"
                        >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="proposal">Proposal</option>
                            <option value="negotiation">Negotiation</option>
                            <option value="won">Won</option>
                            <option value="lost">Lost</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-brand-text">
                        Lead Score: <span className="text-brand-primary font-bold">{form.score}</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={form.score}
                        onChange={(e) => update('score', parseInt(e.target.value))}
                        className="w-full accent-brand-primary"
                    />
                    <div className="flex justify-between text-xs text-brand-text-secondary">
                        <span>Cold (0)</span>
                        <span>Hot (100)</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        {initialData ? 'Save Changes' : 'Create Lead'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default LeadModal;
