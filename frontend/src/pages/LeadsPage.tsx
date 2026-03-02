import React, { useState, useEffect, useCallback } from 'react';
import {
    UserPlus, Plus, Search, Trash2, Pencil, ArrowRightCircle,
    ChevronLeft, ChevronRight, Zap,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import LeadModal, { LeadFormData } from '../components/LeadModal';
import { apiClient } from '../api/client';
import { useDebounce } from '../hooks/useDebounce';

interface Lead {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    source: string | null;
    score: number;
    status: string;
    converted_contact_id: string | null;
    created_at: string;
}

const statusBadge: Record<string, { variant: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'; label: string }> = {
    new: { variant: 'primary', label: 'New' },
    contacted: { variant: 'neutral', label: 'Contacted' },
    qualified: { variant: 'warning', label: 'Qualified' },
    proposal: { variant: 'primary', label: 'Proposal' },
    negotiation: { variant: 'warning', label: 'Negotiation' },
    won: { variant: 'success', label: 'Won' },
    lost: { variant: 'danger', label: 'Lost' },
};

function ScoreBar({ score }: { score: number }) {
    const color = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-400';
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-brand-surface rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
            </div>
            <span className="text-xs font-medium text-brand-text">{score}</span>
        </div>
    );
}

const LeadsPage: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editLead, setEditLead] = useState<Lead | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [convertId, setConvertId] = useState<string | null>(null);

    const limit = 10;
    const debouncedSearch = useDebounce(search, 300);

    const fetchLeads = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: Record<string, string | number> = { page, limit };
            if (debouncedSearch) params.search = debouncedSearch;
            if (statusFilter) params.status = statusFilter;
            const res = await apiClient.get<{ data: Lead[]; meta: { total: number } }>('/leads', { params });
            setLeads(res.data.data);
            setTotal(res.data.meta?.total || 0);
        } catch (err) {
            console.error('Failed to load leads:', err);
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedSearch, statusFilter]);

    useEffect(() => { fetchLeads(); }, [fetchLeads]);
    useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

    const handleCreate = async (data: LeadFormData) => {
        await apiClient.post('/leads', data);
        fetchLeads();
    };

    const handleEdit = async (data: LeadFormData) => {
        if (!editLead) return;
        await apiClient.patch(`/leads/${editLead.id}`, data);
        setEditLead(null);
        fetchLeads();
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await apiClient.delete(`/leads/${deleteId}`);
        setDeleteId(null);
        fetchLeads();
    };

    const handleConvert = async () => {
        if (!convertId) return;
        await apiClient.post(`/leads/${convertId}/convert`);
        setConvertId(null);
        fetchLeads();
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-brand-text">Leads</h1>
                    <p className="text-sm text-brand-text-secondary mt-1">
                        {total} lead{total !== 1 ? 's' : ''} in your pipeline
                    </p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
                    Add Lead
                </Button>
            </div>

            {/* Search + Filter */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or company..."
                        className="input pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input w-40"
                >
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                </select>
            </div>

            {/* Table or Empty */}
            {!isLoading && leads.length === 0 ? (
                <EmptyState
                    icon={<UserPlus className="w-8 h-8" />}
                    title={search || statusFilter ? 'No leads found' : 'No leads yet'}
                    description={
                        search || statusFilter
                            ? 'Try adjusting your search or filters.'
                            : 'Capture leads from web forms, CSV imports, or manual entry.'
                    }
                    actionLabel={search || statusFilter ? undefined : 'Add Lead'}
                    onAction={search || statusFilter ? undefined : () => setModalOpen(true)}
                />
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-brand-surface text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Company</th>
                                    <th className="px-4 py-3">Source</th>
                                    <th className="px-4 py-3">Score</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/30">
                                {isLoading
                                    ? Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            {Array.from({ length: 6 }).map((_, j) => (
                                                <td key={j} className="px-4 py-3">
                                                    <div className="h-4 bg-brand-surface rounded w-20" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                    : leads.map((lead) => (
                                        <tr
                                            key={lead.id}
                                            className="hover:bg-brand-surface/50 transition-colors cursor-pointer"
                                            onClick={() => setEditLead(lead)}
                                        >
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-brand-text text-sm">{lead.name}</p>
                                                    <p className="text-xs text-brand-text-secondary">{lead.email || '—'}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-brand-text">
                                                {lead.company || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-brand-text-secondary capitalize">
                                                {lead.source || '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <ScoreBar score={lead.score} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={statusBadge[lead.status]?.variant || 'neutral'}>
                                                    {statusBadge[lead.status]?.label || lead.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {!lead.converted_contact_id && lead.status !== 'won' && lead.status !== 'lost' && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setConvertId(lead.id); }}
                                                            className="p-1.5 rounded text-brand-text-secondary hover:text-green-600 hover:bg-green-50 transition-colors"
                                                            title="Convert to Contact"
                                                        >
                                                            <ArrowRightCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setEditLead(lead); }}
                                                        className="p-1.5 rounded text-brand-text-secondary hover:text-brand-primary hover:bg-brand-surface transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setDeleteId(lead.id); }}
                                                        className="p-1.5 rounded text-brand-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-brand-border/30">
                            <p className="text-sm text-brand-text-secondary">
                                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1.5 rounded text-brand-text-secondary hover:bg-brand-surface disabled:opacity-40"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-sm text-brand-text">Page {page} of {totalPages}</span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-1.5 rounded text-brand-text-secondary hover:bg-brand-surface disabled:opacity-40"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            <LeadModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} title="Add Lead" />

            {/* Edit Modal */}
            <LeadModal
                isOpen={!!editLead}
                onClose={() => setEditLead(null)}
                onSubmit={handleEdit}
                title="Edit Lead"
                initialData={editLead ? {
                    name: editLead.name,
                    email: editLead.email || '',
                    phone: editLead.phone || '',
                    company: editLead.company || '',
                    source: editLead.source || '',
                    score: editLead.score,
                    status: editLead.status,
                } : undefined}
            />

            {/* Delete confirmation */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                    <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
                        <h3 className="text-lg font-semibold text-brand-text">Delete Lead</h3>
                        <p className="text-sm text-brand-text-secondary mt-2">
                            Are you sure? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
                            <Button variant="danger" onClick={handleDelete}>Delete</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Convert confirmation */}
            {convertId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConvertId(null)} />
                    <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-brand-text">Convert Lead</h3>
                        </div>
                        <p className="text-sm text-brand-text-secondary">
                            This will create a new contact from this lead and mark it as "Won". Continue?
                        </p>
                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="secondary" onClick={() => setConvertId(null)}>Cancel</Button>
                            <Button onClick={handleConvert}>
                                <ArrowRightCircle className="w-4 h-4 mr-1" />
                                Convert
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadsPage;
