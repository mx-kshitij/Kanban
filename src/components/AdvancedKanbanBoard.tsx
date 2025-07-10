/**
 * Advanced Kanban Board Component
 * 
 * Core single-board implementation using @dnd-kit for drag & drop functionality.
 * Handles column-based card organization with reordering support and visual feedback.
 * Includes ResizeObserver error suppression for smooth drag operations.
 */

import { ReactElement, createElement, useState, useEffect } from "react";
import { ReactNode } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
    DragOverEvent
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";

// Type definitions for Kanban data structures
export interface KanbanCard {
    id: string;
    content?: ReactNode;
    item: any;
    key?: string;
    isUsingCache?: boolean;
}

export interface KanbanColumn {
    id: string;
    title: ReactNode;
    cards: KanbanCard[];
}

export interface AdvancedKanbanBoardProps {
    columns: KanbanColumn[];
    onCardDrop: (cardId: string, sourceColumnId: string, targetColumnId: string, newIndex?: number) => void;
    allowCardReordering?: boolean;
    boardHeight?: number;
}

interface DroppableColumnProps {
    column: KanbanColumn;
    allowCardReordering: boolean;
    children: ReactNode;
    dragOverInfo?: {
        columnId: string;
        cardId?: string;
        position?: 'before' | 'after';
    } | null;
}

interface DraggableCardProps {
    card: KanbanCard;
    isDragging?: boolean;
}

