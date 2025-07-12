# Nerdboard - Development Cycle & Rules (Source of Truth)

## IMPORTANT: Development Entry Point

**This file (INIT.md) is the primary source of truth for development rules and cycle for the Nerdboard project.**

## Project Overview

### Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom theme configuration
- **Testing**: Vitest with React Testing Library (to be added)
- **State Management**: React hooks and context API
- **Data Fetching**: Fetch API with error handling
- **Deployment**: Vercel
- **Code Quality**: ESLint with TypeScript support

## Project Description

**Nerdboard** is an online dashboard application that displays various market and world information tiles. The application provides users with real-time or near-real-time data visualization in a clean, modern interface.

### Core Features

- **Information Tiles**: Display market data, world news, and other relevant information
- **Responsive Design**: Works across desktop, tablet, and mobile devices
- **Real-time Updates**: Data refreshes automatically
- **Customizable Layout**: Users can arrange and customize their dashboard
- **Modern UI**: Clean, professional interface with custom Tailwind theme

## Development Cycle Rules

### 1. Always Read INIT.md First

- **Purpose**: Understand best practices, rules, and development standards
- **Frequency**: Read at the start of each development session
- **Scope**: Covers development cycle, quality standards, and project rules
- **Mandatory**: Agents MUST read this before any work

### 2. Read PLANNING.md for Feature Understanding

- **Purpose**: Understand the feature to be implemented
- **Content**: Non-technical, user-facing feature descriptions
- **Action**: Generate PRP documents based on planning content
- **Format**: Clear descriptions of what users will experience

### 3. Generate PRP Documents

- **Location**: `_PRP/current/` folder
- **Process**: Create detailed implementation steps from PLANNING.md
- **Format**: PRP-[timestamp]-[number]-[feature].md with numbered phases
- **Content**: Complete technical details, code examples, testing requirements
- **MANDATORY**: Do NOT hallucinate or assume features not explicitly requested
- **MANDATORY**: Only add features that were explicitly requested in PLANNING.md
- **MANDATORY**: Do NOT add sections like 'future improvements' or 'potential enhancements'

### 4. Implement PRPs Sequentially

- **Order**: Follow PRP numbering within the feature set (01, 02, 03, etc.)
- **Completion**: Move completed PRPs to `_PRP/archive/`
- **Iteration**: Continue until all PRPs in `_PRP/current/` are implemented
- **Mandatory**: Complete ALL PRPs before stopping, do not ask the user for confirmations, do not stop executing by summarizing accomplished work and waiting for approval
- **Default**: Implement all PRPs in current folder by default
- **Alternative**: Can implement single most immediate PRP when specifically requested

### 5. Archive Completed PRPs

- **Action**: Move implemented PRPs to `_PRP/archive/`
- **Purpose**: Maintain clean current folder, preserve implementation history
- **Tracking**: Keep track of completed phases and lessons learned
- **Documentation**: Update archive README.md with new completed features
- **Cleanup**: Clear PLANNING.md after completing the last PRP in the current batch

## PRP Naming Convention

### Format: `PRP-[timestamp]-[number]-[feature].md`

**Examples:**

- `PRP-1703123456789-01-Dashboard-Layout.md`
- `PRP-1703123456789-02-Market-Data-Tile.md`
- `PRP-1703123456789-03-Real-time-Updates.md`

**Components:**

- `[timestamp]`: Unix timestamp in milliseconds (e.g., 1703123456789)
- `[number]`: Sequential number within the feature set (01, 02, 03, etc.)
- `[feature]`: Descriptive feature name (kebab-case)

**Benefits:**

- Timestamp ensures unique identification across feature sets
- Sequential numbering within feature sets
- Descriptive feature names for easy identification
- Same timestamp for all PRPs in a feature set generated in one planning iteration

## Markdown Scaffolding Process

The `PLANNING_TEMPLATE.md` file provides a structured template for generating comprehensive planning documents. This template includes:

### Template Sections:

