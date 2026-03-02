import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Filter, CheckSquare, Phone, Mail, Users, Clock,
    Trash2, Pencil, Check
} from 'lucide-react';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import TaskModal, { TaskFormData } from '../components/TaskModal';
import { TASK_TYPES, TASK_PRIORITIES } from '../constants/tasks';
import { apiClient } from '../api/client';

// --- Types ---
interface Task {
    id: string;
    type: string;
    title: string;
    due_at: string | null;
    priority: string;
    status: string;
    contact_name: string | null;
    deal_name: string | null;
    notes: string | null;
    created_at: string;
}

// --- Helpers ---
const typeIcon = {
    'call': <Phone className="w-4 h-4 text-blue-500" />,
    'email': <Mail className="w-4 h-4 text-purple-500" />,
    'meeting': <Users className="w-4 h-4 text-indigo-500" />,
    'to-do': <CheckSquare className="w-4 h-4 text-green-500" />,
    'follow-up': <Clock className="w-4 h-4 text-orange-500" />,
} as Record<string, React.ReactNode>;

const typeLabel = (val: string) => TASK_TYPES.find(t => t.value === val)?.label || val;
const priorityObj = (val: string) => TASK_PRIORITIES.find(p => p.value === val) || { label: val, color: 'text-gray-500' };

const TasksPage: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // UI State
    const [modalOpen, setModalOpen] = useState(false);
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Filter state
    const [filterStatus, setFilterStatus] = useState<string>('pending'); // default logic: show non-completed
    const [filterPriority, setFilterPriority] = useState<string>('');

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            // Build query params
            const params: Record<string, any> = { limit: 50 };
            if (filterStatus && filterStatus !== 'all') {
                params.status = filterStatus;
            }
            if (filterPriority) {
                params.priority = filterPriority;
            }

            const res = await apiClient.get<{ data: Task[] }>('/tasks', { params });
            setTasks(res.data.data);
        } catch (err) {
            console.error('Failed to load tasks:', err);
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus, filterPriority]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    // --- Actions ---
    const handleCreate = async (data: TaskFormData) => {
        await apiClient.post('/tasks', data);
        fetchTasks();
    };

    const handleEdit = async (data: TaskFormData) => {
        if (!editTask) return;
        await apiClient.patch(`/tasks/${editTask.id}`, data);
        setEditTask(null);
        fetchTasks();
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await apiClient.delete(`/tasks/${deleteId}`);
            setDeleteId(null);
            fetchTasks();
        } catch (err) {
            console.error(err);
        }
    };

    const toggleStatus = async (task: Task) => {
        // Simple toggle: pending -> completed, OR in_progress -> completed, OR completed -> pending
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';

        // Optimistic UI
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

        try {
            await apiClient.patch(`/tasks/${task.id}`, { status: newStatus });
        } catch {
            // Revert on failure
            fetchTasks();
        }
    };

    // --- Render ---
    const renderContent = () => {
        if (isLoading && tasks.length === 0) {
            return (
                <div className="card w-full h-64 flex items-center justify-center">
                    <span className="text-brand-text-secondary animate-pulse">Loading tasks...</span>
                </div>
            );
        }

        if (tasks.length === 0) {
            return (
                <div className="card p-8">
                    <EmptyState
                        icon={<CheckSquare className="w-8 h-8" />}
                        title="No tasks found"
                        description="Try changing your filters or create a new task to track activities."
                        actionLabel="Create Task"
                        onAction={() => setModalOpen(true)}
                    />
                </div>
            );
        }

        return (
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-brand-surface text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                                <th className="px-4 py-3 w-10"></th>
                                <th className="px-4 py-3">Task Details</th>
                                <th className="px-4 py-3">Associated With</th>
                                <th className="px-4 py-3">Due Date</th>
                                <th className="px-4 py-3">Priority</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/30">
                            {tasks.map((task) => {
                                const isCompleted = task.status === 'completed';
                                const priority = priorityObj(task.priority);

                                // Determine date color
                                let dateColor = "text-brand-text-secondary";
                                if (!isCompleted && task.due_at) {
                                    const due = new Date(task.due_at).getTime();
                                    const now = new Date().getTime();
                                    if (due < now) dateColor = "text-red-500 font-medium"; // overdue
                                }

                                return (
                                    <tr key={task.id} className={`hover:bg-brand-surface/50 transition-colors ${isCompleted ? 'opacity-60 bg-brand-surface/30' : ''}`}>
                                        <td className="px-4 py-3 text-center align-top pt-4">
                                            <button
                                                onClick={() => toggleStatus(task)}
                                                className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isCompleted
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : 'border-brand-border hover:border-brand-primary'
                                                    }`}
                                            >
                                                {isCompleted && <Check className="w-3.5 h-3.5" />}
                                            </button>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 bg-brand-surface p-1.5 rounded-lg border border-brand-border/50">
                                                    {typeIcon[task.type] || <CheckSquare className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className={`font-medium text-sm transition-all ${isCompleted ? 'text-brand-text-secondary line-through' : 'text-brand-text'}`}>
                                                        {task.title}
                                                    </p>
                                                    <p className="text-xs text-brand-text-secondary mt-0.5">
                                                        {typeLabel(task.type)}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-brand-text-secondary">
                                            {task.contact_name && (
                                                <div className="flex items-center gap-1.5 max-w-[150px] truncate">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                                                    <span className="truncate">{task.contact_name}</span>
                                                </div>
                                            )}
                                            {task.deal_name && (
                                                <div className="flex items-center gap-1.5 max-w-[150px] truncate mt-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></span>
                                                    <span className="truncate">{task.deal_name}</span>
                                                </div>
                                            )}
                                            {!task.contact_name && !task.deal_name && '—'}
                                        </td>

                                        <td className={`px-4 py-3 text-sm ${dateColor}`}>
                                            {task.due_at ? new Date(task.due_at).toLocaleDateString() : '—'}
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full bg-brand-surface border border-brand-border/50 ${priority.color}`}>
                                                {priority.label}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    title="Edit Task"
                                                    onClick={(e) => { e.stopPropagation(); setEditTask(task); }}
                                                    className="p-1.5 rounded text-brand-text-secondary hover:text-brand-primary hover:bg-brand-surface transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    title="Delete Task"
                                                    onClick={(e) => { e.stopPropagation(); setDeleteId(task.id); }}
                                                    className="p-1.5 rounded text-brand-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-brand-text">Tasks</h1>
                    <p className="text-sm text-brand-text-secondary mt-1">Manage your to-dos, calls, meetings, and follow-ups</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
                        New Task
                    </Button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
                    <Filter className="w-4 h-4" /> Filters:
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input !py-1.5 !text-sm max-w-[150px]"
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>

                <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="input !py-1.5 !text-sm max-w-[150px]"
                >
                    <option value="">All Priorities</option>
                    {TASK_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
            </div>

            {renderContent()}

            {/* Modals */}
            <TaskModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleCreate}
            />

            <TaskModal
                isOpen={!!editTask}
                onClose={() => setEditTask(null)}
                onSubmit={handleEdit}
                title="Edit Task"
                initialData={editTask ? { ...editTask, due_at: editTask.due_at || undefined, contact_name: editTask.contact_name || undefined, deal_name: editTask.deal_name || undefined, notes: editTask.notes || undefined } : undefined}
            />

            {/* Delete confirmation */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                    <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
                        <h3 className="text-lg font-semibold text-brand-text">Delete Task</h3>
                        <p className="text-sm text-brand-text-secondary mt-2">
                            Are you sure you want to delete this task? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="secondary" onClick={() => setDeleteId(null)}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleDelete}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TasksPage;
