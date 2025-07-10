import { useCallback } from "react";

export interface UseCardDropOptions {
    onCardDrop?: any;
    changeJSON?: any;
    sortOrderJSON?: any;
    cacheCardContent: (cardId: string, element: HTMLElement) => void;
    clearCardCache: (cardId: string) => void;
    setCardsUsingCache: (updater: (prev: Set<string>) => Set<string>) => void;
}

/**
 * Custom hook for handling card drop operations with caching
 */
export function useCardDrop(options: UseCardDropOptions, getColumnsOrBoards: () => any[]) {
    const { 
        onCardDrop, 
        changeJSON, 
        sortOrderJSON, 
        cacheCardContent, 
        clearCardCache, 
        setCardsUsingCache 
    } = options;

    const handleCardDrop = useCallback((cardId: string, sourceColumnId: string, targetColumnId: string, newIndex?: number) => {
        // Step 1: Cache the current HTML content of the card before moving
        const cardElement = document.querySelector(`[data-card-id="${cardId}"]`) as HTMLElement;
        if (cardElement) {
            cacheCardContent(cardId, cardElement);
        }
        
        // Step 2: Mark this card as using cache
        setCardsUsingCache(prev => new Set(prev).add(cardId));
        
        try {
            // Update changeJSON with card movement information
            const changeData = {
                cardId,
                oldParentColumnId: sourceColumnId,
                newParentColumnId: targetColumnId
            };
            
            if (changeJSON && changeJSON.setValue) {
                changeJSON.setValue(JSON.stringify(changeData));
            }
            
            // Update sortOrderJSON with destination column's card order
            if (sortOrderJSON && sortOrderJSON.setValue) {
                const data = getColumnsOrBoards();
                let targetColumn = null;
                
                // For single board: data is columns directly
                // For multi board: data is boards, need to find column within boards
                if (data.length > 0 && data[0].columns) {
                    // Multi board case
                    for (const board of data) {
                        targetColumn = board.columns.find((col: any) => col.id === targetColumnId);
                        if (targetColumn) break;
                    }
                } else {
                    // Single board case
                    targetColumn = data.find((col: any) => col.id === targetColumnId);
                }
                
                if (targetColumn) {
                    // Create the current card order for the target column
                    let cardOrder = targetColumn.cards.map((card: any) => card.id);
                    
                    // If the card is moving within the same column, remove it from its current position
                    if (sourceColumnId === targetColumnId) {
                        cardOrder = cardOrder.filter((id: string) => id !== cardId);
                    }
                    
                    // Insert the card at the new position
                    const insertIndex = newIndex !== undefined ? Math.min(newIndex, cardOrder.length) : cardOrder.length;
                    cardOrder.splice(insertIndex, 0, cardId);
                    
                    // Create the sort order data with cardId and order
                    const sortOrderData = cardOrder.map((id: string, index: number) => ({
                        cardId: id,
                        order: index
                    }));
                    
                    sortOrderJSON.setValue(JSON.stringify(sortOrderData));
                }
            }
            
            // Step 3: Execute the configured action which will trigger real data update
            if (onCardDrop && onCardDrop.canExecute) {
                onCardDrop.execute();
            }
        } catch (error) {
            // Revert cached state on error
            clearCardCache(cardId);
        }
    }, [onCardDrop, changeJSON, sortOrderJSON, cacheCardContent, clearCardCache, setCardsUsingCache, getColumnsOrBoards]);

    return handleCardDrop;
}
