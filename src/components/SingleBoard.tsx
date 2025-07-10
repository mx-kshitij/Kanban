import { ReactElement, createElement, useCallback, useState, useEffect } from "react";
import { KanbanContainerProps } from "../../typings/KanbanProps";
import { ObjectItem, ValueStatus } from "mendix";
import { AdvancedKanbanBoard, KanbanColumn } from "./AdvancedKanbanBoard";
import { useCardCache } from "./shared/useCardCache";
import { createCard } from "./shared/cardUtils";

export interface SingleBoardProps extends KanbanContainerProps {}

export function SingleBoard(props: SingleBoardProps): ReactElement {
    const {
        s_data_columns,
        s_column_id,
        s_column_sort,
        s_column_content,
        s_data_cards,
        s_card_id,
        s_card_parent,
        s_card_sort,
        s_content,
        onCardDrop,
        changeJSON,
        sortOrderJSON,
        boardHeight
    } = props;

    // State for optimistic updates
    const [optimisticColumns, setOptimisticColumns] = useState<KanbanColumn[] | null>(null);
    
    // Use shared cache management
    const {
        cachedCardContent,
        cardsUsingCache,
        cacheCardContent,
        clearCardCache,
        setCardsUsingCache
    } = useCardCache();

    const getColumns = useCallback(() => {
        if (!s_data_columns || s_data_columns.status !== ValueStatus.Available) {
            return [];
        }

        return s_data_columns.items?.map((columnItem: ObjectItem) => {
            const columnId = s_column_id?.get(columnItem)?.value || "";
            const columnContent = s_column_content?.get(columnItem);
            const columnSortValue = s_column_sort?.get(columnItem)?.value?.toNumber() || 0;
            
            // Get cards for this column
            const cards = s_data_cards?.items?.filter((cardItem: ObjectItem) => {
                const cardParent = s_card_parent?.get(cardItem)?.value || "";
                return cardParent === columnId;
            })
            .sort((a, b) => {
                // Sort cards by sort attribute if available
                const sortA = s_card_sort?.get(a)?.value?.toNumber() || 0;
                const sortB = s_card_sort?.get(b)?.value?.toNumber() || 0;
                return sortA - sortB;
            })
            .map((cardItem: ObjectItem) => {
                const cardId = s_card_id?.get(cardItem)?.value || "";
                const cardContent = s_content?.get(cardItem);
                
                // Check if this card should use cached content
                const shouldUseCache = cardsUsingCache.has(cardId);
                const cachedHtml = cachedCardContent.get(cardId);
                
                return createCard({
                    cardItem,
                    cardId,
                    columnId,
                    cardContent,
                    shouldUseCache,
                    cachedHtml
                });
            }) || [];

            return {
                id: columnId,
                title: columnContent || columnId, // Use column content widget or fallback to ID
                cards,
                sortValue: columnSortValue
            };
        })?.sort((a, b) => {
            // Sort columns by sort attribute
            return a.sortValue - b.sortValue;
        }) || [];
    }, [s_data_columns, s_column_id, s_column_sort, s_column_content, s_data_cards, s_card_id, s_card_parent, s_card_sort, s_content, cachedCardContent, cardsUsingCache]);

    const baseColumns = getColumns();

    // Additional effect to clear cache when real content is available
    useEffect(() => {
        // Check if any cards using cache now have real content available
        cardsUsingCache.forEach(cardId => {
            const cardExists = s_data_cards?.items?.some(item => 
                s_card_id?.get(item)?.value === cardId
            );
            
            if (cardExists) {
                clearCardCache(cardId);
            }
        });
    }, [s_data_cards?.items, cardsUsingCache, clearCardCache, s_card_id]);

    // Reset optimistic state when base data changes, but only if the data actually reflects our optimistic changes
    useEffect(() => {
        if (optimisticColumns) {
            // Check if the base data now matches our optimistic state
            const optimisticMatches = optimisticColumns.every(optCol => {
                const baseCol = baseColumns.find(col => col.id === optCol.id);
                return baseCol && 
                       baseCol.cards.length === optCol.cards.length &&
                       baseCol.cards.every((baseCard, index) => 
                           baseCard.id === optCol.cards[index].id
                       );
            });

            if (optimisticMatches) {
                // Data now matches our optimistic state, safe to clear
                setOptimisticColumns(null);
                
                // Clear all cached content for cards that were using cache
                cardsUsingCache.forEach(cardId => {
                    clearCardCache(cardId);
                });
                
            } else {
                // Data doesn't match yet, keep optimistic state but set a fallback timer
                const timer = setTimeout(() => {
                    setOptimisticColumns(null);
                    cardsUsingCache.forEach(cardId => {
                        clearCardCache(cardId);
                    });
                }, 3000); // 3 second fallback for cached content
                return () => clearTimeout(timer);
            }
        }
    }, [baseColumns, optimisticColumns, cardsUsingCache, clearCardCache]);

    // Use optimistic columns if available, otherwise use base columns
    const columns = optimisticColumns || baseColumns;

    const handleCardDrop = useCallback((cardId: string, sourceColumnId: string, targetColumnId: string, newIndex?: number) => {
        // Step 1: Cache the current HTML content of the card before moving
        const cardElement = document.querySelector(`[data-card-id="${cardId}"]`) as HTMLElement;
        if (cardElement) {
            cacheCardContent(cardId, cardElement);
        }
        
        // Step 2: Mark this card as using cache and perform optimistic update
        setCardsUsingCache(prev => new Set(prev).add(cardId));
        
        const currentColumns = optimisticColumns || baseColumns;
        const newColumns = performOptimisticCardMove(currentColumns, cardId, sourceColumnId, targetColumnId, newIndex);
        setOptimisticColumns(newColumns);
        
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
                // Find the target column and get all its cards
                const targetColumn = newColumns.find(col => col.id === targetColumnId);
                if (targetColumn) {
                    // Create the sort order data with cardId and order
                    const sortOrderData = targetColumn.cards.map((card, index) => ({
                        cardId: card.id,
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
            // Revert optimistic update on error
            setOptimisticColumns(null);
            clearCardCache(cardId);
        }
    }, [onCardDrop, changeJSON, sortOrderJSON, optimisticColumns, baseColumns, cacheCardContent, clearCardCache]);

    // Helper function to perform optimistic card movement
    const performOptimisticCardMove = useCallback((
        columns: KanbanColumn[], 
        cardId: string, 
        sourceColumnId: string, 
        targetColumnId: string, 
        newIndex?: number
    ): KanbanColumn[] => {
        const newColumns = columns.map(col => ({
            ...col,
            cards: [...col.cards]
        }));

        // Find source and target columns
        const sourceColumn = newColumns.find(col => col.id === sourceColumnId);
        const targetColumn = newColumns.find(col => col.id === targetColumnId);

        if (!sourceColumn || !targetColumn) {
            return columns;
        }

        // Find and remove the card from source column
        const cardIndex = sourceColumn.cards.findIndex(card => card.id === cardId);
        if (cardIndex === -1) {
            return columns;
        }

        const originalCard = sourceColumn.cards[cardIndex];
        sourceColumn.cards.splice(cardIndex, 1);

        // Create a new card object with updated key for the target column, preserving all original data
        const movedCard = {
            ...originalCard,
            // Update the key to force re-render in new column context
            key: `${originalCard.id}-${targetColumnId}`
        };

        // Add card to target column at specified position
        const insertIndex = newIndex !== undefined ? Math.min(newIndex, targetColumn.cards.length) : targetColumn.cards.length;
        targetColumn.cards.splice(insertIndex, 0, movedCard);

        return newColumns;
    }, []);

    // Get the board height from prop or use default
    const defaultBoardHeight = boardHeight?.value?.toNumber() || 400;

    return (
        <div className="kanban-single-board">
            <AdvancedKanbanBoard
                columns={columns}
                onCardDrop={handleCardDrop}
                boardHeight={defaultBoardHeight}
            />
        </div>
    );
}
