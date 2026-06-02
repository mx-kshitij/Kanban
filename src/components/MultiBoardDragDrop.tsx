/**
 * Multi Board Drag & Drop Component
 * 
 * Advanced drag & drop implementation for multiple Kanban boards using @dnd-kit.
 * Supports cross-board card movement, collapsible boards, and optimistic UI updates.
 * Includes comprehensive ResizeObserver error suppression for smooth drag operations.
 */

import { ReactElement, createElement, useState, useEffect } from "react";
import { ReactNode } from "react";
import {
    Active,
    CollisionDetection,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
    pointerWithin,
    DragOverEvent,
    Over
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { KanbanCard, KanbanColumn } from "./AdvancedKanbanBoard";

/**
 * Determines the best text color (white or black) based on background color brightness
 */
function getContrastTextColor(backgroundColor: string): string {
    // Convert color to RGB values
    const color = backgroundColor.trim();
    
    // Handle hex colors
    if (color.startsWith('#')) {
        const hex = color.substring(1);
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Calculate luminance using the relative luminance formula
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Return white text for dark backgrounds, black text for light backgrounds
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }
    
    // Handle rgb/rgba colors
    if (color.startsWith('rgb')) {
        const match = color.match(/\d+/g);
        if (match && match.length >= 3) {
            const r = parseInt(match[0]);
            const g = parseInt(match[1]);
            const b = parseInt(match[2]);
            
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance > 0.5 ? '#000000' : '#ffffff';
        }
    }
    
    // Default to white text for unknown color formats
    return '#ffffff';
}

export interface MultiBoardDragDropProps {
    boards: Array<{
        id: string;
        title: ReactNode;
        columns: KanbanColumn[];
        color?: string;
    }>;
    onCardDrop: (cardId: string, sourceColumnId: string, targetColumnId: string, newIndex?: number) => void;
    allowCardReordering?: boolean;
    defaultBoardHeight?: number;
    collapsible?: boolean;
    showBoardStats?: boolean;
    showColumnStats?: boolean;
}

interface DraggableCardProps {
    card: KanbanCard;
    isDragging?: boolean;
}

interface DroppableColumnProps {
    column: KanbanColumn;
    boardId: string;
    allowCardReordering: boolean;
    children: ReactNode;
    dragOverInfo?: {
        columnId: string;
        cardId?: string;
        position?: 'before' | 'after';
    } | null;
    showColumnStats?: boolean;
}

interface BoardContainerProps {
    board: {
        id: string;
        title: ReactNode;
        columns: KanbanColumn[];
        color?: string;
    };
    allowCardReordering: boolean;
    dragOverInfo?: {
        columnId: string;
        cardId?: string;
        position?: 'before' | 'after';
    } | null;
    defaultHeight?: number;
    collapsible?: boolean;
    showBoardStats?: boolean;
    showColumnStats?: boolean;
}

function DraggableCard({ card, isDragging }: DraggableCardProps): ReactElement {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        active
    } = useSortable({
        id: card.id,
        data: {
            type: "card",
            card
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1
    };

    const isBeingDragged = active?.id === card.id;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`kanban-card ${isBeingDragged ? 'dragging' : ''} ${card.isUsingCache ? 'kanban-card-cached' : ''}`}
            data-card-id={card.id}
        >
            <div className="kanban-card-content">
                {card.content || (
                    <div className="kanban-card-fallback">
                        Card content not configured
                    </div>
                )}
            </div>
        </div>
    );
}

