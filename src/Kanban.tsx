import { ReactElement, createElement, useEffect } from "react";
import { KanbanContainerProps } from "../typings/KanbanProps";
import { SingleBoard } from "./components/SingleBoard";
import { MultiBoard } from "./components/MultiBoard";
import { enableResizeObserverSuppression, createResizeObserverErrorSuppressor } from "./utils/resizeObserverSuppress";

import "./ui/Kanban.css";

export function Kanban(props: KanbanContainerProps): ReactElement {
    const { typeOfBoard } = props;

    // Comprehensive ResizeObserver error suppression
    useEffect(() => {
        // Enable global error suppression
        const cleanup = enableResizeObserverSuppression();
        
        // Create and apply ResizeObserver wrapper
        const suppressor = createResizeObserverErrorSuppressor();
        if (suppressor) {
            suppressor.apply();
            
            return () => {
                suppressor.restore();
                if (cleanup) cleanup();
            };
        }
        
        return cleanup;
    }, []);

    return (
        <div className={`kanban-widget ${props.class}`} style={props.style}>
            {typeOfBoard === "single" ? (
                <SingleBoard {...props} />
            ) : (
                <MultiBoard {...props} />
            )}
        </div>
    );
}
