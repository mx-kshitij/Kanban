# Kanban Board Widget

A modern, feature-rich Kanban board widget for Mendix applications supporting both single and multiple boards with advanced drag & drop functionality.

## ✨ Features

- **🎯 Dual Mode Support**: Single board or multiple boards on the same page
- **🖱️ Advanced Drag & Drop**: Powered by @dnd-kit for smooth, accessible interactions
- **📱 Responsive Design**: Works seamlessly on desktop and mobile with touch support
- **♿ Accessibility**: Full keyboard navigation and screen reader support
- **🔧 Configurable Board Height**: Customizable via Mendix property with overflow handling
- **🎨 Modern UI**: Clean design with smooth animations and visual feedback
- **⚡ Performance Optimized**: Includes caching and error suppression for smooth operation
- **📋 Collapsible Boards**: Multi-board mode supports collapsible board headers
- **🔄 Optimistic Updates**: Instant UI feedback with proper error handling
- **🎪 Rich Content**: Use any Mendix widgets within cards for complex displays

## 🚀 Recent Enhancements

### ResizeObserver Error Suppression
- **Comprehensive Error Handling**: Multi-layered suppression of ResizeObserver loop errors
- **Global Error Management**: Window-level error handling for drag operations
- **Deferred Callbacks**: Custom ResizeObserver wrapper to prevent measurement loops
- **Performance Optimized**: RequestAnimationFrame for smooth state updates

### Improved Board Headers
- **Intuitive Layout**: Collapse toggle positioned inline with board titles
- **Enhanced UX**: Better visual hierarchy and responsive controls
- **Consistent Styling**: Optimized CSS for cross-browser compatibility

### Height Management
- **Configurable Heights**: Board height property with consistent min/max values
- **Overflow Handling**: Proper scrolling and content management
- **Responsive Sizing**: Adapts to different screen sizes and content

## ⚙️ Configuration

### General Settings

| Property | Type | Description |
|----------|------|-------------|
| **Type of Board** | Enumeration | Single or Multi board layout |
| **Board Height** | Integer | Height of boards in pixels (default: 350px) |
| **Change JSON** | String Attribute | Stores drag & drop change information |
| **Sort Order JSON** | String Attribute | Stores column reordering information |

### Single Board Configuration

Perfect for focused workflows with all columns visible:

#### 📊 Columns
- **Columns Data Source**: List of column entities
- **Column ID**: Unique identifier for each column  
- **Sort By**: Integer for column ordering

#### 🃏 Cards
- **Cards Data Source**: List of card entities
- **Card ID**: Unique identifier for each card
- **Parent Column ID**: Reference to containing column
- **Sort By**: Integer for card ordering within columns

#### 🎨 Content
- **Column Content**: Mendix widgets for column headers
- **Card Content**: Mendix widgets for card display

### Multiple Board Configuration

Ideal for complex projects with multiple workstreams:

#### 📋 Boards
- **Boards Data Source**: List of board entities
- **Board ID**: Unique identifier for each board
- **Sort By**: Integer for board ordering

#### 📊 Columns  
- **Columns Data Source**: List of column entities
- **Column ID**: Unique identifier for each column
- **Parent Board ID**: Reference to containing board
- **Sort By**: Integer for column ordering

#### 🃏 Cards
- **Cards Data Source**: List of card entities  
- **Card ID**: Unique identifier for each card
- **Parent Column ID**: Reference to containing column
- **Sort By**: Integer for card ordering

#### 🎨 Content
- **Board Content**: Mendix widgets for board headers
- **Column Content**: Mendix widgets for column headers  
- **Card Content**: Mendix widgets for card display
- **Parent Board ID**: Reference to the board this column belongs to

#### Cards
- **Cards Data Source**: List of card entities
- **Card ID**: Unique identifier for each card
- **Parent Column ID**: Reference to the column this card belongs to

#### Content
- **Multi Board Content**: Mendix widgets to display within each card

## 🗃️ Data Model Requirements

### Single Board Mode

#### Column Entity
```
ColumnID (String): Unique identifier
Title (String): Display name for the column  
Order (Integer): Sort order for column positioning
Status (String, optional): Column status/color
```

#### Card Entity  
```
CardID (String): Unique identifier
ParentColumnID (String): Foreign key to column
Title (String): Card title/summary
Description (String, optional): Detailed description
Order (Integer): Sort order within column
Priority (String, optional): Card priority level
Assignee (String, optional): Assigned user
DueDate (DateTime, optional): Due date for task
```

### Multiple Board Mode

#### Board Entity
```
BoardID (String): Unique identifier
Title (String): Board name/title
Description (String, optional): Board description  
Order (Integer): Sort order for board positioning
Status (String, optional): Board status (active/archived)
Owner (String, optional): Board owner/manager
```

#### Column Entity
```
ColumnID (String): Unique identifier
ParentBoardID (String): Foreign key to board
Title (String): Column display name
Order (Integer): Sort order within board
WIPLimit (Integer, optional): Work-in-progress limit
```

#### Card Entity
```
CardID (String): Unique identifier  
ParentColumnID (String): Foreign key to column
Title (String): Card title/summary
Description (String, optional): Detailed description
Order (Integer): Sort order within column
Priority (String, optional): Card priority level
Assignee (String, optional): Assigned user
DueDate (DateTime, optional): Due date for task
Tags (String, optional): Comma-separated tags
```

