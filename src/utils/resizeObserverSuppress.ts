/**
 * ResizeObserver Error Suppression Utility
 * 
 * This utility provides comprehensive suppression of ResizeObserver loop errors
 * that commonly occur with drag & drop libraries like @dnd-kit. The errors are
 * harmless but can clutter the console during development.
 * 
 * Implements multiple suppression strategies:
 * - Global error event handling
 * - Console.error patching
 * - Custom ResizeObserver wrapper with deferred callbacks
 */

let suppressionActive = false;

/**
 * Enables global ResizeObserver error suppression using multiple strategies
 * @returns Cleanup function to restore original error handlers
 */
export function enableResizeObserverSuppression() {
    if (suppressionActive) return;
    
    suppressionActive = true;
    
    // Strategy 1: Comprehensive error event handling
    const errorHandler = (event: ErrorEvent) => {
        const message = event.message || event.error?.message || '';
        if (message.includes('ResizeObserver loop completed with undelivered notifications') ||
            message.includes('ResizeObserver loop limit exceeded') ||
            message.includes('ResizeObserver loop')) {
            event.stopPropagation();
            event.preventDefault();
            return false;
        }
        return true;
    };
    
    // Add error event listener with capture to intercept early
    window.addEventListener('error', errorHandler, true);
    
    // Strategy 2: Patch console.error to suppress specific messages
    const originalConsoleError = console.error;
    console.error = (...args) => {
        const message = args[0]?.toString() || '';
        if (message.includes('ResizeObserver loop')) {
            return; // Silently ignore ResizeObserver loop errors
        }
        originalConsoleError.apply(console, args);
    };
    
    // Strategy 3: Patch window.onerror as fallback
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
        const messageStr = message?.toString() || '';
        if (messageStr.includes('ResizeObserver loop')) {
            return true; // Prevent default error handling
        }
        
        if (originalOnError) {
            return originalOnError(message, source, lineno, colno, error);
        }
        return false;
    };
    
    // Strategy 4: Handle unhandled promise rejections
    const originalUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = (event: PromiseRejectionEvent) => {
        const reason = event.reason?.toString() || '';
        if (reason.includes('ResizeObserver loop')) {
            event.preventDefault();
            return;
        }
        
        if (originalUnhandledRejection) {
            originalUnhandledRejection.call(window, event);
        }
    };
    
    // Return cleanup function to restore original handlers
    return () => {
        window.removeEventListener('error', errorHandler, true);
        console.error = originalConsoleError;
        window.onerror = originalOnError;
        window.onunhandledrejection = originalUnhandledRejection;
        suppressionActive = false;
    };
}

/**
 * Creates a custom ResizeObserver wrapper that defers callbacks to prevent loop errors
 * @returns Object with apply/restore methods to manage the wrapper
 */
export function createResizeObserverErrorSuppressor() {
    // Store original ResizeObserver implementation
    const OriginalResizeObserver = window.ResizeObserver;
    
    if (!OriginalResizeObserver) return null;
    
    // Create enhanced ResizeObserver that defers callback execution
    class SuppressedResizeObserver extends OriginalResizeObserver {
        constructor(callback: ResizeObserverCallback) {
            // Wrap the callback to defer execution and handle errors gracefully
            const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
                try {
                    // Use requestIdleCallback for better performance when available
                    if (window.requestIdleCallback) {
                        window.requestIdleCallback(() => {
                            try {
                                callback(entries, observer);
                            } catch (error) {
                                // Silently suppress ResizeObserver errors, log others
                                const errorMessage = error?.toString() || '';
                                if (!errorMessage.includes('ResizeObserver loop')) {
                                    console.warn('ResizeObserver callback error:', error);
                                }
                            }
                        });
                    } else {
                        // Fallback to setTimeout for older browsers
                        setTimeout(() => {
                            try {
                                callback(entries, observer);
                            } catch (error) {
                                // Silently suppress ResizeObserver errors, log others
                                const errorMessage = error?.toString() || '';
                                if (!errorMessage.includes('ResizeObserver loop')) {
                                    console.warn('ResizeObserver callback error:', error);
                                }
                            }
                        }, 0);
                    }
                } catch (error) {
                    // Handle setup errors gracefully
                    const errorMessage = error?.toString() || '';
                    if (!errorMessage.includes('ResizeObserver loop')) {
                        console.warn('ResizeObserver setup error:', error);
                    }
                }
            };
            super(wrappedCallback);
        }
    }
    
    // Return control object for managing the wrapper
    return {
        apply: () => {
            window.ResizeObserver = SuppressedResizeObserver;
        },
        restore: () => {
            window.ResizeObserver = OriginalResizeObserver;
        }
    };
}
