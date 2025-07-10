/**
 * Main Kanban Widget Component
 * 
 * This is the entry point for the Mendix Kanban widget that supports both
 * single and multi-board configurations with drag & drop functionality.
 */

import { ReactElement, createElement, useEffect } from "react";
import { KanbanContainerProps } from "../typings/KanbanProps";
import { SingleBoard } from "./components/SingleBoard";
import { MultiBoard } from "./components/MultiBoard";
import { enableResizeObserverSuppression, createResizeObserverErrorSuppressor } from "./utils/resizeObserverSuppress";

import "./ui/Kanban.css";

/**
 * Main Kanban component that renders either a single board or multi-board interface
 * based on the typeOfBoard configuration from Mendix Studio Pro
 */
export function Kanban(props: KanbanContainerProps): ReactElement {
    const { typeOfBoard } = props;

    // Comprehensive ResizeObserver error suppression to prevent console errors
    // that commonly occur with drag & drop libraries like @dnd-kit
    useEffect(() => {
        // Enable global error suppression for ResizeObserver loops
        const cleanup = enableResizeObserverSuppression();
        
        // Create and apply custom ResizeObserver wrapper to defer callbacks
        const suppressor = createResizeObserverErrorSuppressor();
        if (suppressor) {
            suppressor.apply();
            
            // Cleanup function to restore original implementations
            return () => {
                suppressor.restore();
                if (cleanup) cleanup();
            };
        }
        
        return cleanup;
    }, []);

    return (
        <div className={`kanban-widget ${props.class}`} style={props.style}>
            {/* Conditional rendering based on board type configuration */}
            {typeOfBoard === "single" ? (
                <SingleBoard {...props} />
            ) : (
                <MultiBoard {...props} />
            )}
        </div>
    );
}
