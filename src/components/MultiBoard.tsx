/**
 * Multi Board Component
 * 
 * Handles the multi-board mode of the Kanban widget where multiple boards
 * are displayed, each containing their own columns and cards. Supports
 * collapsible boards and cross-board card movement.
 */

import { ReactElement, createElement, useCallback, useEffect, useState } from "react";
import { KanbanContainerProps } from "../../typings/KanbanProps";
import { ObjectItem, ValueStatus } from "mendix";
import { useCardCache } from "./shared/useCardCache";
import { createCard } from "./shared/cardUtils";
import { MultiBoardDragDrop } from "./MultiBoardDragDrop";

export interface MultiBoardProps extends KanbanContainerProps {}

/**
 * MultiBoard component that renders multiple Kanban boards with collapsible functionality
 * Uses MultiBoardDragDrop for advanced drag & drop across boards
 */
export function MultiBoard(props: MultiBoardProps): ReactElement {
    const {
        // Board data source and attributes
        m_data_boards,
        m_board_id,
        m_board_sort,
        m_board_content,
        
        // Column data source and attributes
        m_data_columns,
        m_column_id,
        m_column_parent,
        m_column_sort,
        m_column_content,
        m_data_cards,
        m_card_id,
        m_card_parent,
        m_card_sort,
        m_content,
        onCardDrop,
        changeJSON,
        sortOrderJSON,
        boardHeight
    } = props;

    // State for optimistic updates
    const [optimisticBoards, setOptimisticBoards] = useState<any[] | null>(null);
    
    // Use shared cache management
    const {
        cachedCardContent,
        cardsUsingCache,
        cacheCardContent,
        clearCardCache,
        setCardsUsingCache
    } = useCardCache();

    const getBoards = useCallback(() => {
        if (!m_data_boards || m_data_boards.status !== ValueStatus.Available) {
            return [];
        }

        return m_data_boards.items?.map((boardItem: ObjectItem) => {
            const boardId = m_board_id?.get(boardItem)?.value || "";
            const boardContent = m_board_content?.get(boardItem);
            const boardSortValue = m_board_sort?.get(boardItem)?.value?.toNumber() || 0;
            
            // Get columns for this board
            const columns = m_data_columns?.items?.filter((columnItem: ObjectItem) => {
                const columnParent = m_column_parent?.get(columnItem)?.value || "";
                return columnParent === boardId;
            })
            .sort((a, b) => {
                // Sort columns by sort attribute
                const sortA = m_column_sort?.get(a)?.value?.toNumber() || 0;
                const sortB = m_column_sort?.get(b)?.value?.toNumber() || 0;
                return sortA - sortB;
            })
            .map((columnItem: ObjectItem) => {
                const columnId = m_column_id?.get(columnItem)?.value || "";
                const columnContent = m_column_content?.get(columnItem);
                
                // Get cards for this column
                const cards = m_data_cards?.items?.filter((cardItem: ObjectItem) => {
                    const cardParent = m_card_parent?.get(cardItem)?.value || "";
                    return cardParent === columnId;
                })
                .sort((a, b) => {
                    // Sort cards by sort attribute
                    const sortA = m_card_sort?.get(a)?.value?.toNumber() || 0;
                    const sortB = m_card_sort?.get(b)?.value?.toNumber() || 0;
                    return sortA - sortB;
                })
                .map((cardItem: ObjectItem) => {
                    const cardId = m_card_id?.get(cardItem)?.value || "";
                    const cardContent = m_content?.get(cardItem);
                    
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
                    cards
                };
            }) || [];

            return {
                id: boardId,
                title: boardContent || boardId, // Use board content widget or fallback to ID
                columns,
                sortValue: boardSortValue
            };
        })?.sort((a, b) => {
            // Sort boards by sort attribute
            return a.sortValue - b.sortValue;
        }) || [];
    }, [m_data_boards, m_board_id, m_board_sort, m_board_content, m_data_columns, m_column_id, m_column_parent, m_column_sort, m_column_content, m_data_cards, m_card_id, m_card_parent, m_card_sort, m_content, cachedCardContent, cardsUsingCache]);

    const baseBoards = getBoards();

    // Additional effect to clear cache when real content is available
    useEffect(() => {
        // Check if any cards using cache now have real content available
        cardsUsingCache.forEach((cardId: string) => {
            const cardExists = m_data_cards?.items?.some(item => 
                m_card_id?.get(item)?.value === cardId
            );
            
            if (cardExists) {
                clearCardCache(cardId);
            }
        });
    }, [m_data_cards?.items, cardsUsingCache, clearCardCache, m_card_id]);

    // Enhanced cache clearing for multi-board - clear cache when data structure changes
    useEffect(() => {
        if (cardsUsingCache.size > 0) {
            // Clear cache after a short delay to allow Mendix data to update
            const timer = setTimeout(() => {
                cardsUsingCache.forEach(cardId => {
                    clearCardCache(cardId);
                });
            }, 1000); // 1 second delay to allow for data updates
            
            return () => clearTimeout(timer);
        }
    }, [baseBoards, cardsUsingCache, clearCardCache]);

    // Reset optimistic state when base data changes (similar to SingleBoard)
    useEffect(() => {
        if (optimisticBoards) {
            // Check if the base data now matches our optimistic state
            const optimisticMatches = optimisticBoards.every(optBoard => {
                const baseBoard = baseBoards.find(board => board.id === optBoard.id);
                return baseBoard && 
                       baseBoard.columns.length === optBoard.columns.length &&
                       baseBoard.columns.every((baseCol: any) => {
                           const optCol = optBoard.columns.find((col: any) => col.id === baseCol.id);
                           return optCol && 
                                  baseCol.cards.length === optCol.cards.length &&
                                  baseCol.cards.every((baseCard: any, index: number) => 
                                      baseCard.id === optCol.cards[index].id
                                  );
                       });
            });

            if (optimisticMatches) {
                // Data now matches our optimistic state, safe to clear
                setOptimisticBoards(null);
                
                // Clear all cached content for cards that were using cache
                cardsUsingCache.forEach(cardId => {
                    clearCardCache(cardId);
                });
                
            } else {
                // Data doesn't match yet, keep optimistic state but set a fallback timer
                const timer = setTimeout(() => {
                    setOptimisticBoards(null);
                    cardsUsingCache.forEach(cardId => {
                        clearCardCache(cardId);
                    });
                }, 3000); // 3 second fallback for cached content
                return () => clearTimeout(timer);
            }
        }
    }, [baseBoards, optimisticBoards, cardsUsingCache, clearCardCache]);

    // Use optimistic boards if available, otherwise use base boards
    const boards = optimisticBoards || baseBoards;

    const handleCardDrop = useCallback((cardId: string, sourceColumnId: string, targetColumnId: string, newIndex?: number) => {
        // Step 1: Cache the current HTML content of the card before moving
        const cardElement = document.querySelector(`[data-card-id="${cardId}"]`) as HTMLElement;
        if (cardElement) {
            cacheCardContent(cardId, cardElement);
        }
        
        // Step 2: Mark this card as using cache and perform optimistic update
        setCardsUsingCache(prev => new Set(prev).add(cardId));
        
        const currentBoards = optimisticBoards || baseBoards;
        const newBoards = performOptimisticCardMove(currentBoards, cardId, sourceColumnId, targetColumnId, newIndex);
        setOptimisticBoards(newBoards);
        
        try {
            // Update changeJSON with card movement information (keep it simple)
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
                // Find the target column across all boards
                let targetColumn = null;
                for (const board of newBoards) {
                    targetColumn = board.columns.find((col: any) => col.id === targetColumnId);
                    if (targetColumn) break;
                }
                
                if (targetColumn) {
                    // Create the sort order data with cardId and order (keep same format)
                    const sortOrderData = targetColumn.cards.map((card: any, index: number) => ({
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
            setOptimisticBoards(null);
            clearCardCache(cardId);
        }
    }, [onCardDrop, changeJSON, sortOrderJSON, optimisticBoards, baseBoards, cacheCardContent, clearCardCache, setCardsUsingCache]);

    // Helper function to perform optimistic card movement for multi-board
    const performOptimisticCardMove = useCallback((
        boards: any[], 
        cardId: string, 
        sourceColumnId: string, 
        targetColumnId: string, 
        newIndex?: number
    ): any[] => {
        const newBoards = boards.map(board => ({
            ...board,
            columns: board.columns.map((col: any) => ({
                ...col,
                cards: [...col.cards]
            }))
        }));

        // Find source and target columns across all boards
        let sourceColumn = null;
        let targetColumn = null;

        for (const board of newBoards) {
            for (const column of board.columns) {
                if (column.id === sourceColumnId) {
                    sourceColumn = column;
                }
                if (column.id === targetColumnId) {
                    targetColumn = column;
                }
            }
        }

        if (!sourceColumn || !targetColumn) {
            return boards;
        }

        // Find and remove the card from source column
        const cardIndex = sourceColumn.cards.findIndex((card: any) => card.id === cardId);
        if (cardIndex === -1) {
            return boards;
        }

        const originalCard = sourceColumn.cards[cardIndex];
        sourceColumn.cards.splice(cardIndex, 1);

        // Create a new card object with updated key for the target column
        const movedCard = {
            ...originalCard,
            // Update the key to force re-render in new column context
            key: `${originalCard.id}-${targetColumnId}`
        };

        // Add card to target column at specified position
        const insertIndex = newIndex !== undefined ? Math.min(newIndex, targetColumn.cards.length) : targetColumn.cards.length;
        targetColumn.cards.splice(insertIndex, 0, movedCard);

        return newBoards;
    }, []);

    // Get the board height from prop or use default
    const defaultBoardHeight = boardHeight || 400;

    return (
        <MultiBoardDragDrop
            boards={boards}
            onCardDrop={handleCardDrop}
            allowCardReordering={true}
            defaultBoardHeight={defaultBoardHeight}
            collapsible={true}
        />
    );
}

/*
 * Cross-Board Card Movement Implementation Guide
 * 
 * When a card is moved across boards, the changeJSON will contain:
 * {
 *   "cardId": "card123",
 *   "oldParentColumnId": "column1", 
 *   "newParentColumnId": "column2"
 * }
 * 
 * And sortOrderJSON will contain the new card order for the target column:
 * [
 *   { "cardId": "card1", "order": 0 },
 *   { "cardId": "card123", "order": 1 },
 *   { "cardId": "card3", "order": 2 }
 * ]
 * 
 * In your Mendix microflow:
 * 1. Parse the changeJSON to get movement details
 * 2. Update the card's parent column ID (m_card_parent)
 *    - This automatically moves the card to the new board since 
 *      columns belong to specific boards
 * 3. Use sortOrderJSON to update card ordering in the target column
 * 4. Refresh the widget data sources to reflect changes
 * 
 * The phantom card system ensures smooth visual feedback during 
 * the microflow execution.
 */
