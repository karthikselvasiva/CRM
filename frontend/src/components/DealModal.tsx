import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';

export interface DealFormData {
    name: string;
    value: number;
    probability: number;
    stage_id: string;
    contact_name?: string;
    company_name?: string;
    close_date?: string;
}

interface DealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: DealFormData) => Promise<void>;
    stages: Array<{ id: string; name: string }>;
    initialData?: Partial<DealFormData>;
    title?: string;
}

const DealModal: React.FC<DealModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    stages,
    initialData,
    title = 'Add Deal',
}) => {
    const [form, setForm] = useState<DealFormData>({
        name: '',
        value: 0,
        probability: 50,
        stage_id: stages[0]?.id || '',
        contact_name: '',
        company_name: '',
        close_date: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name || '',
                value: initialData.value ?? 0,
                probability: initialData.probability ?? 50,
                stage_id: initialData.stage_id || stages[0]?.id || '',
                contact_name: initialData.contact_name || '',
                company_name: initialData.company_name || '',
                close_date: initialData.close_date || '',
            });
        } else {
            setForm({
                name: '',
                value: 0,
                probability: 50,
                stage_id: stages[0]?.id || '',
                contact_name: '',
                company_name: '',
                close_date: '',
            });
        }
        setError('');
    }, [initialData, isOpen, stages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setError('Deal name is required');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await onSubmit(form);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to save deal');
        } finally {
            setIsSubmitting(false);
        }
    };

    const update = (field: keyof DealFormData, value: string | number) =>
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
                    label="Deal Name *"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="e.g. Acme Corp Enterprise License"
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Value ($)"
                        type="number"
                        min="0"
                        value={form.value.toString()}
                        onChange={(e) => update('value', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                    />

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-brand-text">Stage</label>
                        <select
                            value={form.stage_id}
                            onChange={(e) => update('stage_id', e.target.value)}
                            className="input"
                            required
                        >
                            {stages.map(stage => (
                                <option key={stage.id} value={stage.id}>
                                    {stage.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Contact Name"
                        value={form.contact_name || ''}
                        onChange={(e) => update('contact_name', e.target.value)}
                        placeholder="John Doe"
                    />
                    <Input
                        label="Company"
                        value={form.company_name || ''}
                        onChange={(e) => update('company_name', e.target.value)}
                        placeholder="Company name"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Expected Close Date"
                        type="date"
                        value={form.close_date || ''}
                        onChange={(e) => update('close_date', e.target.value)}
                    />
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-brand-text">
                            Probability: <span className="text-brand-primary font-bold">{form.probability}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={form.probability}
                            onChange={(e) => update('probability', parseInt(e.target.value))}
                            className="w-full h-8 accent-brand-primary"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-brand-border/30">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        {initialData ? 'Save Changes' : 'Create Deal'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default DealModal;
