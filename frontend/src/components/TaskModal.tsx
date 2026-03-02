import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';

export interface TaskFormData {
    title: string;
    type: string;
    priority: string;
    status: string;
    due_at?: string;
    contact_name?: string;
    deal_name?: string;
    notes?: string;
}

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TaskFormData) => Promise<void>;
    initialData?: Partial<TaskFormData>;
    title?: string;
}

import { TASK_TYPES, TASK_PRIORITIES, TASK_STATUSES } from '../constants/tasks';

const TaskModal: React.FC<TaskModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    title = 'Add Task',
}) => {
    const [form, setForm] = useState<TaskFormData>({
        title: '',
        type: 'to-do',
        priority: 'medium',
        status: 'pending',
        contact_name: '',
        deal_name: '',
        due_at: '',
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setForm({
                title: initialData.title || '',
                type: initialData.type || 'to-do',
                priority: initialData.priority || 'medium',
                status: initialData.status || 'pending',
                contact_name: initialData.contact_name || '',
                deal_name: initialData.deal_name || '',
                due_at: initialData.due_at ? initialData.due_at.split('T')[0] : '', // simple date input
                notes: initialData.notes || '',
            });
        } else {
            setForm({
                title: '',
                type: 'to-do',
                priority: 'medium',
                status: 'pending',
                contact_name: '',
                deal_name: '',
                due_at: '',
                notes: '',
            });
        }
        setError('');
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) {
            setError('Task title is required');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await onSubmit({
                ...form,
                // Format to ISO if date exists
                due_at: form.due_at ? new Date(form.due_at).toISOString() : undefined,
            });
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to save task');
        } finally {
            setIsSubmitting(false);
        }
    };

    const update = (field: keyof TaskFormData, value: string) =>
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
                    label="Task Title *"
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    placeholder="e.g. Call John regarding Q3 renewal"
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-brand-text">Task Type</label>
                        <select
                            value={form.type}
                            onChange={(e) => update('type', e.target.value)}
                            className="input"
                        >
                            {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-brand-text">Priority</label>
                        <select
                            value={form.priority}
                            onChange={(e) => update('priority', e.target.value)}
                            className="input"
                        >
                            {TASK_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-brand-text">Status</label>
                        <select
                            value={form.status}
                            onChange={(e) => update('status', e.target.value)}
                            className="input"
                        >
                            {TASK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>
                    <Input
                        label="Due Date"
                        type="date"
                        value={form.due_at || ''}
                        onChange={(e) => update('due_at', e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Associated Contact"
                        value={form.contact_name || ''}
                        onChange={(e) => update('contact_name', e.target.value)}
                        placeholder="John Doe"
                    />
                    <Input
                        label="Associated Deal"
                        value={form.deal_name || ''}
                        onChange={(e) => update('deal_name', e.target.value)}
                        placeholder="Deal name"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-brand-text">Notes</label>
                    <textarea
                        value={form.notes || ''}
                        onChange={(e) => update('notes', e.target.value)}
                        placeholder="Add any extra details here..."
                        className="input min-h-[80px] resize-y"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-brand-border/30">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        {initialData ? 'Save Changes' : 'Create Task'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TaskModal;
