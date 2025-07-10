import { KanbanPreviewProps } from "../typings/KanbanProps";
import { hidePropertiesIn } from "@mendix/pluggable-widgets-tools";
export type Platform = "web" | "desktop";

export type Properties = PropertyGroup[];

type PropertyGroup = {
    caption: string;
    propertyGroups?: PropertyGroup[];
    properties?: Property[];
};

type Property = {
    key: string;
    caption: string;
    description?: string;
    objectHeaders?: string[]; // used for customizing object grids
    objects?: ObjectProperties[];
    properties?: Properties[];
};

type ObjectProperties = {
    properties: PropertyGroup[];
    captions?: string[]; // used for customizing object grids
};

export type Problem = {
    property?: string; // key of the property, at which the problem exists
    severity?: "error" | "warning" | "deprecation"; // default = "error"
    message: string; // description of the problem
    studioMessage?: string; // studio-specific message, defaults to message
    url?: string; // link with more information about the problem
    studioUrl?: string; // studio-specific link
};

type BaseProps = {
    type: "Image" | "Container" | "RowLayout" | "Text" | "DropZone" | "Selectable" | "Datasource";
    grow?: number; // optionally sets a growth factor if used in a layout (default = 1)
};

type ImageProps = BaseProps & {
    type: "Image";
    document?: string; // svg image
    data?: string; // base64 image
    property?: object; // widget image property object from Values API
    width?: number; // sets a fixed maximum width
    height?: number; // sets a fixed maximum height
};

type ContainerProps = BaseProps & {
    type: "Container" | "RowLayout";
    children: PreviewProps[]; // any other preview element
    borders?: boolean; // sets borders around the layout to visually group its children
    borderRadius?: number; // integer. Can be used to create rounded borders
    backgroundColor?: string; // HTML color, formatted #RRGGBB
    borderWidth?: number; // sets the border width
    padding?: number; // integer. adds padding around the container
};

type RowLayoutProps = ContainerProps & {
    type: "RowLayout";
    columnSize?: "fixed" | "grow"; // default is fixed
};

type TextProps = BaseProps & {
    type: "Text";
    content: string; // text that should be shown
    fontSize?: number; // sets the font size
    fontColor?: string; // HTML color, formatted #RRGGBB
    bold?: boolean;
    italic?: boolean;
};

type DropZoneProps = BaseProps & {
    type: "DropZone";
    property: object; // widgets property object from Values API
    placeholder: string; // text to be shown inside the dropzone when empty
    showDataSourceHeader?: boolean; // true by default. Toggles whether to show a header containing information about the datasource
};

type SelectableProps = BaseProps & {
    type: "Selectable";
    object: object; // object property instance from the Value API
    child: PreviewProps; // any type of preview property to visualize the object instance
};

type DatasourceProps = BaseProps & {
    type: "Datasource";
    property: object | null; // datasource property object from Values API
    child?: PreviewProps; // any type of preview property component (optional)
};

export type PreviewProps =
    | ImageProps
    | ContainerProps
    | RowLayoutProps
    | TextProps
    | DropZoneProps
    | SelectableProps
    | DatasourceProps;

export function getProperties(
    values: KanbanPreviewProps,
    defaultProperties: Properties /* , target: Platform*/
): Properties {
    // Do the values manipulation here to control the visibility of properties in Studio and Studio Pro conditionally.
    
    if (values.typeOfBoard === "single") {
        hidePropertiesIn(defaultProperties, values, [
            "m_board_content",
            "m_column_content",
            "m_content"])
    }
    else{
        hidePropertiesIn(defaultProperties, values, [
            "s_column_content",
            "s_content"]);
    }
    return defaultProperties;
}

