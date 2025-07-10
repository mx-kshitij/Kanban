# Kanban Board Widget

A flexible and feature-rich Kanban board widget for Mendix applications that supports both single and multiple boards on the same page.

## Features

- **Single Board Mode**: Display a single Kanban board with multiple columns
- **Multiple Board Mode**: Display multiple Kanban boards, each with their own columns
- **Advanced Drag & Drop**: Powered by @dnd-kit for smooth, accessible drag and drop functionality
- **Card Reordering**: Reorder cards within columns and move them between columns
- **Customizable Content**: Use Mendix widgets within cards for rich content display
- **Responsive Design**: Works on desktop and mobile devices with touch support
- **Accessibility**: Full keyboard navigation and screen reader support via @dnd-kit
- **Event Handling**: Execute actions when cards are moved or clicked
- **Modern UI**: Clean, professional styling with smooth animations and transitions

## Configuration

### General Settings

- **Type of Board**: Choose between "Single" or "Multi" board layout
- **Events**: Configure actions for card drop events

### Single Board Configuration

When using single board mode, configure:

#### Columns
- **Columns Data Source**: List of column entities
- **Column ID**: Unique identifier for each column

#### Cards
- **Cards Data Source**: List of card entities
- **Card ID**: Unique identifier for each card
- **Parent Column ID**: Reference to the column this card belongs to

#### Content
- **Single Board Content**: Mendix widgets to display within each card

### Multiple Board Configuration

When using multiple board mode, configure:

#### Boards
- **Boards Data Source**: List of board entities
- **Board ID**: Unique identifier for each board

#### Columns
- **Columns Data Source**: List of column entities
- **Column ID**: Unique identifier for each column
- **Parent Board ID**: Reference to the board this column belongs to

#### Cards
- **Cards Data Source**: List of card entities
- **Card ID**: Unique identifier for each card
- **Parent Column ID**: Reference to the column this card belongs to

#### Content
- **Multi Board Content**: Mendix widgets to display within each card

## Data Model Requirements

### For Single Board

#### Column Entity
- `ColumnID` (String): Unique identifier
- `Title` (String): Display name for the column
- `Order` (Integer, optional): Sort order

#### Card Entity
- `CardID` (String): Unique identifier
- `ParentColumnID` (String): Reference to column
- `Title` (String): Card title
- `Description` (String, optional): Card description
- `Order` (Integer, optional): Sort order within column

### For Multiple Boards

#### Board Entity
- `BoardID` (String): Unique identifier
- `Title` (String): Display name for the board
- `Order` (Integer, optional): Sort order

#### Column Entity
- `ColumnID` (String): Unique identifier
- `ParentBoardID` (String): Reference to board
- `Title` (String): Display name for the column
- `Order` (Integer, optional): Sort order

#### Card Entity
- `CardID` (String): Unique identifier
- `ParentColumnID` (String): Reference to column
- `Title` (String): Card title
- `Description` (String, optional): Card description
- `Order` (Integer, optional): Sort order within column

## Usage Examples

### Basic Single Board
1. Create Column and Card entities in your domain model
2. Set up data sources to retrieve columns and cards
3. Configure the widget to use single board mode
4. Map the column and card ID attributes
5. Design your card content using Mendix widgets

### Multiple Project Boards
1. Create Board, Column, and Card entities
2. Set up associations: Board -> Columns, Column -> Cards
3. Configure the widget to use multi board mode
4. Map all ID and parent ID attributes
5. Design your card content for project tasks

### Team Workflow Boards
1. Use enum for card status (To Do, In Progress, Done, etc.)
2. Set up columns for each status
3. Use microflows to update card status on drop events
4. Add user assignments and due dates to card content

## Events

### On Card Drop
Triggered when a card is moved between columns. Use this to:
- Update the card's column reference in the database
- Log activity for audit trails
- Send notifications to team members
- Trigger workflow processes

## Styling

The widget includes comprehensive CSS classes for customization:

- `.kanban-widget`: Main widget container
- `.kanban-board`: Individual board container
- `.kanban-column`: Column container
- `.kanban-card`: Individual card
- `.kanban-card-content`: Card content area

## Development and Contribution

### Prerequisites
- Node.js 16 or higher
- npm

### Setup
1. Install dependencies: `npm install`
2. Start development: `npm start`
3. Build for production: `npm run build`

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Drag & Drop**: @dnd-kit/core for modern, accessible interactions
- **Platform**: Mendix Pluggable Widget framework
- **Styling**: Modern CSS with smooth transitions and animations
- **Accessibility**: Full WCAG compliance via @dnd-kit

### Development Workflow
1. Make changes to the source files
2. The development server will automatically rebuild
3. Test in your Mendix project
4. Use `npm run lint` to check code quality
5. Use `npm run build` for production builds

## Browser Support

- Chrome (latest)
- Firefox (latest)  
- Safari (latest)
- Edge (latest)

## License

Apache 2.0 - see LICENSE file for details

## Support

For issues, feature requests, or contributions, please visit the project repository or contact the development team.

### File Structure
```
src/
├── Kanban.tsx                      # Main widget component
├── Kanban.xml                      # Widget configuration
├── components/
│   ├── SingleBoard.tsx             # Single board implementation
│   ├── MultiBoard.tsx              # Multiple boards implementation
│   └── AdvancedKanbanBoard.tsx     # Core board logic with @dnd-kit
└── ui/
    └── Kanban.css                  # Widget styles
```

### Dependencies

- **@dnd-kit/core**: Modern drag and drop for React
- **@dnd-kit/sortable**: Sortable presets and utilities  
- **@dnd-kit/utilities**: Helper utilities for @dnd-kit
- **classnames**: CSS class name utility
