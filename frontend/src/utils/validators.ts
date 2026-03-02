/**
 * Validate an email address.
 */
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate a phone number (basic intl format).
 */
export function isValidPhone(phone: string): boolean {
    return /^\+?[\d\s\-()]{7,20}$/.test(phone);
}

/**
 * Validate URL.
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Check minimum password strength.
 */
export function isStrongPassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) return { valid: false, message: 'Min 8 characters' };
    if (!/[A-Z]/.test(password)) return { valid: false, message: 'Needs an uppercase letter' };
    if (!/[a-z]/.test(password)) return { valid: false, message: 'Needs a lowercase letter' };
    if (!/[0-9]/.test(password)) return { valid: false, message: 'Needs a number' };
    return { valid: true, message: 'Strong password' };
}
