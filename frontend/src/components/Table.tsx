import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
    key: string;
    header: string;
    render?: (row: T) => React.ReactNode;
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyField: keyof T;
    onRowClick?: (row: T) => void;
    page?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    emptyMessage?: string;
    isLoading?: boolean;
}

export function Table<T extends Record<string, unknown>>({
    columns,
    data,
    keyField,
    onRowClick,
    page,
    totalPages,
    onPageChange,
    emptyMessage = 'No data found',
    isLoading = false,
}: TableProps<T>) {
    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className={col.className}>{col.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={columns.length} className="text-center py-12 text-brand-text-secondary">
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-brand-primary" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Loading...
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="text-center py-12 text-brand-text-secondary">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row) => (
                            <tr
                                key={String(row[keyField])}
                                onClick={() => onRowClick?.(row)}
                                className={onRowClick ? 'cursor-pointer' : ''}
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className={col.className}>
                                        {col.render ? col.render(row) : String(row[col.key] ?? '')}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            {page !== undefined && totalPages !== undefined && totalPages > 1 && onPageChange && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-brand-border/20">
                    <span className="text-sm text-brand-text-secondary">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                            className="p-1.5 rounded-md hover:bg-brand-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages}
                            className="p-1.5 rounded-md hover:bg-brand-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
