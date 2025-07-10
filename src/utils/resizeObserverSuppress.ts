/**
 * Utility to suppress ResizeObserver loop errors globally
 */

let suppressionActive = false;

export function enableResizeObserverSuppression() {
    if (suppressionActive) return;
    
    suppressionActive = true;
    
    // Comprehensive error event handling
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
    
    // Add error event listener
    window.addEventListener('error', errorHandler, true);
    
    // Patch console.error
    const originalConsoleError = console.error;
    console.error = (...args) => {
        const message = args[0]?.toString() || '';
        if (message.includes('ResizeObserver loop')) {
            return;
        }
        originalConsoleError.apply(console, args);
    };
    
    // Patch window.onerror
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
        const messageStr = message?.toString() || '';
        if (messageStr.includes('ResizeObserver loop')) {
            return true;
        }
        
        if (originalOnError) {
            return originalOnError(message, source, lineno, colno, error);
        }
        return false;
    };
    
    // Patch unhandled promise rejections
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
    
    // Return cleanup function
    return () => {
        window.removeEventListener('error', errorHandler, true);
        console.error = originalConsoleError;
        window.onerror = originalOnError;
        window.onunhandledrejection = originalUnhandledRejection;
        suppressionActive = false;
    };
}

export function createResizeObserverErrorSuppressor() {
    // Store original ResizeObserver
    const OriginalResizeObserver = window.ResizeObserver;
    
    if (!OriginalResizeObserver) return null;
    
    // Create wrapper that catches and suppresses specific errors
    class SuppressedResizeObserver extends OriginalResizeObserver {
        constructor(callback: ResizeObserverCallback) {
            const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
                try {
                    // Use requestIdleCallback or setTimeout to defer execution
                    if (window.requestIdleCallback) {
                        window.requestIdleCallback(() => {
                            try {
                                callback(entries, observer);
                            } catch (error) {
                                // Silently suppress ResizeObserver errors
                                const errorMessage = error?.toString() || '';
                                if (!errorMessage.includes('ResizeObserver loop')) {
                                    console.warn('ResizeObserver callback error:', error);
                                }
                            }
                        });
                    } else {
                        setTimeout(() => {
                            try {
                                callback(entries, observer);
                            } catch (error) {
                                // Silently suppress ResizeObserver errors
                                const errorMessage = error?.toString() || '';
                                if (!errorMessage.includes('ResizeObserver loop')) {
                                    console.warn('ResizeObserver callback error:', error);
                                }
                            }
                        }, 0);
                    }
                } catch (error) {
                    // Silently suppress ResizeObserver errors
                    const errorMessage = error?.toString() || '';
                    if (!errorMessage.includes('ResizeObserver loop')) {
                        console.warn('ResizeObserver setup error:', error);
                    }
                }
            };
            super(wrappedCallback);
        }
    }
    
    return {
        apply: () => {
            window.ResizeObserver = SuppressedResizeObserver;
        },
        restore: () => {
            window.ResizeObserver = OriginalResizeObserver;
        }
    };
}
