# PRP-1752360009000-01: Eliminate Hardcoded Values

## Feature Overview

This PRP addresses the elimination of all hardcoded values throughout the Nerdboard application, including colors, magic numbers, and hardcoded strings. The goal is to create a more maintainable and consistent codebase by centralizing all configuration values and ensuring proper theme integration.

## User-Facing Description

Users will experience a more consistent visual design with better maintainability. The application will have improved visual consistency and easier customization capabilities through a centralized theme system.

## Functional Requirements

### 1. Theme System Consolidation
- Replace all hardcoded colors in `theme.ts` and `tailwind.config.js` with CSS variables
- Ensure all components use theme classes consistently
- Create a unified color palette system
- Implement proper color token management

### 2. Magic Number Elimination
- Extract all magic numbers to named constants
- Create utility files for common numerical values
- Replace hardcoded dimensions with theme-based values
- Implement responsive breakpoint constants

### 3. String Constant Management
- Move all hardcoded strings to constants files
- Create centralized message and label constants
- Implement proper internationalization structure
- Add type-safe string constants

### 4. Component Theme Integration
- Ensure all UI components use theme classes
- Replace inline styles with theme-based classes
- Implement consistent spacing and sizing
- Add proper color contrast validation

## Technical Requirements

### File Structure Changes
```
src/
├── constants/
│   ├── colors.ts          # Color constants and theme tokens
│   ├── dimensions.ts      # Size and spacing constants
│   ├── messages.ts        # User-facing message constants
│   └── breakpoints.ts     # Responsive breakpoint constants
├── theme/
│   ├── tokens.ts          # Design system tokens
│   └── variables.css      # CSS custom properties
```

### Implementation Details

#### 1. Color System Refactoring
```typescript
// src/constants/colors.ts
export const COLORS = {
  // Primary colors
  primary: {
    50: 'var(--color-primary-50)',
    100: 'var(--color-primary-100)',
    500: 'var(--color-primary-500)',
    900: 'var(--color-primary-900)',
  },
  // Semantic colors
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  // Background colors
  background: {
    primary: 'var(--color-background-primary)',
    secondary: 'var(--color-background-secondary)',
  },
  // Text colors
  text: {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    muted: 'var(--color-text-muted)',
  },
} as const;
```

#### 2. Dimension Constants
```typescript
// src/constants/dimensions.ts
export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
} as const;

export const SIZES = {
  tile: {
    minWidth: '300px',
    minHeight: '200px',
    maxWidth: '600px',
  },
  sidebar: {
    width: '280px',
    collapsedWidth: '60px',
  },
} as const;
```

#### 3. Message Constants
```typescript
// src/constants/messages.ts
export const MESSAGES = {
  loading: {
    cryptocurrency: 'Loading cryptocurrency data...',
    preciousMetals: 'Loading precious metals data...',
    general: 'Loading data...',
  },
  error: {
    network: 'Network error. Please check your connection.',
    api: 'Unable to fetch data. Please try again.',
    unknown: 'An unexpected error occurred.',
  },
  success: {
    dataLoaded: 'Data loaded successfully.',
  },
} as const;
```

#### 4. CSS Variables Implementation
```css
/* src/theme/variables.css */
:root {
  /* Primary colors */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;
  
  /* Semantic colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* Background colors */
  --color-background-primary: #ffffff;
  --color-background-secondary: #f8fafc;
  
  /* Text colors */
  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
}

[data-theme="dark"] {
  --color-background-primary: #1f2937;
  --color-background-secondary: #111827;
  --color-text-primary: #f9fafb;
  --color-text-secondary: #d1d5db;
  --color-text-muted: #9ca3af;
}
```

### Component Updates Required

#### 1. Update Theme Context
```typescript
// src/contexts/ThemeContext.tsx
import { COLORS } from '../constants/colors';

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  colors: COLORS,
});
```

#### 2. Update Tailwind Configuration
```javascript
// tailwind.config.js
const { COLORS, SPACING, SIZES } = require('./src/constants');

module.exports = {
  theme: {
    extend: {
      colors: COLORS,
      spacing: SPACING,
      minWidth: SIZES.tile.minWidth,
      minHeight: SIZES.tile.minHeight,
    },
  },
};
```

