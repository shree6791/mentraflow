# Modal System Guide

## Base Modal Architecture

We use a **base modal class system** to ensure consistency across all modals in the application.

## Core Components

### 1. Modal Overlay (`.modal-overlay`)
- Fixed fullscreen backdrop
- Semi-transparent black with blur effect
- Centers modal content
- z-index: 2000

### 2. Modal Content (`.modal-content`)
**Base Properties:**
- `max-width: 800px` (default)
- `width: 90%` (responsive)
- `max-height: 85vh` (prevents overflow)
- `display: flex` + `flex-direction: column` (for proper scrolling)
- `overflow: hidden` (controlled by child elements)
- Rounded corners, shadow, animation

### 3. Modal Header (`.modal-header`)
- Sticky positioning (stays at top when scrolling)
- Flex layout with space-between
- Contains title and close button
- `flex-shrink: 0` (won't compress)

### 4. Modal Body (`.modal-body`)
- `padding: 2rem` (consistent spacing)
- `overflow-y: auto` (scrollable content)
- `flex: 1` (takes remaining space)

## Modal Variants

All modals inherit from the base and only override what's necessary:

### FAB Capture Modal
```css
.fab-capture-modal {
  max-width: 650px; /* Slightly narrower */
}
```

### Library Detail Modal
```css
.library-detail-modal {
  /* Uses all base properties, no overrides */
}
```

### Quiz Customization Modal
```css
.quiz-custom-modal {
  max-width: 600px; /* Compact */
}
```

### Recall Quiz Modal
```css
.recall-quiz-modal {
  max-width: 700px; /* Medium */
}
```

### Priority Tasks Modal
```css
.priority-modal {
  max-width: 700px;
  max-height: 80vh; /* Shorter */
}
```

### Filter Modal
```css
.filter-modal {
  max-width: 500px; /* Most compact */
}
```

## Usage

### Creating a New Modal

1. **HTML Structure:**
```jsx
{showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal-content your-custom-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Your Modal Title</h2>
        <button className="modal-close" onClick={() => setShowModal(false)}>
          <X size={24} />
        </button>
      </div>
      
      <div className="modal-body">
        {/* Your content here */}
      </div>
    </div>
  </div>
)}
```

2. **CSS (only if you need custom sizing):**
```css
.your-custom-modal {
  max-width: 700px; /* Override base if needed */
  /* All other properties inherited */
}
```

## Benefits

✅ **Consistency** - All modals look and behave the same
✅ **Maintainability** - Update base class to affect all modals
✅ **Less Code** - No duplicate CSS
✅ **Fewer Bugs** - Reuse proven patterns
✅ **Responsive** - Base handles all breakpoints

## Testing

When adding a new modal:
1. Test on desktop (1920x1080)
2. Test on tablet (768px)
3. Test on mobile (375px)
4. Verify scrolling behavior
5. Check header sticky positioning
6. Confirm close button functionality

## Common Issues Fixed

- **Spacing inconsistencies** - Solved by base padding
- **Overflow problems** - Solved by flex + overflow structure
- **Header scrolling away** - Solved by sticky positioning
- **Mobile responsiveness** - Solved by base width: 90%