function DroppableColumn({ column, allowCardReordering, children, dragOverInfo }: DroppableColumnProps) {
    const cardIds = column.cards.map(card => card.id);
    const { setNodeRef, isOver } = useDroppable({
        id: `column-${column.id}`,
        data: {
            type: 'column',
            column
        }
    });

    const isDropTarget = dragOverInfo?.columnId === column.id;
    const dropPosition = dragOverInfo?.position;
    const dropCardId = dragOverInfo?.cardId;
    
    return (
        <div className="kanban-column" data-column-id={column.id}>
            <div className="kanban-column-header">
                <div className="kanban-column-title">{column.title}</div>
                <span className="kanban-card-count">{column.cards.length}</span>
            </div>
            <div 
                ref={setNodeRef}
                className={`kanban-column-content ${isOver ? 'drag-over' : ''} ${isDropTarget ? 'cross-column-drop-target' : ''}`}
                data-column-drop-zone={column.id}
            >
                {allowCardReordering ? (
                    <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                        {column.cards.map((card) => {
                            const showDropIndicator = isDropTarget && dropCardId === card.id && dropPosition === 'after';
                            return (
                                <div key={card.key || card.id}>
                                    <DraggableCard card={card} />
                                    {showDropIndicator && (
                                        <div className="drop-indicator">
                                            <div className="drop-line"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {/* Show drop indicator at the end of column if dropping on empty space */}
                        {isDropTarget && !dropCardId && (
                            <div className="drop-indicator-end">
                                <div className="drop-line"></div>
                            </div>
                        )}
                    </SortableContext>
                ) : (
                    children
                )}
                {column.cards.length === 0 && (
                    <div className="kanban-column-empty" data-column-drop-zone={column.id}>
                        Drop cards here
                    </div>
                )}
            </div>
        </div>
    );
}

function DraggableCard({ card, isDragging = false }: DraggableCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: sortableIsDragging
    } = useSortable({ 
        id: card.id,
        data: {
            type: 'card',
            card
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: sortableIsDragging ? 0.5 : 1
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`kanban-card ${isDragging || sortableIsDragging ? 'dragging' : ''}`}
            data-card-id={card.id}
            {...attributes}
            {...listeners}
        >
            {card.content ? (
                <div key={card.key || card.id} className="kanban-card-content">
                    {card.content}
                </div>
            ) : (
                <div className="kanban-card-fallback">
                    Card {card.id}
                </div>
            )}
        </div>
    );
}

export function AdvancedKanbanBoard({ 
    columns, 
    onCardDrop, 
    allowCardReordering = true,
    boardHeight = 400
}: AdvancedKanbanBoardProps): ReactElement {
    const [activeItem, setActiveItem] = useState<{ type: 'card'; item: KanbanCard } | null>(null);
    const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
    const [dragOverInfo, setDragOverInfo] = useState<{
        columnId: string;
        cardId?: string;
        position?: 'before' | 'after';
    } | null>(null);

    // Enhanced error suppression for single board drag operations
    useEffect(() => {
        const originalError = console.error;
        
        const suppressError = (...args: any[]) => {
            const message = args[0]?.toString?.() || '';
            if (message.includes('ResizeObserver loop completed with undelivered notifications') ||
                message.includes('ResizeObserver loop limit exceeded')) {
                return;
            }
            originalError.apply(console, args);
        };

        console.error = suppressError;

        return () => {
            console.error = originalError;
        };
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const findCardAndColumn = (cardId: string) => {
        for (const column of columns) {
            const card = column.cards.find(c => c.id === cardId);
            if (card) {
                return { card, columnId: column.id };
            }
        }
        return null;
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const data = active.data.current;

        // Suppress ResizeObserver errors during drag start
        const originalError = console.error;
        console.error = (...args: any[]) => {
            const message = args[0]?.toString?.() || '';
            if (message.includes('ResizeObserver')) return;
            originalError.apply(console, args);
        };

        if (data?.type === 'card') {
            const result = findCardAndColumn(active.id as string);
            if (result) {
                // Defer state updates to prevent ResizeObserver loops
                requestAnimationFrame(() => {
                    setActiveItem({ type: 'card', item: result.card });
                    setActiveColumnId(result.columnId);
                });
            }
        }
        setDragOverInfo(null);
        
        // Restore error handling after brief delay
        setTimeout(() => {
            console.error = originalError;
        }, 100);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        
        if (!over || !active.data.current?.card || !activeColumnId) {
            setDragOverInfo(null);
            return;
        }

        const overData = over.data.current;

        if (overData?.type === 'column') {
            // Hovering over a column
            const targetColumnId = overData.column.id;
            if (activeColumnId !== targetColumnId) {
                setDragOverInfo({
                    columnId: targetColumnId
                });
            } else {
                setDragOverInfo(null);
            }
        } else if (overData?.type === 'card') {
            // Hovering over a card
            const result = findCardAndColumn(over.id as string);
            if (result && activeColumnId !== result.columnId) {
                setDragOverInfo({
                    columnId: result.columnId,
                    cardId: result.card.id,
                    position: 'after'
                });
            } else {
                setDragOverInfo(null);
            }
        } else {
            setDragOverInfo(null);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        // Suppress ResizeObserver errors during drop operations
        const originalError = console.error;
        console.error = (...args: any[]) => {
            const message = args[0]?.toString?.() || '';
            if (message.includes('ResizeObserver')) return;
            originalError.apply(console, args);
        };
        
        if (!over || !activeItem || !activeColumnId) {
            setActiveItem(null);
            setActiveColumnId(null);
            setDragOverInfo(null);
            // Restore error handling
            setTimeout(() => {
                console.error = originalError;
            }, 200);
            return;
        }

        const activeData = active.data.current;
        const overData = over.data.current;

        if (activeData?.type === 'card') {
            let targetColumnId: string;
            let newIndex: number | undefined;

            if (overData?.type === 'card') {
                // Dropped over another card
                const overResult = findCardAndColumn(over.id as string);
                if (overResult) {
                    targetColumnId = overResult.columnId;
                    const targetColumn = columns.find(col => col.id === targetColumnId);
                    if (targetColumn) {
                        const targetIndex = targetColumn.cards.findIndex(card => card.id === over.id);
                        if (targetColumnId === activeColumnId) {
                            // Same column reordering - use exact index
                            newIndex = targetIndex;
                        } else {
                            // Cross-column drop - insert after the target card for better UX
                            newIndex = targetIndex + 1;
                        }
                    }
                } else {
                    targetColumnId = activeColumnId;
                }
            } else if (overData?.type === 'column') {
                // Dropped over a column
                targetColumnId = overData.column.id;
            } else {
                // Fallback - try to find column from the over id
                const columnMatch = over.id.toString().match(/column-(.+)/);
                if (columnMatch) {
                    targetColumnId = columnMatch[1];
                } else {
                    targetColumnId = activeColumnId;
                }
            }

            // Call onCardDrop if target column is different OR if we have a new index
            if (targetColumnId !== activeColumnId || (newIndex !== undefined && newIndex >= 0)) {
                onCardDrop(active.id as string, activeColumnId, targetColumnId, newIndex);
            }
        }

        // Defer state updates to prevent ResizeObserver loops
        requestAnimationFrame(() => {
            setActiveItem(null);
            setActiveColumnId(null);
            setDragOverInfo(null);
        });
        
        // Restore error handling after drop operation
        setTimeout(() => {
            console.error = originalError;
        }, 200);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div 
                className="kanban-board"
                style={{ 
                    height: `${boardHeight}px`,
                    minHeight: '150px',
                    maxHeight: `${boardHeight}px`
                }}
            >
                {columns.map((column) => (
                    <DroppableColumn 
                        key={column.id} 
                        column={column} 
                        allowCardReordering={allowCardReordering}
                        dragOverInfo={dragOverInfo}
                    >
                        {column.cards.map((card) => (
                            <DraggableCard key={card.key || card.id} card={card} />
                        ))}
                    </DroppableColumn>
                ))}
            </div>
            <DragOverlay>
                {activeItem && activeItem.type === 'card' ? (
                    <div className="kanban-card kanban-card-overlay">
                        {(activeItem.item as KanbanCard).content ? (
                            <div className="kanban-card-content">
                                {(activeItem.item as KanbanCard).content}
                            </div>
                        ) : (
                            <div className="kanban-card-fallback">
                                Card {(activeItem.item as KanbanCard).id}
                            </div>
                        )}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