## 🛠️ Implementation Guide

### Quick Start

1. **Create Domain Model**
   - Define your Column and Card entities with required attributes
   - Establish proper associations (Card → Column, Column → Board if multi-board)

2. **Configure Data Sources**
   - Create microflows to retrieve columns and cards
   - Ensure proper sorting by Order attributes

3. **Widget Configuration**  
   - Add Kanban widget to your page
   - Select Single or Multi board mode
   - Map data sources and attributes
   - Configure content widgets for display

4. **Event Handling**
   - Create on-drop action microflow
   - Parse changeJSON for card movement data
   - Update your domain model accordingly

### Advanced Features

#### 🔧 Custom Styling
```css
/* Override default styles */
.kanban-widget {
    --kanban-primary-color: #your-color;
    --kanban-background: #your-background;
}

.kanban-card {
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

#### ⚡ Performance Tips
- Use entity access for security without performance impact  
- Implement proper indexing on ID and Order attributes
- Consider pagination for large card sets
- Use caching where appropriate

#### 🔒 Security Considerations
- Configure entity access rules properly
- Validate user permissions in drop event handlers
- Sanitize user input in card content

## 📱 Responsive Behavior

The widget automatically adapts to different screen sizes:

- **Desktop (>1024px)**: Full board layout with all features
- **Tablet (768-1024px)**: Optimized spacing and touch targets  
- **Mobile (<768px)**: Stacked layout with horizontal scrolling

## 🎨 Customization

### Board Height
- Configurable via `boardHeight` property (default: 350px)
- Supports responsive scaling
- Automatic overflow handling with scrollbars

### Visual Themes  
- CSS custom properties for easy theming
- Support for light/dark modes
- Accessibility-compliant color contrasts

### Content Widgets
- Rich text editors
- Image displays  
- Progress bars
- Action buttons
- Custom icons and badges

## 🎯 Use Cases & Examples

### 📋 Project Management
```
Boards: Projects
Columns: Backlog → In Progress → Review → Done  
Cards: User stories, tasks, bugs
Features: Priority tags, assignee avatars, due dates
```

### 🛠️ Development Workflow  
```
Boards: Sprints or Teams
Columns: To Do → Doing → Code Review → Testing → Done
Cards: Development tasks, bug fixes, features
Features: Story points, branch links, pull request status
```

### 📈 Sales Pipeline
```
Boards: Sales regions or product lines
Columns: Lead → Qualified → Proposal → Negotiation → Closed
Cards: Sales opportunities, deals, prospects  
Features: Deal value, probability, contact info
```

### 🎓 Course Management
```
Boards: Courses or semesters
Columns: Not Started → In Progress → Under Review → Completed
Cards: Assignments, projects, assessments
Features: Due dates, grades, student progress
```

## 📡 Event Handling

### onCardDrop Event
Triggered when a card is moved between columns or reordered:

```javascript
// changeJSON contains:
{
  "cardId": "card_123",
  "sourceColumnId": "col_1", 
  "targetColumnId": "col_2",
  "newIndex": 3,
  "oldIndex": 1,
  "boardId": "board_1" // (multi-board only)
}
```

#### Example Microflow Handler
```
1. Parse changeJSON parameter
2. Retrieve card entity by cardId
3. Update card's ParentColumnID to targetColumnId  
4. Update card's Order to newIndex
5. Commit changes
6. Refresh data sources
```

### sortOrderJSON  
Contains column reordering information when columns are rearranged:

```javascript
{
  "boardId": "board_1", // (multi-board only)
  "columnOrder": ["col_1", "col_3", "col_2"]
}
```

## 🏗️ Architecture & Components

### Core Components

```
src/
├── Kanban.tsx                     # Main widget entry point
├── components/
│   ├── SingleBoard.tsx            # Single board implementation  
│   ├── MultiBoard.tsx             # Multi-board implementation
│   ├── AdvancedKanbanBoard.tsx    # Core board with drag & drop
│   ├── MultiBoardDragDrop.tsx     # Advanced multi-board DnD
│   └── shared/
│       ├── useCardCache.ts        # Performance caching hook
│       └── cardUtils.ts           # Card creation utilities
├── utils/
│   └── resizeObserverSuppress.ts  # Error suppression utilities
└── ui/
    └── Kanban.css                 # Comprehensive styling
```

### Key Technologies

- **🔧 @dnd-kit/core**: Modern drag and drop for React
- **📱 @dnd-kit/sortable**: Sortable presets and utilities  
- **🛠️ @dnd-kit/utilities**: Helper utilities for transforms
- **⚛️ React Hooks**: State management and performance optimization
- **🎨 CSS Grid/Flexbox**: Responsive layout system
- **♿ WCAG Compliance**: Full accessibility support

## 🔧 Development

### Building
```bash
npm install
npm run build
```

### Testing  
```bash
npm test
npm run lint
```

### Release
```bash
npm run release
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)  
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 **Documentation**: Complete widget documentation available
- 🐛 **Issues**: Report bugs via GitHub issues
- 💬 **Community**: Join the Mendix Community for discussions
- 📧 **Contact**: Reach out for enterprise support

---

**Made with ❤️ for the Mendix Community**

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