export function check(values: KanbanPreviewProps): Problem[] {
    const errors: Problem[] = [];
    
    // Validate required global properties
    if (!values.changeJSON) {
        errors.push({
            property: "changeJSON",
            message: "Change JSON attribute is required for tracking card movements."
        });
    }
    
    if (!values.sortOrderJSON) {
        errors.push({
            property: "sortOrderJSON",
            message: "Sort Order JSON attribute is required for tracking column order."
        });
    }
    
    // Validate based on board type
    if (values.typeOfBoard === "single") {
        // Single board validation
        if (!values.s_data_columns) {
            errors.push({
                property: "s_data_columns",
                message: "Columns datasource is required for single board mode."
            });
        }
        
        if (!values.s_column_id) {
            errors.push({
                property: "s_column_id",
                message: "Column ID attribute is required for single board mode."
            });
        }
        
        if (!values.s_data_cards) {
            errors.push({
                property: "s_data_cards",
                message: "Cards datasource is required for single board mode."
            });
        }
        
        if (!values.s_card_id) {
            errors.push({
                property: "s_card_id",
                message: "Card ID attribute is required for single board mode."
            });
        }
        
        if (!values.s_card_parent) {
            errors.push({
                property: "s_card_parent",
                message: "Parent column ID attribute is required for single board mode to link cards to columns."
            });
        }
        
        if (!values.s_content) {
            errors.push({
                property: "s_content",
                message: "Card content widget is required for single board mode to display card content."
            });
        }
        
    } else if (values.typeOfBoard === "multi") {
        // Multi board validation
        if (!values.m_data_boards) {
            errors.push({
                property: "m_data_boards",
                message: "Boards datasource is required for multi board mode."
            });
        }
        
        if (!values.m_board_id) {
            errors.push({
                property: "m_board_id",
                message: "Board ID attribute is required for multi board mode."
            });
        }
        
        if (!values.m_data_columns) {
            errors.push({
                property: "m_data_columns",
                message: "Columns datasource is required for multi board mode."
            });
        }
        
        if (!values.m_column_id) {
            errors.push({
                property: "m_column_id",
                message: "Column ID attribute is required for multi board mode."
            });
        }
        
        if (!values.m_column_parent) {
            errors.push({
                property: "m_column_parent",
                message: "Parent board ID attribute is required for multi board mode to link columns to boards."
            });
        }
        
        if (!values.m_data_cards) {
            errors.push({
                property: "m_data_cards",
                message: "Cards datasource is required for multi board mode."
            });
        }
        
        if (!values.m_card_id) {
            errors.push({
                property: "m_card_id",
                message: "Card ID attribute is required for multi board mode."
            });
        }
        
        if (!values.m_card_parent) {
            errors.push({
                property: "m_card_parent",
                message: "Parent column ID attribute is required for multi board mode to link cards to columns."
            });
        }
        
        if (!values.m_content) {
            errors.push({
                property: "m_content",
                message: "Card content widget is required for multi board mode to display card content."
            });
        }
    }
    
    // Optional but recommended validations
    if (values.typeOfBoard === "single" && !values.onCardDrop) {
        errors.push({
            property: "onCardDrop",
            severity: "warning",
            message: "On card drop action is recommended to handle card movement events."
        });
    }
    
    if (values.typeOfBoard === "multi" && !values.onCardDrop) {
        errors.push({
            property: "onCardDrop",
            severity: "warning",
            message: "On card drop action is recommended to handle card movement events."
        });
    }
    
    // Additional helpful validations for better user experience
    if (values.typeOfBoard === "single") {
        // Check if datasources are properly linked
        if (values.s_data_columns && !values.s_column_id) {
            errors.push({
                property: "s_column_id",
                severity: "warning",
                message: "Column ID attribute should be configured when columns datasource is set."
            });
        }
        
        if (values.s_data_cards && !values.s_card_id) {
            errors.push({
                property: "s_card_id",
                severity: "warning", 
                message: "Card ID attribute should be configured when cards datasource is set."
            });
        }
        
        // Check for content configuration
        if (values.s_data_cards && !values.s_content && !values.s_column_content) {
            errors.push({
                property: "s_content",
                severity: "warning",
                message: "Consider configuring card content or column content to display meaningful information."
            });
        }
    }
    
    if (values.typeOfBoard === "multi") {
        // Check if datasources are properly linked for multi board
        if (values.m_data_boards && !values.m_board_id) {
            errors.push({
                property: "m_board_id",
                severity: "warning",
                message: "Board ID attribute should be configured when boards datasource is set."
            });
        }
        
        if (values.m_data_columns && !values.m_column_id) {
            errors.push({
                property: "m_column_id", 
                severity: "warning",
                message: "Column ID attribute should be configured when columns datasource is set."
            });
        }
        
        if (values.m_data_cards && !values.m_card_id) {
            errors.push({
                property: "m_card_id",
                severity: "warning",
                message: "Card ID attribute should be configured when cards datasource is set."
            });
        }
        
        // Check for relationship attributes
        if (values.m_data_columns && values.m_data_boards && !values.m_column_parent) {
            errors.push({
                property: "m_column_parent",
                message: "Column parent board ID is required to link columns to their respective boards."
            });
        }
        
        if (values.m_data_cards && values.m_data_columns && !values.m_card_parent) {
            errors.push({
                property: "m_card_parent",
                message: "Card parent column ID is required to link cards to their respective columns."
            });
        }
        
        // Check for content configuration
        if (values.m_data_cards && !values.m_content && !values.m_column_content && !values.m_board_content) {
            errors.push({
                property: "m_content",
                severity: "warning",
                message: "Consider configuring content widgets to display meaningful information on boards, columns, or cards."
            });
        }
    }
    
    // Helpful warnings for sorting configuration
    if (values.typeOfBoard === "single") {
        if (values.s_data_columns && !values.s_column_sort) {
            errors.push({
                property: "s_column_sort",
                severity: "warning",
                message: "Column sort attribute is recommended for consistent column ordering."
            });
        }
        
        if (values.s_data_cards && !values.s_card_sort) {
            errors.push({
                property: "s_card_sort",
                severity: "warning",
                message: "Card sort attribute is recommended for consistent card ordering within columns."
            });
        }
    }
    
    if (values.typeOfBoard === "multi") {
        if (values.m_data_boards && !values.m_board_sort) {
            errors.push({
                property: "m_board_sort",
                severity: "warning",
                message: "Board sort attribute is recommended for consistent board ordering."
            });
        }
        
        if (values.m_data_columns && !values.m_column_sort) {
            errors.push({
                property: "m_column_sort",
                severity: "warning",
                message: "Column sort attribute is recommended for consistent column ordering within boards."
            });
        }
        
        if (values.m_data_cards && !values.m_card_sort) {
            errors.push({
                property: "m_card_sort",
                severity: "warning",
                message: "Card sort attribute is recommended for consistent card ordering within columns."
            });
        }
    }
    
    return errors;
}

// export function getPreview(values: KanbanPreviewProps, isDarkMode: boolean, version: number[]): PreviewProps {
//     // Customize your pluggable widget appearance for Studio Pro.
//     return {
//         type: "Container",
//         children: []
//     }
// }

// export function getCustomCaption(values: KanbanPreviewProps, platform: Platform): string {
//     return "Kanban";
// }