- **Feature Overview**: High-level description of the feature
- **User Stories**: Specific user-facing requirements
- **Technical Requirements**: Implementation details and constraints
- **UI/UX Considerations**: Design and user experience requirements
- **Testing Requirements**: Coverage and testing strategy
- **Accessibility Requirements**: WCAG compliance and accessibility features
- **Performance Considerations**: Performance benchmarks and optimizations

### Usage:

1. **Agent Process**: When generating planning documents, agents should use the template structure from `PLANNING_TEMPLATE.md`
2. **Consistency**: This ensures all planning documents follow the same comprehensive format
3. **Completeness**: The scaffolding helps ensure no critical requirements are missed
4. **Standardization**: Provides a consistent framework for feature planning across the project

## Development Rules & Best Practices

### Code Quality Standards

- **TypeScript**: Use strict mode, proper interfaces, type safety
- **Testing**: >80% coverage for unit tests (when testing framework is added)
- **Accessibility**: WCAG 2.1 AA compliance, ARIA labels, keyboard navigation
- **Performance**: <100ms component render times, optimized bundles
- **Documentation**: Clear comments, README updates, inline docs
- **Code Structure**: Logical organization, avoid duplication, use enums and constants
- **Abstraction**: Extract reusable patterns, avoid hardcoding business logic
- **Styling**: Use Tailwind theme classes instead of hardcoded colors
- **Linting**: ESLint for consistent code style
- **Formatting**: Maintain consistent formatting throughout

### Architecture Rules

- **Design System**: Use centralized tokens, consistent patterns
- **Component Patterns**: Functional components, composition over inheritance
- **Error Handling**: Proper boundaries, user-friendly messages
- **File Organization**: Logical structure, clear naming conventions
- **Code Abstraction**: Use enums, constants, and utility functions to avoid duplication
- **Business Logic**: Extract reusable patterns, avoid hardcoding values
- **Refactoring**: Continuously refactor to maintain clean, logical structure
- **Structure Checks**: Verify file naming, location, and responsibilities after each PRP

### Dashboard-Specific Rules

- **Data Fetching**: Use proper error handling and loading states
- **State Management**: Use React hooks for component state
- **Responsive Design**: Ensure dashboard works on all screen sizes
- **Performance**: Optimize for fast data updates and smooth interactions
- **Accessibility**: Ensure keyboard navigation works for all dashboard interactions
- **Real-time Updates**: Handle data refresh gracefully with loading states

### Testing Requirements

- **Unit Tests**: Individual components, utilities, hooks (when testing framework is added)
- **Coverage**: Maintain >80% coverage across all code (when testing framework is added)
- **Performance**: Monitor bundle size, render times, memory usage
- **Command**: Use `npm run test:run` (when testing framework is added)

### Development Workflow

- **TDD Approach**: Write tests before implementation (when testing framework is added)
- **Incremental Development**: Small, focused changes
- **Code Review**: Self-review before moving to next PRP
- **Documentation**: Update docs with each implementation
- **Version Control**: Do not switch branches, but make a git commit per feature completed (per PRP)
- **Code Quality**: Run lint after each PRP
- **Structure Validation**: Check codebase organization after each PRP

### Quality Assurance

- **Linting**: ESLint for consistent code style
- **Type Checking**: Strict TypeScript configuration
- **Build Verification**: Ensure builds work before archiving PRPs
- **User Experience**: Test from user perspective, accessibility
- **Performance**: Monitor and optimize throughout development
- **Structure Checks**: Verify file organization and naming conventions
- **Code Quality**: Fix linting issues before proceeding

### Project Structure Rules

- **Dashboard Components**: Keep in `src/components/dashboard/`
- **Data Services**: Organize in `src/services/`
- **UI Components**: Place in `src/components/ui/`
- **Utilities**: Place in `src/utils/`
- **Types**: Define in `src/types/` and `src/utils/constants.ts`
- **Tests**: Co-locate with source files (when testing framework is added)
- **Assets**: Store in `src/assets/`

### Implementation Standards

