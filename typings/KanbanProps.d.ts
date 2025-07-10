/**
 * This file was generated from Kanban.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ActionValue, EditableValue, ListValue, ListAttributeValue, ListWidgetValue } from "mendix";
import { Big } from "big.js";

export type TypeOfBoardEnum = "single" | "multi";

export interface KanbanContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    typeOfBoard: TypeOfBoardEnum;
    changeJSON: EditableValue<string>;
    sortOrderJSON: EditableValue<string>;
    boardHeight?: EditableValue<Big>;
    s_data_columns?: ListValue;
    s_column_id?: ListAttributeValue<string>;
    s_column_sort?: ListAttributeValue<Big>;
    s_data_cards?: ListValue;
    s_card_id?: ListAttributeValue<string>;
    s_card_parent?: ListAttributeValue<string>;
    s_card_sort?: ListAttributeValue<Big>;
    s_column_content?: ListWidgetValue;
    s_content?: ListWidgetValue;
    m_data_boards?: ListValue;
    m_board_id?: ListAttributeValue<string>;
    m_board_sort?: ListAttributeValue<Big>;
    m_data_columns?: ListValue;
    m_column_id?: ListAttributeValue<string>;
    m_column_parent?: ListAttributeValue<string>;
    m_column_sort?: ListAttributeValue<Big>;
    m_data_cards?: ListValue;
    m_card_id?: ListAttributeValue<string>;
    m_card_parent?: ListAttributeValue<string>;
    m_card_sort?: ListAttributeValue<Big>;
    m_board_content?: ListWidgetValue;
    m_column_content?: ListWidgetValue;
    m_content?: ListWidgetValue;
    onCardDrop?: ActionValue;
}

export interface KanbanPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode?: "design" | "xray" | "structure";
    typeOfBoard: TypeOfBoardEnum;
    changeJSON: string;
    sortOrderJSON: string;
    boardHeight: string;
    s_data_columns: {} | { caption: string } | { type: string } | null;
    s_column_id: string;
    s_column_sort: string;
    s_data_cards: {} | { caption: string } | { type: string } | null;
    s_card_id: string;
    s_card_parent: string;
    s_card_sort: string;
    s_column_content: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    s_content: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    m_data_boards: {} | { caption: string } | { type: string } | null;
    m_board_id: string;
    m_board_sort: string;
    m_data_columns: {} | { caption: string } | { type: string } | null;
    m_column_id: string;
    m_column_parent: string;
    m_column_sort: string;
    m_data_cards: {} | { caption: string } | { type: string } | null;
    m_card_id: string;
    m_card_parent: string;
    m_card_sort: string;
    m_board_content: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    m_column_content: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    m_content: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    onCardDrop: {} | null;
}
