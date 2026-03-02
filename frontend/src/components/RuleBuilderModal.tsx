import React, { useState } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

export interface Condition {
    field: string;
    operator: string;
    value: string;
}

export interface Action {
    type: string;
    config: Record<string, any>;
}

export interface RuleFormData {
    name: string;
    description: string;
    trigger_type: string;
    conditions: Condition[];
    actions: Action[];
    is_active: boolean;
}

interface RuleBuilderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: RuleFormData) => Promise<void>;
    initialData?: Partial<RuleFormData>;
}

const TRIGGER_TYPES = [
    { value: 'lead_created', label: 'Lead Created' },
    { value: 'deal_stage_changed', label: 'Deal Stage Changed' },
    { value: 'task_overdue', label: 'Task Overdue' },
];

const CONDITION_FIELDS = [
    { value: 'score', label: 'Lead Score' },
    { value: 'stage', label: 'Deal Stage' },
    { value: 'value', label: 'Deal Value' },
];

const OPERATORS = [
    { value: 'equals', label: 'Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
];

const ACTION_TYPES = [
    { value: 'send_email', label: 'Send Email' },
    { value: 'create_task', label: 'Create Task' },
    { value: 'update_field', label: 'Update Field' },
];

const RuleBuilderModal: React.FC<RuleBuilderModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData
}) => {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [triggerType, setTriggerType] = useState(initialData?.trigger_type || 'lead_created');
    const [conditions, setConditions] = useState<Condition[]>(initialData?.conditions || []);
    const [actions, setActions] = useState<Action[]>(initialData?.actions || [{ type: 'send_email', config: { template_name: '' } }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleAddCondition = () => {
        setConditions([...conditions, { field: 'score', operator: 'greater_than', value: '' }]);
    };

    const handleRemoveCondition = (index: number) => {
        setConditions(conditions.filter((_, i) => i !== index));
    };

    const handleConditionChange = (index: number, key: keyof Condition, value: string) => {
        const newConditions = [...conditions];
        newConditions[index] = { ...newConditions[index], [key]: value } as Condition;
        setConditions(newConditions);
    };

    const handleAddAction = () => {
        setActions([...actions, { type: 'send_email', config: {} }]);
    };

    const handleRemoveAction = (index: number) => {
        setActions(actions.filter((_, i) => i !== index));
    };

    const handleActionChange = (index: number, type: string) => {
        const newActions = [...actions];
        newActions[index] = { type, config: {} };
        setActions(newActions);
    };

    const handleActionConfigChange = (index: number, key: string, value: string) => {
        const newActions = [...actions];
        if (newActions[index]) {
            newActions[index].config = { ...(newActions[index].config || {}), [key]: value };
            setActions(newActions);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave({
                name,
                description,
                trigger_type: triggerType,
                conditions,
                actions,
                is_active: initialData?.is_active !== undefined ? initialData.is_active : true
            });
            onClose();
        } catch (error) {
            console.error("Failed to save rule", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-3xl bg-brand-surface rounded-xl shadow-xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
                    <h2 className="text-lg font-semibold text-brand-text">
                        {initialData ? 'Edit Automation Rule' : 'Create Automation Rule'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-brand-text-secondary hover:bg-brand-gray/50 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Basic Info */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-brand-text uppercase tracking-wider">Basic Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-text mb-1">Rule Name</label>
                                <Input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Welcome New Leads"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-text mb-1">Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="input min-h-[80px]"
                                    placeholder="Describe what this rule does..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Trigger */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-semibold text-brand-text uppercase tracking-wider">When this happens (Trigger)</h3>
                        <select
                            value={triggerType}
                            onChange={(e) => setTriggerType(e.target.value)}
                            className="input"
                        >
                            {TRIGGER_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </section>

                    {/* Conditions */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-brand-text uppercase tracking-wider">If these conditions match (Optional)</h3>
                            <Button variant="secondary" icon={<Plus className="w-4 h-4" />} onClick={handleAddCondition}>
                                Add Condition
                            </Button>
                        </div>

                        {conditions.length === 0 ? (
                            <div className="text-sm text-brand-text-secondary bg-brand-surface border border-dashed border-brand-border p-4 rounded-lg text-center">
                                No conditions defined. Rule will trigger every time.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {conditions.map((condition, index) => (
                                    <div key={index} className="flex gap-3 items-start">
                                        <select
                                            value={condition.field}
                                            onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                                            className="input flex-1"
                                        >
                                            {CONDITION_FIELDS.map(f => (
                                                <option key={f.value} value={f.value}>{f.label}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={condition.operator}
                                            onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                                            className="input flex-1"
                                        >
                                            {OPERATORS.map(o => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                        <Input
                                            className="flex-1"
                                            value={condition.value}
                                            onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                                            placeholder="Value"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCondition(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg shrink-0 mt-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Actions */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-brand-text uppercase tracking-wider">Then do this (Actions)</h3>
                            <Button variant="secondary" icon={<Plus className="w-4 h-4" />} onClick={handleAddAction}>
                                Add Action
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {actions.map((action, index) => (
                                <div key={index} className="flex gap-4 items-start bg-brand-surface border border-brand-border p-4 rounded-lg relative">
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-brand-text-secondary mb-1">Action Type</label>
                                            <select
                                                value={action.type}
                                                onChange={(e) => handleActionChange(index, e.target.value)}
                                                className="input w-full"
                                            >
                                                {ACTION_TYPES.map(a => (
                                                    <option key={a.value} value={a.value}>{a.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {action.type === 'send_email' && (
                                            <div className="space-y-3 pl-4 border-l-2 border-brand-primary/30">
                                                <Input
                                                    placeholder="Template Name (e.g., Welcome Email)"
                                                    value={action.config.template_name || ''}
                                                    onChange={(e) => handleActionConfigChange(index, 'template_name', e.target.value)}
                                                />
                                                <Input
                                                    placeholder="To (e.g., {{lead.email}})"
                                                    value={action.config.to || ''}
                                                    onChange={(e) => handleActionConfigChange(index, 'to', e.target.value)}
                                                />
                                            </div>
                                        )}
                                        {action.type === 'create_task' && (
                                            <div className="space-y-3 pl-4 border-l-2 border-brand-primary/30">
                                                <Input
                                                    placeholder="Task Title"
                                                    value={action.config.title || ''}
                                                    onChange={(e) => handleActionConfigChange(index, 'title', e.target.value)}
                                                />
                                                <select
                                                    className="input"
                                                    value={action.config.priority || 'medium'}
                                                    onChange={(e) => handleActionConfigChange(index, 'priority', e.target.value)}
                                                >
                                                    <option value="low">Low Priority</option>
                                                    <option value="medium">Medium Priority</option>
                                                    <option value="high">High Priority</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {actions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAction(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg shrink-0 mt-6"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="px-6 py-4 border-t border-brand-border bg-brand-surface flex justify-end gap-3 rounded-b-xl">
                    <Button variant="secondary" onClick={onClose} type="button">
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        icon={<Save className="w-4 h-4" />}
                        onClick={handleSubmit}
                        disabled={!name.trim() || actions.length === 0}
                        isLoading={isSubmitting}
                    >
                        Save Rule
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RuleBuilderModal;