function DroppableColumn({ 
    column, 
    boardId, 
    allowCardReordering, 
    children, 
    dragOverInfo,
    showColumnStats = true 
}: DroppableColumnProps): ReactElement {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
        data: {
            type: "column",
            column,
            boardId
        },
        disabled: column.cards.length > 0
    });

    const cardIds = column.cards.map(card => card.id);
    const isDropTarget = dragOverInfo?.columnId === column.id;
    const dropPosition = dragOverInfo?.position;
    const dropCardId = dragOverInfo?.cardId;

    return (
        <div className="kanban-column" data-column-id={column.id}>
            <div className="kanban-column-header">
                <div className="kanban-column-title">{column.title}</div>
                {showColumnStats && (
                    <span className="kanban-card-count">{column.cards.length}</span>
                )}
            </div>
            <div 
                ref={setNodeRef}
                className={`kanban-column-content ${isOver ? 'drag-over' : ''} ${isDropTarget ? 'cross-column-drop-target' : ''}`}
                data-column-drop-zone={column.id}
            >
                {allowCardReordering ? (
                    <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                        {column.cards.map((card) => {
                            const showDropIndicatorBefore = isDropTarget && dropCardId === card.id && dropPosition === 'before';
                            const showDropIndicatorAfter = isDropTarget && dropCardId === card.id && dropPosition === 'after';
                            return (
                                <div key={card.key || card.id}>
                                    {showDropIndicatorBefore && (
                                        <div className="drop-indicator drop-indicator-before">
                                            <div className="drop-line"></div>
                                        </div>
                                    )}
                                    <DraggableCard card={card} />
                                    {showDropIndicatorAfter && (
                                        <div className="drop-indicator drop-indicator-after">
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
            </div>
        </div>
    );
}

function BoardContainer({ 
    board, 
    allowCardReordering, 
    dragOverInfo, 
    defaultHeight, 
    collapsible = true,
    showBoardStats = true,
    showColumnStats = true 
}: BoardContainerProps): ReactElement {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Calculate card count for board stats
    const cardCount = showBoardStats ? board.columns.reduce((total, column) => total + column.cards.length, 0) : 0;

    // Apply board background color using CSS custom property and determine text color
    const boardStyle: React.CSSProperties = board.color ? { 
        '--board-bg-color': board.color,
        '--board-text-color': getContrastTextColor(board.color)
    } as React.CSSProperties : {};

    return (
        <div 
            className={`kanban-board-container ${isCollapsed ? 'collapsed' : ''}`}
            style={boardStyle}
            data-kanban-board-id={board.id}
        >
            <div className="kanban-board-header">
                <div className="kanban-board-title-wrapper">
                    <div className="kanban-board-title-row">
                        {collapsible && (
                            <button 
                                className={`kanban-board-collapse-btn ${isCollapsed ? 'collapsed' : ''}`}
                                onClick={toggleCollapse}
                                title={isCollapsed ? 'Expand board' : 'Collapse board'}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8 4l4 4H4l4-4z"/>
                                </svg>
                            </button>
                        )}
                        <div className="kanban-board-title">{board.title}</div>
                    </div>
                    {showBoardStats && (
                        <div className="kanban-board-stats">
                            <span className="kanban-board-column-count">{board.columns.length} columns</span>
                            <span className="kanban-board-card-count">{cardCount} cards</span>
                        </div>
                    )}
                </div>
            </div>
            
            <div className={`kanban-board-content ${isCollapsed ? 'collapsed' : ''}`}>
                <div 
                    className="kanban-board"
                    style={{ 
                        height: `${defaultHeight || 400}px`,
                        minHeight: '150px',
                        maxHeight: `${defaultHeight || 400}px`
                    }}
                >
                    {board.columns.map((column) => (
                        <DroppableColumn 
                            key={column.id} 
                            column={column} 
                            boardId={board.id}
                            allowCardReordering={allowCardReordering}
                            dragOverInfo={dragOverInfo}
                            showColumnStats={showColumnStats}
                        >
                            {column.cards.map((card) => (
                                <DraggableCard
                                    key={card.key || card.id}
                                    card={card}
                                />
                            ))}
                        </DroppableColumn>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function MultiBoardDragDrop({ 
    boards, 
    onCardDrop, 
    allowCardReordering = true, 
    defaultBoardHeight = 400,
    collapsible = true,
    showBoardStats = true,
    showColumnStats = true
}: MultiBoardDragDropProps): ReactElement {
    const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);
    const [dragOverInfo, setDragOverInfo] = useState<{
        columnId: string;
        cardId?: string;
        position?: 'before' | 'after';
    } | null>(null);

    // Enhanced error suppression specifically for drag operations
    useEffect(() => {
        const originalError = console.error;
        let errorSuppressionTimeout: NodeJS.Timeout | null = null;

        const suppressError = (...args: any[]) => {
            const message = args[0]?.toString?.() || '';
            if (message.includes('ResizeObserver loop completed with undelivered notifications') ||
                message.includes('ResizeObserver loop limit exceeded')) {
                // Suppress ResizeObserver errors completely during drag operations
                return;
            }
            originalError.apply(console, args);
        };

        // Override console.error during component lifecycle
        console.error = suppressError;

        return () => {
            console.error = originalError;
            if (errorSuppressionTimeout) {
                clearTimeout(errorSuppressionTimeout);
            }
        };
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Build helpers to know which board/column an id belongs to.
    const cardIndex = new Map<string, { boardId: string; columnId: string }>();
    const columnIndex = new Map<string, { boardId: string }>();
    boards.forEach(board => {
        board.columns.forEach(column => {
            columnIndex.set(column.id, { boardId: board.id });
            column.cards.forEach(card => {
                cardIndex.set(card.id, { boardId: board.id, columnId: column.id });
            });
        });
    });

    // Prefer the droppable directly under the pointer. When several rects
    // contain the pointer (e.g. column rect bleed across boards), pick the
    // one whose center is closest to the pointer — that's the innermost /
    // most specific target. Only fall back to closestCenter when the pointer
    // is over a true gap with nothing underneath.
    const collisionDetection: CollisionDetection = (args) => {
        const pointer = args.pointerCoordinates;

        // Filter helper: keep only candidates whose owning board container's
        // bounding rect actually contains the pointer. This neutralises rect
        // "bleed" caused by overflow: auto in another board's column making
        // off-screen card rects geometrically overlap a different board.
        const isInsideOwningBoard = (id: unknown): boolean => {
            if (!pointer) return true;
            const key = String(id);
            const meta = cardIndex.get(key) ?? columnIndex.get(key);
            if (!meta) return true;
            const boardId = (meta as { boardId: string }).boardId;
            // Escape characters that would break the attribute selector.
            const escaped = boardId.replace(/(["\\])/g, "\\$1");
            const el = document.querySelector(`[data-kanban-board-id="${escaped}"]`);
            if (!el) return true;
            const r = el.getBoundingClientRect();
            return pointer.x >= r.left && pointer.x <= r.right && pointer.y >= r.top && pointer.y <= r.bottom;
        };

        const pointerCollisions = pointerWithin(args).filter(c => isInsideOwningBoard(c.id));
        let used = pointerCollisions;

        if (pointerCollisions.length > 1) {
            const { x, y } = pointer ?? { x: 0, y: 0 };
            const ranked = [...pointerCollisions].sort((a, b) => {
                const ra: any = a.data?.droppableContainer?.rect?.current;
                const rb: any = b.data?.droppableContainer?.rect?.current;
                const da = ra ? Math.hypot((ra.left + ra.width / 2) - x, (ra.top + ra.height / 2) - y) : Number.POSITIVE_INFINITY;
                const db = rb ? Math.hypot((rb.left + rb.width / 2) - x, (rb.top + rb.height / 2) - y) : Number.POSITIVE_INFINITY;
                return da - db;
            });
            used = ranked;
        } else if (pointerCollisions.length === 0) {
            used = closestCenter(args).filter(c => isInsideOwningBoard(c.id));
        }
        return used;
    };

    const getCardDropPosition = (active: Active, over: Over): 'before' | 'after' => {
        const translatedRect = active.rect.current.translated;

        if (!translatedRect) {
            return 'after';
        }

        const activeCenterY = translatedRect.top + translatedRect.height / 2;
        const overCenterY = over.rect.top + over.rect.height / 2;

        return activeCenterY < overCenterY ? 'before' : 'after';
    };

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        
        // Suppress ResizeObserver errors during drag operations
        const originalError = console.error;
        console.error = (...args: any[]) => {
            const message = args[0]?.toString?.() || '';
            if (message.includes('ResizeObserver')) return;
            originalError.apply(console, args);
        };
        
        if (active.data.current?.type === "card") {
            // Defer state update to prevent ResizeObserver loops
            requestAnimationFrame(() => {
                setActiveCard(active.data.current?.card || null);
            });
        }
        setDragOverInfo(null);
        
        // Restore error handling after a brief delay
        setTimeout(() => {
            console.error = originalError;
        }, 100);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        
        // Suppress ResizeObserver errors during drop operations
        const originalError = console.error;
        console.error = (...args: any[]) => {
            const message = args[0]?.toString?.() || '';
            if (message.includes('ResizeObserver')) return;
            originalError.apply(console, args);
        };
        
        // Defer state updates to prevent ResizeObserver loops
        requestAnimationFrame(() => {
            setActiveCard(null);
            setDragOverInfo(null);
        });
        
        if (!over || !active.data.current?.card) {
            // Restore error handling
            setTimeout(() => {
                console.error = originalError;
            }, 200);
            return;
        }
        
        const draggedCard = active.data.current.card;
        const draggedCardId = draggedCard.id;
        
        // Find source column
        let sourceColumnId = "";
        for (const board of boards) {
            for (const column of board.columns) {
                if (column.cards.some(card => card.id === draggedCardId)) {
                    sourceColumnId = column.id;
                    break;
                }
            }
            if (sourceColumnId) break;
        }
        
        // Determine target based on what we're over
        let targetColumnId = "";
        let newIndex: number | undefined;
        
        if (over.data.current?.type === "column") {
            // Dropped on column container (often when near edges) - place at end
            targetColumnId = over.id as string;
            const targetColumn = boards
                .flatMap(board => board.columns)
                .find(column => column.id === targetColumnId);

            // Column-container drops are only allowed for empty columns
            if (targetColumn && targetColumn.cards.length > 0) {
                setTimeout(() => {
                    console.error = originalError;
                }, 200);
                return;
            }

            newIndex = targetColumn ? targetColumn.cards.length : undefined;
        } else if (over.data.current?.type === "card") {
            // Dropped on another card - find the column and calculate proper position
            const targetCard = over.data.current.card;

            if (targetCard.id === draggedCardId) {
                targetColumnId = sourceColumnId;
            } else {
            
                // Find which column contains the target card
                for (const board of boards) {
                    for (const column of board.columns) {
                        const cardIndex = column.cards.findIndex(card => card.id === targetCard.id);
                        if (cardIndex !== -1) {
                            targetColumnId = column.id;
                            const dropPosition = getCardDropPosition(active, over);
                            newIndex = cardIndex + (dropPosition === 'after' ? 1 : 0);
                            break;
                        }
                    }
                    if (targetColumnId) break;
                }
            }
        }
        
        // Only proceed if we have valid source and target
        if (sourceColumnId && targetColumnId) {
            if (sourceColumnId !== targetColumnId) {
                // Cross-board/column drag
                onCardDrop(draggedCardId, sourceColumnId, targetColumnId, newIndex);
            } else if (newIndex !== undefined) {
                // Reordering within the same column - only proceed if index changed
                const sourceColumn = boards
                    .flatMap(board => board.columns)
                    .find(col => col.id === sourceColumnId);
                
                const currentIndex = sourceColumn?.cards.findIndex(card => card.id === draggedCardId) ?? -1;
                
                if (currentIndex !== -1 && currentIndex !== newIndex) {
                    onCardDrop(draggedCardId, sourceColumnId, targetColumnId, newIndex);
                }
            }
        }
        
        // Restore error handling after drop operation
        setTimeout(() => {
            console.error = originalError;
        }, 200);
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;

        if (!over || !active.data.current?.card) {
            setDragOverInfo(null);
            return;
        }

        // Find source column for the dragged card
        const draggedCard = active.data.current.card;
        let sourceColumnId = "";
        for (const board of boards) {
            for (const column of board.columns) {
                if (column.cards.some(card => card.id === draggedCard.id)) {
                    sourceColumnId = column.id;
                    break;
                }
            }
            if (sourceColumnId) break;
        }

        if (over.data.current?.type === "column") {
            // Hovering over a column
            const targetColumnId = over.id as string;
            if (sourceColumnId !== targetColumnId) {
                setDragOverInfo({
                    columnId: targetColumnId
                });
            } else {
                setDragOverInfo(null);
            }
        } else if (over.data.current?.type === "card") {
            // Hovering over a card
            const targetCard = over.data.current.card;
            const dropPosition = getCardDropPosition(active, over);
            
            // Find which column contains the target card
            let foundTarget = false;
            for (const board of boards) {
                for (const column of board.columns) {
                    if (column.cards.some(card => card.id === targetCard.id)) {
                        if (draggedCard.id !== targetCard.id) {
                            setDragOverInfo({
                                columnId: column.id,
                                cardId: targetCard.id,
                                position: dropPosition
                            });
                        } else {
                            setDragOverInfo(null);
                        }
                        foundTarget = true;
                        break;
                    }
                }
                if (foundTarget) break;
            }
            if (!foundTarget) {
                setDragOverInfo(null);
            }
        } else {
            setDragOverInfo(null);
        }
    }

    return (
        <div className="kanban-error-boundary">
            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetection}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
            >
                {/* NOTE: Do not wrap all boards in a single SortableContext.
                    Each column has its own SortableContext for intra-column
                    reordering. A global vertical sortable across all boards
                    causes cards in other boards' columns to shift/animate
                    during a drag. */}
                <div className="kanban-multi-board">
                    {boards.map((board) => (
                        <BoardContainer 
                            key={board.id} 
                            board={board} 
                            allowCardReordering={allowCardReordering}
                            dragOverInfo={dragOverInfo}
                            defaultHeight={defaultBoardHeight}
                            collapsible={collapsible}
                            showBoardStats={showBoardStats}
                            showColumnStats={showColumnStats}
                        />
                    ))}
                </div>
            
            <DragOverlay>
                {activeCard ? (
                    <div className="kanban-card dragging">
                        <div className="kanban-card-content">
                            {activeCard.content || (
                                <div className="kanban-card-fallback">
                                    Card content not configured
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
        </div>
    );
}
