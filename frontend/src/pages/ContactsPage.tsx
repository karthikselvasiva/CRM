import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Search, Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import ContactModal, { ContactFormData } from '../components/ContactModal';
import { apiClient } from '../api/client';
import { useDebounce } from '../hooks/useDebounce';

interface Contact {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    status: string;
    tags: string[];
    source: string | null;
    created_at: string;
}

const statusColors: Record<string, 'success' | 'neutral' | 'primary' | 'warning'> = {
    active: 'success',
    inactive: 'neutral',
    lead: 'primary',
};

const ContactsPage: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editContact, setEditContact] = useState<Contact | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const limit = 10;
    const debouncedSearch = useDebounce(search, 300);

    const fetchContacts = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: Record<string, string | number> = { page, limit };
            if (debouncedSearch) params.search = debouncedSearch;
            const res = await apiClient.get<{ data: Contact[]; meta: { total: number } }>('/contacts', { params });
            setContacts(res.data.data);
            setTotal(res.data.meta?.total || 0);
        } catch (err) {
            console.error('Failed to load contacts:', err);
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    // Reset to page 1 on search change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const handleCreate = async (data: ContactFormData) => {
        await apiClient.post('/contacts', {
            ...data,
            tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        });
        fetchContacts();
    };

    const handleEdit = async (data: ContactFormData) => {
        if (!editContact) return;
        await apiClient.patch(`/contacts/${editContact.id}`, {
            ...data,
            tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        });
        setEditContact(null);
        fetchContacts();
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await apiClient.delete(`/contacts/${deleteId}`);
        setDeleteId(null);
        fetchContacts();
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-brand-text">Contacts</h1>
                    <p className="text-sm text-brand-text-secondary mt-1">
                        {total} contact{total !== 1 ? 's' : ''} in your database
                    </p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
                    Add Contact
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
                <input
                    type="text"
                    placeholder="Search by name, email, or company..."
                    className="input pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Table or Empty State */}
            {!isLoading && contacts.length === 0 ? (
                <EmptyState
                    icon={<Users className="w-8 h-8" />}
                    title={search ? 'No contacts found' : 'No contacts yet'}
                    description={
                        search
                            ? `No contacts match "${search}". Try a different search.`
                            : 'Start building your customer database by adding your first contact.'
                    }
                    actionLabel={search ? undefined : 'Add Contact'}
                    onAction={search ? undefined : () => setModalOpen(true)}
                />
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-brand-surface text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Phone</th>
                                    <th className="px-4 py-3">Company</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Tags</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/30">
                                {isLoading
                                    ? Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            {Array.from({ length: 7 }).map((_, j) => (
                                                <td key={j} className="px-4 py-3">
                                                    <div className="h-4 bg-brand-surface rounded w-20" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                    : contacts.map((contact) => (
                                        <tr
                                            key={contact.id}
                                            className="hover:bg-brand-surface/50 transition-colors cursor-pointer"
                                            onClick={() => {
                                                setEditContact(contact);
                                            }}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xs font-bold">
                                                        {contact.first_name[0]}
                                                        {contact.last_name[0]}
                                                    </div>
                                                    <span className="font-medium text-brand-text text-sm">
                                                        {contact.first_name} {contact.last_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-brand-text-secondary">
                                                {contact.email || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-brand-text-secondary">
                                                {contact.phone || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-brand-text">
                                                {contact.company || '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={statusColors[contact.status] || 'neutral'}>
                                                    {contact.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {contact.tags.slice(0, 2).map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="inline-block bg-brand-surface text-brand-text-secondary text-xs px-2 py-0.5 rounded"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {contact.tags.length > 2 && (
                                                        <span className="text-xs text-brand-text-secondary">
                                                            +{contact.tags.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditContact(contact);
                                                        }}
                                                        className="p-1.5 rounded text-brand-text-secondary hover:text-brand-primary hover:bg-brand-surface transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteId(contact.id);
                                                        }}
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
                                    className="p-1.5 rounded text-brand-text-secondary hover:bg-brand-surface disabled:opacity-40 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-sm text-brand-text">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-1.5 rounded text-brand-text-secondary hover:bg-brand-surface disabled:opacity-40 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            <ContactModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleCreate}
                title="Add Contact"
            />

            {/* Edit Modal */}
            <ContactModal
                isOpen={!!editContact}
                onClose={() => setEditContact(null)}
                onSubmit={handleEdit}
                title="Edit Contact"
                initialData={
                    editContact
                        ? {
                            first_name: editContact.first_name,
                            last_name: editContact.last_name,
                            email: editContact.email || '',
                            phone: editContact.phone || '',
                            company: editContact.company || '',
                            status: editContact.status,
                            tags: editContact.tags.join(', '),
                            source: editContact.source || '',
                        }
                        : undefined
                }
            />

            {/* Delete confirmation */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                    <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
                        <h3 className="text-lg font-semibold text-brand-text">Delete Contact</h3>
                        <p className="text-sm text-brand-text-secondary mt-2">
                            Are you sure you want to delete this contact? This action cannot be undone.
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

export default ContactsPage;
