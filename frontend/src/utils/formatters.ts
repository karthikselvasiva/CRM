export const formatCurrency = (value: number | undefined | null, currency: string = 'USD') => {
    if (value === undefined || value === null) return '';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};
