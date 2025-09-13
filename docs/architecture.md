# Architecture Overview

## High-Level Architecture

This application is built using Next.js 15 with the App Router, leveraging React Server Components (RSC) for optimal performance and SEO. The backend logic is organized using a Domain-Driven approach to ensure a clean separation of concerns and high maintainability.

```
┌───────────────────────────────────────────────────────────┐
│                        Client Browser                     │
├───────────────────────────────────────────────────────────┤
│                    Next.js App Router (UI)                │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │    Pages    │  │   Layouts    │  │   Components     │  │
│  │  (RSC/RCC)  │  │    (RSC)     │  │   (RSC/RCC)      │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
├───────────────────────────────────────────────────────────┤
│                API Routes (app/api/*)                     │
│       (Orchestration Layer: Auth, Validation, Tx)         │
├───────────────────────────────────────────────────────────┤
│               Domain Layer (src/domains/*)                │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ User Domain │  │ Team Domain  │  │ Company Domain   │  │
│  │ Media Domain│  │ Auth Domain  │  │ ...              │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
├───────────────────────────────────────────────────────────┤
│                 Shared Services & Libs                    │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Prisma    │  │     i18n     │  │    Utilities     │  │
│  │   (DB)      │  │   Service    │  │    (R2, etc.)    │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

## Core Technologies

- **Next.js 15**: Modern React framework with App Router
- **React 19**: Latest React with Server Components
- **TypeScript**: Type safety throughout the application
- **Prisma**: Next-generation ORM for database access
- **R2 & S3**: Object storage for media files
- **Valibot**: Schema validation
- **Tailwind CSS v4**: Utility-first styling
- **next-intl**: Internationalization support

## Architectural Principles

### Domain-Driven Structure

The core of our backend logic resides in `src/domains`. Each business concept (like `user`, `team`, or `company`) is treated as a separate domain. This modular approach keeps concerns separated and makes the codebase easier to navigate, maintain, and scale.

The API routes in `app/api` directly mirror the domain structure, creating a predictable and consistent API surface. For example, logic for the `team` domain in `src/domains/team` is exposed via API routes under `app/api/team`.

#### Inside a Domain

Each domain (and sub-domain) follows a consistent file structure to clearly define responsibilities:

- **`*.service.ts`**: The "Service Layer". This is the only place where side effects like database operations (Prisma) or external API calls should occur. It orchestrates the business logic.
- **`*.domain.ts`**: The "Domain Layer". Contains pure functions that encapsulate core business rules, logic, and calculations. These functions have no external dependencies (no DB calls, no API fetches) and are highly testable.
- **`*.schema.ts`**: Defines input validation schemas (using Valibot) for API routes and service functions.
- **`*.types.ts`**: Contains TypeScript type definitions specific to the domain.
- **`*.errors.ts`**: Defines custom error classes for the domain, allowing for specific error handling.
- **`*.api.ts`**: Contains client-side functions (e.g., for SWR mutations) used by the frontend to interact with the domain's API routes.

This strict separation ensures that business logic (`.domain.ts`) is decoupled from infrastructure concerns (`.service.ts`), which is a cornerstone of clean architecture.

### Server-First Approach

The application defaults to Server Components, sending less JavaScript to the client and improving initial page load performance. Client Components are used only when interactivity is required.

### Component Architecture

Components are designed to be composable and reusable. The architecture favors small, focused components that can be combined to create complex interfaces.

### Internationalization

Multi-language support is built into the architecture from the ground up, not added as an afterthought. The system supports 8 languages with automated translation capabilities.

## Performance Strategy

- **Server Components**: Reduce client-side JavaScript
- **Static Generation**: Pre-render pages where possible
- **Code Splitting**: Automatic route-based splitting
- **Asset Optimization**: Images, fonts, and CSS are optimized automatically

## Security Considerations

- Environment variables separate server-only secrets from public configuration
- API routes provide a secure proxy for external service calls
- Input validation and sanitization at API boundaries using Valibot schemas
- CSRF protection on sensitive API routes
- Role-based access control (RBAC) enforced at the API layer
