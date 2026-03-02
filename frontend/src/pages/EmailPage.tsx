import React, { useState, useEffect } from 'react';
import { Mail, Edit3, Send, Search, User, Clock } from 'lucide-react';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import ComposeModal, { ComposeFormData } from '../components/ComposeModal';
import { apiClient } from '../api/client';
import { useCallback } from 'react';

interface Email {
    id: string;
    from_email: string;
    to_email: string;
    contact_name: string | null;
    subject: string;
    body: string;
    status: string;
    folder: string;
    sent_at: string;
}

const EmailPage: React.FC = () => {
    const [emails, setEmails] = useState<Email[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'sent'>('inbox');
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [isComposeOpen, setIsComposeOpen] = useState(false);

    const fetchEmails = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get<{ data: Email[] }>('/emails', {
                params: { folder: selectedFolder }
            });
            setEmails(res.data.data);
        } catch (err) {
            console.error('Failed to load emails:', err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedFolder]);

    useEffect(() => {
        fetchEmails();
        setSelectedEmail(null);
    }, [selectedFolder, fetchEmails]);

    const handleSend = async (data: ComposeFormData) => {
        try {
            await apiClient.post('/emails/send', data);
            if (selectedFolder === 'sent') {
                fetchEmails();
            }
        } catch (err) {
            console.error('Failed to send email:', err);
        }
    };

    const filteredEmails = emails.filter(e =>
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.from_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.to_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.contact_name && e.contact_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(d);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16)-2rem)] -m-4">

            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 bg-brand-surface border-b border-brand-border">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-brand-text">Communications</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search emails..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-9 w-64 !py-1.5 !text-sm"
                        />
                    </div>
                </div>
                <Button
                    variant="primary"
                    icon={<Edit3 className="w-4 h-4" />}
                    onClick={() => setIsComposeOpen(true)}
                >
                    Compose
                </Button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Folders */}
                <div className="w-64 border-r border-brand-border bg-brand-surface/50 flex flex-col p-4 space-y-1">
                    <button
                        onClick={() => setSelectedFolder('inbox')}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${selectedFolder === 'inbox' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-brand-text-secondary hover:bg-brand-surface'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">Inbox</span>
                        </div>
                        {selectedFolder === 'inbox' && emails.length > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">{emails.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setSelectedFolder('sent')}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${selectedFolder === 'sent' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-brand-text-secondary hover:bg-brand-surface'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Send className="w-4 h-4" />
                            <span className="text-sm">Sent</span>
                        </div>
                    </button>
                </div>

                {/* Email List */}
                <div className="w-80 lg:w-96 border-r border-brand-border bg-white flex flex-col">
                    <div className="px-4 py-3 border-b border-brand-border bg-brand-surface/30">
                        <h3 className="text-sm font-semibold text-brand-text capitalize">{selectedFolder}</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="p-8 text-center text-sm text-brand-text-secondary">Loading emails...</div>
                        ) : filteredEmails.length === 0 ? (
                            <div className="p-8 text-center text-sm text-brand-text-secondary">No emails found.</div>
                        ) : (
                            <div className="divide-y divide-brand-border/50">
                                {filteredEmails.map(email => (
                                    <div
                                        key={email.id}
                                        onClick={() => setSelectedEmail(email)}
                                        className={`p-4 cursor-pointer hover:bg-brand-surface/80 transition-colors ${selectedEmail?.id === email.id ? 'bg-blue-50/50 border-l-2 border-l-brand-primary' : 'border-l-2 border-l-transparent'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-sm text-brand-text truncate pr-2">
                                                {selectedFolder === 'inbox' ? (email.contact_name || email.from_email.split('@')[0]) : email.to_email.split('@')[0]}
                                            </span>
                                            <span className="text-xs text-brand-text-secondary whitespace-nowrap pt-0.5">
                                                {new Date(email.sent_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="text-sm font-medium text-brand-text truncate mb-1">
                                            {email.subject}
                                        </div>
                                        <div className="text-xs text-brand-text-secondary line-clamp-2 leading-relaxed">
                                            {email.body}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Email Reading Pane */}
                <div className="flex-1 bg-white overflow-y-auto">
                    {selectedEmail ? (
                        <div className="h-full flex flex-col">
                            {/* Email Header */}
                            <div className="p-6 border-b border-brand-border/50">
                                <h2 className="text-2xl font-bold text-brand-text mb-6 mt-2">{selectedEmail.subject}</h2>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-brand-text-secondary shrink-0">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm text-brand-text">
                                                    {selectedFolder === 'inbox' ? (selectedEmail.contact_name || 'Unknown Contact') : 'You'}
                                                </span>
                                                <span className="text-xs text-brand-text-secondary">
                                                    &lt;{selectedFolder === 'inbox' ? selectedEmail.from_email : selectedEmail.from_email}&gt;
                                                </span>
                                            </div>
                                            <div className="text-xs text-brand-text-secondary mt-0.5">
                                                To: {selectedFolder === 'sent' ? selectedEmail.to_email : 'you@crm.com'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-brand-text-secondary bg-brand-surface px-2.5 py-1.5 rounded-md">
                                        <Clock className="w-3.5 h-3.5" />
                                        {formatDate(selectedEmail.sent_at)}
                                    </div>
                                </div>
                            </div>

                            {/* Email Body Snapshot */}
                            <div className="p-8 flex-1">
                                <div className="prose prose-sm max-w-none text-brand-text whitespace-pre-wrap leading-relaxed">
                                    {selectedEmail.body}
                                </div>
                            </div>

                            {/* Reply Action */}
                            <div className="p-6 border-t border-brand-border bg-brand-surface/30">
                                <Button
                                    variant="secondary"
                                    icon={<Send className="w-4 h-4" />}
                                    onClick={() => {
                                        // Open compose pre-filled
                                        setIsComposeOpen(true);
                                    }}
                                >
                                    Reply
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <EmptyState
                                icon={<Mail className="w-12 h-12" />}
                                title="No email selected"
                                description="Select an email from the list to read it here."
                            />
                        </div>
                    )}
                </div>
            </div>

            <ComposeModal
                isOpen={isComposeOpen}
                onClose={() => setIsComposeOpen(false)}
                onSubmit={handleSend}
                initialTo={selectedEmail && selectedFolder === 'inbox' ? selectedEmail.from_email : ''}
            />
        </div>
    );
};

export default EmailPage;
