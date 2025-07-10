import { ReactElement, createElement } from "react";
import { KanbanPreviewProps } from "../typings/KanbanProps";

export function preview({ typeOfBoard, class: className }: KanbanPreviewProps): ReactElement {
    return (
        <div className={`kanban-preview ${className}`}>
            <div className="kanban-preview-header">
                <h3>Kanban Board Preview</h3>
                <span className="kanban-preview-type">
                    Type: {typeOfBoard === "single" ? "Single Board" : "Multiple Boards"}
                </span>
            </div>
            <div className="kanban-preview-content">
                <div className="kanban-preview-column">
                    <div className="kanban-preview-column-header">To Do</div>
                    <div className="kanban-preview-card">Sample Card 1</div>
                    <div className="kanban-preview-card">Sample Card 2</div>
                </div>
                <div className="kanban-preview-column">
                    <div className="kanban-preview-column-header">In Progress</div>
                    <div className="kanban-preview-card">Sample Card 3</div>
                </div>
                <div className="kanban-preview-column">
                    <div className="kanban-preview-column-header">Done</div>
                    <div className="kanban-preview-card">Sample Card 4</div>
                </div>
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/Kanban.css");
}
