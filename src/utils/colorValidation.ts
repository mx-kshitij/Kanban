/**
 * Color validation utilities for the Kanban widget
 */

/**
 * Validates if a string is a valid CSS color value
 * Supports: hex (#fff, #ffffff), rgb/rgba, hsl/hsla, named colors
 */
export function isValidColor(color: string): boolean {
    if (!color || typeof color !== 'string') {
        return false;
    }

    // Trim whitespace
    const trimmedColor = color.trim();
    
    if (!trimmedColor) {
        return false;
    }

    // Create a temporary element to test color validity
    const tempElement = document.createElement('div');
    tempElement.style.color = trimmedColor;
    
    // If the browser accepts the color, it will be set
    // If not, it will be empty or default
    return tempElement.style.color !== '';
}

/**
 * Sanitizes a color value to ensure it's safe to use in CSS
 * Returns empty string if invalid
 */
export function sanitizeColor(color: string): string {
    if (!color || typeof color !== 'string') {
        return '';
    }

    const trimmedColor = color.trim();
    
    if (!trimmedColor) {
        return '';
    }

    // Validate the color first
    if (!isValidColor(trimmedColor)) {
        return '';
    }

    return trimmedColor;
}

/**
 * Validates and provides a fallback color if the input is invalid
 */
export function validateColorWithFallback(color: string, fallback: string = ''): string {
    const sanitized = sanitizeColor(color);
    return sanitized || fallback;
}
