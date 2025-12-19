/**
 * Form validation utilities for consistent validation across the app
 */

// Indian phone number regex - supports:
// - 10 digit numbers (9876543210)
// - With country code (+919876543210)
// - With spaces/dashes (98765 43210, 9876-543-210)
export function isValidPhoneNumber(phone: string): boolean {
    // Remove all spaces, dashes, and parentheses
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Check for Indian number format
    // Either 10 digits, or +91/91 followed by 10 digits
    const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    return indianPhoneRegex.test(cleaned);
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // If it has country code, format accordingly
    if (cleaned.startsWith('+91')) {
        const number = cleaned.slice(3);
        return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
    } else if (cleaned.startsWith('91') && cleaned.length === 12) {
        const number = cleaned.slice(2);
        return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
    } else if (cleaned.length === 10) {
        return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }

    return phone;
}

// Validate email format
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
export function validatePassword(password: string): { isValid: boolean; message: string } {
    if (password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters' };
    }

    if (password.length < 8) {
        return { isValid: true, message: 'Consider using 8+ characters for stronger security' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecial].filter(Boolean).length;

    if (strength >= 3) {
        return { isValid: true, message: 'Strong password!' };
    } else if (strength >= 2) {
        return { isValid: true, message: 'Moderate password' };
    }

    return { isValid: true, message: '' };
}

// Validate Indian pincode
export function isValidPincode(pincode: string): boolean {
    // Indian pincodes are 6 digits, first digit is 1-9
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
}

// Validate name (only letters and spaces, min 2 chars)
export function isValidName(name: string): boolean {
    const nameRegex = /^[a-zA-Z\s]{2,}$/;
    return nameRegex.test(name.trim());
}

// Check if string is empty or only whitespace
export function isEmpty(value: string): boolean {
    return !value || value.trim().length === 0;
}

// Sanitize string input (basic XSS prevention)
export function sanitizeInput(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
}
