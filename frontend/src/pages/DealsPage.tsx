import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, GripVertical, Building2, User,
    Calendar, Pencil, KanbanSquare, List as ListIcon
} from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import DealModal, { DealFormData } from '../components/DealModal';
import { apiClient } from '../api/client';
import { formatCurrency } from '../utils/formatters';

// --- Types ---
interface Deal {
    id: string;
    pipeline_id: string;
    stage_id: string;
    contact_name: string | null;
    company_name: string | null;
    name: string;
    value: number;
    currency: string;
    close_date: string | null;
    probability: number;
    status: string;
    created_at: string;
}

interface Stage {
    id: string;
    name: string;
    order: number;
    color: string;
}

interface Pipeline {
    id: string;
    name: string;
    is_default: boolean;
    stages: Stage[];
}

// --- Status & Color Helpers ---
const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
};

const bgMap: Record<string, string> = {
    blue: 'bg-blue-50/50',
    indigo: 'bg-indigo-50/50',
    purple: 'bg-purple-50/50',
    orange: 'bg-orange-50/50',
    green: 'bg-green-50/50',
    red: 'bg-red-50/50',
    gray: 'bg-gray-50/50',
};

const statusBadge: Record<string, { variant: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'; label: string }> = {
    open: { variant: 'primary', label: 'Open' },
    won: { variant: 'success', label: 'Won' },
    lost: { variant: 'danger', label: 'Lost' },
};

// --- DealCard Component ---
const DealCard = ({
    deal,
    onClick,
    onDragStart,
}: {
    deal: Deal;
    onClick: () => void;
    onDragStart: (e: React.DragEvent, dealId: string) => void;
}) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, deal.id)}
        onClick={onClick}
        className="bg-white border border-brand-border/50 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all cursor-pointer group active:cursor-grabbing"
    >
        <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-brand-text text-sm leading-tight group-hover:text-brand-primary transition-colors">
                {deal.name}
            </h4>
            <div className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-brand-text-tertiary">
                <GripVertical className="w-4 h-4" />
            </div>
        </div>

        <div className="text-sm font-semibold text-brand-text mb-3">
            {formatCurrency(deal.value, deal.currency)}
        </div>

        <div className="space-y-1.5 mb-3">
            {deal.company_name && (
                <div className="flex items-center text-xs text-brand-text-secondary">
                    <Building2 className="w-3 h-3 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{deal.company_name}</span>
                </div>
            )}
            {deal.contact_name && (
                <div className="flex items-center text-xs text-brand-text-secondary">
                    <User className="w-3 h-3 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{deal.contact_name}</span>
                </div>
            )}
            {deal.close_date && (
                <div className="flex items-center text-xs text-brand-text-secondary">
                    <Calendar className="w-3 h-3 mr-1.5 flex-shrink-0" />
                    <span>{new Date(deal.close_date).toLocaleDateString()}</span>
                </div>
            )}
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-border/30">
            <div className="flex items-center gap-1.5">
                <div className="w-12 h-1.5 bg-brand-surface rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${deal.probability >= 80 ? 'bg-green-500' : deal.probability >= 40 ? 'bg-yellow-500' : 'bg-red-400'}`}
                        style={{ width: `${deal.probability}%` }}
                    />
                </div>
                <span className="text-[10px] font-medium text-brand-text-secondary">{deal.probability}%</span>
            </div>

            {deal.status !== 'open' && (
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${deal.status === 'won' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                    {deal.status}
                </span>
            )}
        </div>
    </div>
);


