import { ReactElement, createElement } from "react";
import { KanbanContainerProps } from "../typings/KanbanProps";
import { SingleBoard } from "./components/SingleBoard";
import { MultiBoard } from "./components/MultiBoard";

import "./ui/Kanban.css";

export function Kanban(props: KanbanContainerProps): ReactElement {
    const { typeOfBoard } = props;

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