#### 3. Update Component Usage
```typescript
// Example: Update Button component
import { COLORS } from '../constants/colors';

const Button: React.FC<ButtonProps> = ({ variant = 'primary', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors';
  const variantClasses = {
    primary: `bg-[${COLORS.primary[500]}] text-white hover:bg-[${COLORS.primary[600]}]`,
    secondary: `bg-[${COLORS.background.secondary}] text-[${COLORS.text.primary}]`,
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]}`}
      {...props}
    />
  );
};
```

## Non-Functional Requirements

### Performance
- CSS variables should not impact render performance
- Theme switching should be smooth and responsive
- Bundle size should not increase significantly

### Maintainability
- All constants should be properly typed with TypeScript
- Constants should be organized logically by category
- Documentation should be comprehensive

### Accessibility
- Color contrast ratios should meet WCAG AA standards
- Theme changes should be properly announced to screen readers
- Focus indicators should work in both light and dark themes

## Testing Requirements

### Unit Tests
- Test all constant exports for proper typing
- Verify color contrast ratios meet accessibility standards
- Test theme switching functionality
- Validate CSS variable definitions

### Integration Tests
- Test component rendering with different themes
- Verify consistent styling across all components
- Test responsive breakpoint behavior

### Visual Regression Tests
- Compare component appearance before and after changes
- Verify theme switching works correctly
- Test across different screen sizes

## Code Examples

### Before (Hardcoded Values)
```typescript
// src/components/ui/Button.tsx
const Button = ({ children, ...props }) => (
  <button 
    className="px-4 py-2 bg-blue-500 text-white rounded-md"
    style={{ fontSize: '14px', fontWeight: '500' }}
    {...props}
  >
    {children}
  </button>
);
```

### After (Theme-Based)
```typescript
// src/components/ui/Button.tsx
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/dimensions';

const Button = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = `px-${SPACING.md} py-${SPACING.sm} rounded-md font-medium`;
  const variantClasses = {
    primary: `bg-[${COLORS.primary[500]}] text-white hover:bg-[${COLORS.primary[600]}]`,
    secondary: `bg-[${COLORS.background.secondary}] text-[${COLORS.text.primary}]`,
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
};
```

## Potential Risks

### Technical Risks
1. **Risk**: Theme consolidation might break existing functionality
   - **Mitigation**: Incremental changes with thorough testing
   - **Mitigation**: Maintain backward compatibility during transition

2. **Risk**: CSS variables might not be supported in all target browsers
   - **Mitigation**: Provide fallback values for older browsers
   - **Mitigation**: Test across different browser versions

3. **Risk**: Performance impact from CSS variable usage
   - **Mitigation**: Profile performance before and after changes
   - **Mitigation**: Optimize CSS variable usage patterns

### User Experience Risks
1. **Risk**: Visual appearance might change unexpectedly
   - **Mitigation**: Comprehensive visual regression testing
   - **Mitigation**: Gradual rollout with user feedback

2. **Risk**: Theme switching might cause layout shifts
   - **Mitigation**: Ensure consistent spacing and sizing
   - **Mitigation**: Test theme transitions thoroughly

## Accessibility Considerations

### Color and Contrast
- All color combinations must meet WCAG AA contrast ratios
- Provide high contrast mode support
- Ensure focus indicators are visible in all themes

### Screen Reader Support
- Theme changes should be announced to screen readers
- Color information should not be the only way to convey meaning
- Provide alternative text for color-coded information

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Focus indicators should work in both light and dark themes
- Tab order should be logical and consistent

## Success Criteria

### Code Quality
- [ ] No hardcoded colors in any component
- [ ] All magic numbers replaced with named constants
- [ ] All hardcoded strings moved to constants files
- [ ] Consistent theme usage throughout the application
- [ ] Proper TypeScript types for all constants

### Visual Consistency
- [ ] All components use theme classes consistently
- [ ] No visual regressions from current design
- [ ] Smooth theme switching without layout shifts
- [ ] Consistent spacing and sizing across components

### Performance
- [ ] No significant increase in bundle size
- [ ] Theme switching completes within 100ms
- [ ] No performance regression in component rendering

### Accessibility
- [ ] All color combinations meet WCAG AA standards
- [ ] Focus indicators work in both themes
- [ ] Screen reader announcements work correctly
- [ ] Keyboard navigation remains functional

## Implementation Checklist

- [ ] Create constants directory structure
- [ ] Implement color constants with CSS variables
- [ ] Create dimension and spacing constants
- [ ] Move all hardcoded strings to message constants
- [ ] Update theme context to use new constants
- [ ] Refactor all components to use theme-based classes
- [ ] Update Tailwind configuration
- [ ] Add comprehensive tests for all constants
- [ ] Verify accessibility compliance
- [ ] Test performance impact
- [ ] Update documentation
- [ ] Run full test suite
- [ ] Verify build process
- [ ] Check for linting issues 
