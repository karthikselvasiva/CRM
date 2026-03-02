import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';

export interface ContactFormData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company: string;
    status: string;
    tags: string;
    source: string;
}

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ContactFormData) => Promise<void>;
    initialData?: Partial<ContactFormData>;
    title?: string;
}

const ContactModal: React.FC<ContactModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    title = 'Add Contact',
}) => {
    const [form, setForm] = useState<ContactFormData>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        status: 'active',
        tags: '',
        source: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setForm({
                first_name: initialData.first_name || '',
                last_name: initialData.last_name || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                company: initialData.company || '',
                status: initialData.status || 'active',
                tags: initialData.tags || '',
                source: initialData.source || '',
            });
        } else {
            setForm({
                first_name: '', last_name: '', email: '', phone: '',
                company: '', status: 'active', tags: '', source: '',
            });
        }
        setError('');
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.first_name.trim() || !form.last_name.trim()) {
            setError('First name and last name are required');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await onSubmit(form);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to save contact');
        } finally {
            setIsSubmitting(false);
        }
    };

    const update = (field: keyof ContactFormData, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="First Name *"
                        value={form.first_name}
                        onChange={(e) => update('first_name', e.target.value)}
                        placeholder="John"
                        required
                    />
                    <Input
                        label="Last Name *"
                        value={form.last_name}
                        onChange={(e) => update('last_name', e.target.value)}
                        placeholder="Doe"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        placeholder="john@example.com"
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
                    placeholder="Acme Corp"
                />

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-brand-text">Status</label>
                        <select
                            value={form.status}
                            onChange={(e) => update('status', e.target.value)}
                            className="input"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="lead">Lead</option>
                        </select>
                    </div>
                    <Input
                        label="Source"
                        value={form.source}
                        onChange={(e) => update('source', e.target.value)}
                        placeholder="website, referral, etc."
                    />
                </div>

                <Input
                    label="Tags (comma-separated)"
                    value={form.tags}
                    onChange={(e) => update('tags', e.target.value)}
                    placeholder="enterprise, hot-lead"
                />

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        {initialData ? 'Save Changes' : 'Create Contact'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ContactModal;
