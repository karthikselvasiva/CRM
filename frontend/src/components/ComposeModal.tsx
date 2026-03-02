import React, { useState, useEffect } from 'react';
import { X, Send, ChevronDown } from 'lucide-react';
import { Button } from './Button';
import { apiClient } from '../api/client';

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
}

export interface ComposeFormData {
    to_email: string;
    subject: string;
    body: string;
}

interface ComposeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ComposeFormData) => Promise<void>;
    initialTo?: string; // If composing from a specific contact
}

const ComposeModal: React.FC<ComposeModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialTo = ''
}) => {
    const [to, setTo] = useState(initialTo);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Templates
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [showTemplates, setShowTemplates] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTo(initialTo);
            setSubject('');
            setBody('');
            setShowTemplates(false);

            // Fetch templates
            apiClient.get('/emails/templates')
                .then(res => setTemplates(res.data.data))
                .catch(err => console.error("Failed to load templates", err));
        }
    }, [isOpen, initialTo]);

    const handleApplyTemplate = (template: EmailTemplate) => {
        setSubject(template.subject);
        setBody(template.body);
        setShowTemplates(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit({ to_email: to, subject, body });
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:pr-8 sm:pb-8 p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm sm:hidden" onClick={onClose} />

            <div className="relative w-full sm:w-[500px] h-[80vh] sm:h-[600px] bg-brand-surface border border-brand-border shadow-2xl rounded-t-xl sm:rounded-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 sm:slide-in-from-right-8 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-brand-surface border-b border-brand-border/50">
                    <h2 className="text-sm font-semibold text-brand-text">New Message</h2>
                    <div className="flex items-center gap-2">
                        {templates.length > 0 && (
                            <div className="relative">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowTemplates(!showTemplates)}
                                    icon={<ChevronDown className="w-4 h-4" />}
                                    className="!py-1"
                                >
                                    Templates
                                </Button>

                                {showTemplates && (
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-brand-border rounded-lg shadow-lg py-1 z-10">
                                        {templates.map(t => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => handleApplyTemplate(t)}
                                                className="w-full text-left px-3 py-2 text-sm text-brand-text hover:bg-brand-gray/50 transition-colors truncate"
                                            >
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1 text-brand-text-secondary hover:bg-brand-gray/50 rounded transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 divide-y divide-brand-border/50">
                    <div className="px-4 py-2 flex items-center">
                        <span className="text-sm text-brand-text-secondary w-12 shrink-0">To</span>
                        <input
                            type="email"
                            required
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="flex-1 bg-transparent border-none text-sm focus:ring-0 px-2 py-1 outline-none text-brand-text"
                            placeholder="Recipient email"
                        />
                    </div>
                    <div className="px-4 py-2 flex items-center">
                        <span className="text-sm text-brand-text-secondary w-12 shrink-0">Subject</span>
                        <input
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="flex-1 bg-transparent border-none text-sm font-medium focus:ring-0 px-2 py-1 outline-none text-brand-text"
                            placeholder="Email subject"
                        />
                    </div>

                    <div className="flex-1 p-4 relative">
                        <textarea
                            required
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] resize-none bg-transparent border-none text-sm focus:ring-0 outline-none text-brand-text whitespace-pre-wrap"
                            placeholder="Write your message here..."
                        />
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-brand-surface flex items-center justify-between border-t border-brand-border/50">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            type="button"
                        >
                            Discard
                        </Button>
                        <Button
                            variant="primary"
                            isLoading={isSubmitting}
                            icon={<Send className="w-3.5 h-3.5" />}
                            type="submit"
                        >
                            Send
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComposeModal;
