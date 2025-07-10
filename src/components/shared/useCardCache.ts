import { useState, useCallback, useEffect } from "react";

/**
 * Custom hook for managing card content caching during drag operations
 */
export function useCardCache() {
    // Cache for static HTML content during drag operations
    const [cachedCardContent, setCachedCardContent] = useState<Map<string, string>>(new Map());
    
    // Track cards that are using cached content (waiting for real re-render)
    const [cardsUsingCache, setCardsUsingCache] = useState<Set<string>>(new Set());

    // Function to cache card content as static HTML
    const cacheCardContent = useCallback((cardId: string, element: HTMLElement) => {
        if (element) {
            const htmlContent = element.innerHTML;
            setCachedCardContent(prev => {
                const newMap = new Map(prev);
                newMap.set(cardId, htmlContent);
                return newMap;
            });
        }
    }, []);

    // Function to clear cached content when real content is ready
    const clearCardCache = useCallback((cardId: string) => {
        setCachedCardContent(prev => {
            const newMap = new Map(prev);
            newMap.delete(cardId);
            return newMap;
        });
        setCardsUsingCache(prev => {
            const newSet = new Set(prev);
            newSet.delete(cardId);
            return newSet;
        });
    }, []);

    // Timeout-based cache clearing as a fallback
    useEffect(() => {
        if (cardsUsingCache.size > 0) {
            const timer = setTimeout(() => {
                cardsUsingCache.forEach(cardId => {
                    clearCardCache(cardId);
                });
            }, 3000); // 3 second fallback for cached content
            return () => clearTimeout(timer);
        }
    }, [cardsUsingCache, clearCardCache]);

    return {
        cachedCardContent,
        cardsUsingCache,
        cacheCardContent,
        clearCardCache,
        setCardsUsingCache
    };
}
