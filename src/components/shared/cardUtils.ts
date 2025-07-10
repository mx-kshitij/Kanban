import { createElement } from "react";
import { ObjectItem } from "mendix";

export interface CardData {
    id: string;
    content: any;
    item: ObjectItem;
    isUsingCache: boolean;
    key: string;
}

export interface CreateCardOptions {
    cardItem: ObjectItem;
    cardId: string;
    columnId: string;
    cardContent: any;
    shouldUseCache: boolean;
    cachedHtml?: string;
}

/**
 * Creates a card data object with proper caching logic
 */
export function createCard(options: CreateCardOptions): CardData {
    const { cardItem, cardId, columnId, cardContent, shouldUseCache, cachedHtml } = options;
    
    return {
        id: cardId,
        content: shouldUseCache && cachedHtml ? 
            createElement('div', { 
                dangerouslySetInnerHTML: { __html: cachedHtml },
                className: 'kanban-card-cached' 
            }) : 
            cardContent,
        item: cardItem,
        isUsingCache: shouldUseCache,
        // Use column ID as part of key to force re-render when card moves columns
        key: `${cardId}-${columnId}${shouldUseCache ? '-cached' : ''}`
    };
}