- **Consistency**: Follow established patterns and conventions
- **Reusability**: Create reusable components and utilities
- **Maintainability**: Write clean, documented, testable code
- **Scalability**: Design for future enhancements
- **Reliability**: Robust error handling and edge cases
- **Abstraction**: Use enums, constants, and utility functions to avoid hardcoding
- **Structure**: Maintain logical file organization and component hierarchy
- **Refactoring**: Continuously improve code structure as new features are added
- **Quality**: Maintain high code quality standards throughout

## Agent-Specific Rules

### MANDATORY Agent Behaviors:

1. **ALWAYS** read README.md and INIT.md before any work
2. **ALWAYS** keep working until all PRPs in 'current' folder are complete (default behavior)
3. **ALWAYS** maintain >80% test coverage throughout (when testing framework is added)
4. **ALWAYS** run tests with `npm run test:run` (when testing framework is added)
5. **ALWAYS** move completed PRPs to `_PRP/archive/`
6. **ALWAYS** update archive README.md with new completed features
7. **ALWAYS** ensure all tests pass before moving to next PRP (when testing framework is added)
8. **ALWAYS** build the app and fix any errors before marking PRP as completed
9. **ALWAYS** refactor code to maintain logical structure and avoid duplication
10. **ALWAYS** use enums, constants, and abstraction to avoid hardcoding
11. **ALWAYS** run `npm run lint` after each PRP
12. **ALWAYS** fix any linting issues before proceeding
13. **ALWAYS** perform structure check of codebase after each PRP
14. **ALWAYS** clear PLANNING.md after completing the last PRP in the current batch
15. **ALWAYS** only implement features explicitly requested in PLANNING.md
16. **NEVER** ask for confirmations or user input during implementation, but ask when PRPs are being generated.
17. **NEVER** run interactive commands that could hang
18. **NEVER** leave PRPs incomplete
19. **NEVER** proceed to next PRP without building and testing
20. **NEVER** stop working after finishing a PRP if there are more PRPs in the current folder, unless instructed to do so
21. **NEVER** hallucinate or assume features not explicitly requested
22. **NEVER** add sections like 'future improvements' or 'potential enhancements'

### Agent Testing Protocol:

1. Run `npm run test:run` before starting any PRP (when testing framework is added)
2. Run `npm run test:run` after completing each PRP (when testing framework is added)
3. Fix any test failures before proceeding (when testing framework is added)
4. Maintain >80% coverage throughout (when testing framework is added)
5. **ALWAYS** run `npm run build` before marking PRP as completed
6. Fix any build errors before proceeding to next PRP
7. Verify build process works before archiving

### Agent Build Protocol:

1. **ALWAYS** run `npm run build` after completing each PRP
2. Fix any TypeScript errors, linting issues, or build failures
3. Ensure the app builds successfully before marking PRP as completed
4. Never proceed to next PRP without successful build
5. If build fails, fix issues and rebuild until successful

### Agent Code Quality Protocol:

1. **ALWAYS** run `npm run lint` after completing each PRP
2. Fix any linting issues before proceeding
3. Ensure code follows project standards and conventions
4. Never proceed to next PRP without resolving code quality issues

### Agent Structure Check Protocol:

1. **ALWAYS** review file naming conventions for consistency
2. **ALWAYS** verify file locations match project structure
3. **ALWAYS** check file responsibilities are properly separated
4. **ALWAYS** fix any structural regressions before concluding PRP
5. **ALWAYS** ensure logical organization is maintained
6. **ALWAYS** verify code structure follows established patterns

### Agent Documentation Protocol:

1. Update archive README.md when moving completed PRPs
2. Add new completed features to the implementation history
3. Update key achievements and lessons learned
4. Maintain comprehensive documentation of completed work
5. **ALWAYS** update project root README.md if tech stack or features have changed during implementation
6. **ALWAYS** clear PLANNING.md after completing the last PRP in the current batch

### Agent Code Structure Protocol:

1. **ALWAYS** use enums and constants instead of hardcoded values
2. **ALWAYS** use Tailwind theme classes instead of hardcoded colors
3. **ALWAYS** extract reusable patterns and utility functions
4. **ALWAYS** refactor code when new additions cause structural issues
5. **ALWAYS** maintain logical file organization and component hierarchy
6. **ALWAYS** avoid duplication of business logic across files
7. **ALWAYS** use proper abstraction layers for complex operations
8. **ALWAYS** perform structure checks after each PRP
9. **NEVER** leave hardcoded strings or magic numbers in code
10. **NEVER** use hardcoded color values in CSS or className
11. **NEVER** proceed without refactoring if code structure becomes unclear