// --- Main Page Component ---
const DealsPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const [activePipeline, setActivePipeline] = useState<Pipeline | null>(null);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modals & Actions
    const [modalOpen, setModalOpen] = useState(false);
    const [editDeal, setEditDeal] = useState<Deal | null>(null);

    // Drag & Drop State
    const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
    const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

    // Fetch config and data
    const fetchConfig = useCallback(async () => {
        try {
            const res = await apiClient.get<{ data: Pipeline[] }>('/deals/config');
            const data = res.data.data;
            if (data.length > 0 && !activePipeline) {
                const defaultPipeline = data.find(p => p.is_default) || data[0];
                setActivePipeline(defaultPipeline);
            }
        } catch (err) {
            console.error('Failed to load pipelines:', err);
        }
    }, [activePipeline]);

    const fetchDeals = useCallback(async () => {
        if (!activePipeline) return;
        setIsLoading(true);
        try {
            const res = await apiClient.get<{ data: Deal[] }>('/deals', {
                params: { pipeline_id: activePipeline.id, limit: 500 }
            });
            setDeals(res.data.data);
        } catch (err) {
            console.error('Failed to load deals:', err);
        } finally {
            setIsLoading(false);
        }
    }, [activePipeline]);

    useEffect(() => { fetchConfig(); }, [fetchConfig]);
    useEffect(() => { if (activePipeline) fetchDeals(); }, [fetchDeals, activePipeline]);

    // --- Actions ---
    const handleCreate = async (data: DealFormData) => {
        await apiClient.post('/deals', { ...data, pipeline_id: activePipeline?.id });
        fetchDeals();
    };

    const handleEdit = async (data: DealFormData) => {
        if (!editDeal) return;
        // Check if stage changed to trigger stage update separately
        if (data.stage_id !== editDeal.stage_id) {
            await apiClient.patch(`/deals/${editDeal.id}/stage`, { stage_id: data.stage_id });
        }
        await apiClient.patch(`/deals/${editDeal.id}`, data);
        setEditDeal(null);
        fetchDeals();
    };


    // --- Drag & Drop Handlers ---
    const handleDragStart = (e: React.DragEvent, dealId: string) => {
        setDraggedDealId(dealId);
        e.dataTransfer.effectAllowed = 'move';
        // Hack for Firefox support
        e.dataTransfer.setData('text/plain', dealId);

        // Slight delay to allow drag ghost to generate before changing opacity
        setTimeout(() => {
            const el = document.getElementById(`deal-${dealId}`);
            if (el) el.classList.add('opacity-50');
        }, 0);
    };

    const handleDragOver = (e: React.DragEvent, stageId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverStageId !== stageId) {
            setDragOverStageId(stageId);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverStageId(null);
    };

    const handleDrop = async (e: React.DragEvent, stageId: string) => {
        e.preventDefault();
        setDragOverStageId(null);

        const el = document.getElementById(`deal-${draggedDealId}`);
        if (el) el.classList.remove('opacity-50');

        if (!draggedDealId) return;

        const deal = deals.find(d => d.id === draggedDealId);
        if (!deal || deal.stage_id === stageId) {
            setDraggedDealId(null);
            return;
        }

        // Optimistic UI update
        setDeals(prev => prev.map(d =>
            d.id === draggedDealId
                ? { ...d, stage_id: stageId, status: stageId === 'stage-won' ? 'won' : stageId === 'stage-lost' ? 'lost' : 'open' }
                : d
        ));

        try {
            await apiClient.patch(`/deals/${draggedDealId}/stage`, { stage_id: stageId });
            // Re-fetch to guarantee correct status/probability from backend
            fetchDeals();
        } catch (err) {
            console.error("Failed to update stage:", err);
            fetchDeals(); // Revert on failure
        } finally {
            setDraggedDealId(null);
        }
    };

    // --- Render Helpers ---
    const dealsByStage = (stageId: string) => deals.filter(d => d.stage_id === stageId);

    const calculateStageTotal = (stageId: string) => {
        return dealsByStage(stageId).reduce((sum, deal) => sum + deal.value, 0);
    };

    const totalPipelineValue = deals.reduce((sum, deal) => sum + deal.value, 0);

    if (!activePipeline) return null;

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-brand-text">Deals</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-brand-text-secondary">
                            {activePipeline.name}
                        </p>
                        <span className="text-brand-border/50">•</span>
                        <p className="text-sm font-medium text-brand-primary">
                            Total: {formatCurrency(totalPipelineValue)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-brand-surface rounded-lg p-1 border border-brand-border/50 flex">
                        <button
                            onClick={() => setViewMode('board')}
                            className={`p-1.5 rounded flex items-center gap-1.5 text-sm font-medium transition-colors ${viewMode === 'board' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-text-secondary hover:text-brand-text'
                                }`}
                        >
                            <KanbanSquare className="w-4 h-4" /> Board
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded flex items-center gap-1.5 text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-text-secondary hover:text-brand-text'
                                }`}
                        >
                            <ListIcon className="w-4 h-4" /> List
                        </button>
                    </div>
                    <Button icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
                        Add Deal
                    </Button>
                </div>
            </div>

            {/* Board View */}
            {viewMode === 'board' ? (
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-4 h-full min-w-max">
                        {activePipeline.stages.map(stage => {
                            const stageDeals = dealsByStage(stage.id);
                            const totalValue = calculateStageTotal(stage.id);
                            const isDragOver = dragOverStageId === stage.id;

                            return (
                                <div
                                    key={stage.id}
                                    className={`w-72 flex flex-col rounded-xl border transition-colors ${isDragOver ? 'border-brand-primary/50 bg-brand-primary/5' : 'border-brand-border/30 bg-brand-surface/30'
                                        }`}
                                    onDragOver={(e) => handleDragOver(e, stage.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, stage.id)}
                                >
                                    {/* Column Header */}
                                    <div className={`p-3 border-b border-brand-border/30 rounded-t-xl ${bgMap[stage.color] || 'bg-gray-50/50'}`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-semibold text-brand-text text-sm flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${colorMap[stage.color]?.split(' ')[0] || 'bg-gray-400'}`} />
                                                {stage.name}
                                            </h3>
                                            <Badge variant="neutral" className="!px-1.5 !py-0.5 !text-xs">
                                                {stageDeals.length}
                                            </Badge>
                                        </div>
                                        <p className="text-xs font-medium text-brand-text-secondary pl-4">
                                            {formatCurrency(totalValue)}
                                        </p>
                                    </div>

                                    {/* Column Body / Cards */}
                                    <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                        {stageDeals.map(deal => (
                                            <div id={`deal-${deal.id}`} key={deal.id}>
                                                <DealCard
                                                    deal={deal}
                                                    onClick={() => setEditDeal(deal)}
                                                    onDragStart={handleDragStart}
                                                />
                                            </div>
                                        ))}

                                        {!isLoading && stageDeals.length === 0 && (
                                            <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-brand-border/40 rounded-lg text-brand-text-tertiary">
                                                <span className="text-xs font-medium">Drop deals here</span>
                                            </div>
                                        )}
                                        {isLoading && stageDeals.length === 0 && (
                                            <div className="animate-pulse flex flex-col gap-3">
                                                <div className="h-24 bg-brand-surface/50 rounded-lg" />
                                                <div className="h-24 bg-brand-surface/50 rounded-lg" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* List View */
                <div className="card overflow-hidden flex-1 flex flex-col">
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-brand-surface text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider sticky top-0">
                                    <th className="px-4 py-3">Deal Name</th>
                                    <th className="px-4 py-3">Value</th>
                                    <th className="px-4 py-3">Stage</th>
                                    <th className="px-4 py-3">Company</th>
                                    <th className="px-4 py-3">Close Date</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/30">
                                {deals.map((deal) => {
                                    const stage = activePipeline.stages.find(s => s.id === deal.stage_id);
                                    return (
                                        <tr key={deal.id} className="hover:bg-brand-surface/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-brand-text text-sm">
                                                {deal.name}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-brand-text text-sm">
                                                {formatCurrency(deal.value, deal.currency)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full border ${colorMap[stage?.color || 'gray']}`}>
                                                    {stage?.name || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-brand-text-secondary">
                                                {deal.company_name || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-brand-text-secondary">
                                                {deal.close_date ? new Date(deal.close_date).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={statusBadge[deal.status]?.variant || 'neutral'}>
                                                    {statusBadge[deal.status]?.label || deal.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => setEditDeal(deal)}
                                                    className="p-1.5 rounded text-brand-text-secondary hover:text-brand-primary hover:bg-brand-surface transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modals */}
            <DealModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleCreate}
                stages={activePipeline?.stages || []}
            />

            <DealModal
                isOpen={!!editDeal}
                onClose={() => setEditDeal(null)}
                onSubmit={handleEdit}
                stages={activePipeline?.stages || []}
                title="Edit Deal"
                initialData={editDeal ? {
                    name: editDeal.name,
                    value: editDeal.value,
                    stage_id: editDeal.stage_id,
                    company_name: editDeal.company_name || undefined,
                    contact_name: editDeal.contact_name || undefined,
                    close_date: editDeal.close_date || undefined
                } : undefined}
            />
        </div>
    );
};

export default DealsPage;
