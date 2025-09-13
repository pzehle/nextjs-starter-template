# Design System

## Overview

This application uses a modern design system built on [shadcn/ui](https://ui.shadcn.com/) (canary version) with Tailwind CSS v4.

## Core Principles

- **Component-Based**: Reusable UI components with consistent behavior
- **Accessibility First**: All components follow WCAG guidelines
- **Dark Mode Support**: Automatic theme switching based on user preference
- **Type Safety**: Full TypeScript support throughout

## Technology Stack

- **shadcn/ui @canary**: Provides high-quality, customizable components
- **Tailwind CSS v4**: Utility-first CSS framework with CSS variables
- **Radix UI**: Underlying primitives for complex interactions
- **Lucide Icons**: Consistent icon system

## Design Approach

The design system follows the "New York" style variant from shadcn/ui, which provides a clean, modern aesthetic. Components are designed to be composable, allowing complex interfaces to be built from simple, well-tested parts.

## Theming

The system uses CSS custom properties (variables) for theming, enabling:

- Consistent color usage across the application
- Easy theme switching without JavaScript overhead
- Support for both light and dark modes
- OKLCH color space for better color consistency

## Component Philosophy

Components are built with composition in mind. Rather than creating monolithic components, the system encourages building complex UI from smaller, focused components. This approach improves:

- Maintainability
- Testability
- Flexibility
- Performance

## Styling Strategy

The project uses Tailwind's utility classes as the primary styling method, with the `cn()` utility function for managing conditional classes. This approach ensures:

- Consistent spacing and sizing
- Predictable styling behavior
- Minimal CSS bundle size
- Easy responsive design

## Best Practices

When working with the design system:

- Prefer existing components over creating new ones
- Use semantic color variables rather than hard-coded values
- Ensure all interactive elements are keyboard accessible
- Test components in both light and dark modes
- Follow the established patterns for consistency