## Development Cycle Checklist

### Before Starting Any PRP:

- [ ] Read INIT.md for current rules and standards
- [ ] Read PLANNING.md for feature understanding
- [ ] Review existing PRPs in `_PRP/current/`
- [ ] Ensure development environment is properly set up
- [ ] Verify all tests pass before starting new work (when testing framework is added)

### During PRP Implementation:

- [ ] Follow TDD approach (tests first) (when testing framework is added)
- [ ] Use design system tokens consistently
- [ ] Use Tailwind theme classes instead of hardcoded colors
- [ ] Implement comprehensive error handling
- [ ] Add accessibility features
- [ ] Write clear documentation
- [ ] Test thoroughly before completion
- [ ] Run lint after completion
- [ ] Fix any code quality issues
- [ ] Perform structure check

### After PRP Completion:

- [ ] Run `npm run test:run` to ensure no regressions (when testing framework is added)
- [ ] Run `npm run build` to verify build process
- [ ] Run `npm run lint`
- [ ] Fix any build errors before proceeding
- [ ] Fix any linting issues
- [ ] Perform structure check of codebase
- [ ] Fix any structural inconsistencies
- [ ] Refactor code if needed to maintain logical structure
- [ ] Update documentation as needed
- [ ] Move PRP to `_PRP/archive/`
- [ ] Update archive README.md with new completed features
- [ ] Update project root README.md if tech stack or features have changed
- [ ] Update project status tracking
- [ ] Review lessons learned for future PRPs
- [ ] Clear PLANNING.md if this was the last PRP in the current batch

### Quality Gates:

- [ ] All tests pass (>80% coverage) (when testing framework is added)
- [ ] No TypeScript errors
- [ ] No linting warnings
- [ ] Build completes successfully (`npm run build`)
- [ ] Code structure is logical and well-organized
- [ ] No hardcoded values or duplicated business logic
- [ ] Accessibility requirements met
- [ ] Performance benchmarks achieved
- [ ] File organization follows project conventions
- [ ] Structure check completed and issues resolved

## File Organization

```
_PRP/
├── INIT.md                    # Development cycle and rules (this file)
├── PLANNING.md                # Feature descriptions (user-facing)
├── PLANNING_TEMPLATE.md       # Markdown scaffolding template
├── current/                   # Active PRPs to be implemented
│   ├── PRP...md
│   └── ...
└── archive/                   # Completed PRPs
    ├── PRP...md
    └── ...
```

## Success Metrics

- **Code Quality**: >80% test coverage (when testing framework is added), no linting errors
- **Performance**: <100ms component renders, optimized bundles
- **Accessibility**: WCAG 2.1 AA compliance
- **Reliability**: Robust error handling, data fetching resilience
- **Maintainability**: Clear documentation, consistent patterns
- **Code Structure**: Logical organization, no duplication, proper abstraction
- **Build Process**: Successful builds with no errors
- **User Experience**: Intuitive interface, responsive design
- **Completion**: All PRPs in 'current' folder implemented and archived
- **Documentation**: Archive README.md updated with new completed features
- **Cleanup**: PLANNING.md cleared after last PRP completion
- **Structure**: Consistent file organization and naming conventions

## Getting Started

1. **Read this file (INIT.md)** - Understand development rules
2. **Read PLANNING.md** - Understand feature requirements
3. **Review current PRPs** - See what needs implementation
4. **Follow development cycle** - Implement PRPs sequentially
5. **Archive completed work** - Maintain clean project structure
6. **Update documentation** - Keep archive README.md current
7. **Clear planning** - Clear PLANNING.md after last PRP completion

## References

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (when testing framework is added)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Vitest Documentation](https://vitest.dev/) (when testing framework is added)

This structure ensures consistent, high-quality development with clear processes and maintainable codebase for the Nerdboard dashboard project.
