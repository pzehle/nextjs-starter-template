# Project Name

A modern, internationalized Next.js application with a robust, domain-driven architecture, a comprehensive design system, and multi-language support.

## ✨ Features

- **Authentication**: Secure user registration and login using NextAuth.js.
- **Company & Team Management**: Multi-user support with role-based access control (Owner, Admin, Member).
- **Content Settings**: Centralized management of company-wide content settings, including brand voice, colors, and logo.
- **Media Management**: File uploads to R2 object storage for logos and other media.
- **Audit Trails**: Detailed logging for content and media changes.
- **Internationalization**: Fully translated into 8 languages with automated translation workflows.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Fill in the required values in the .env file

# 3. Set up the database
# This will create the database schema based on `prisma/schema.prisma`
npm run db:migrate

# 4. Run the development server
npm run dev

# 5. Open http://localhost:3000
```

## 📚 Documentation

- [**Architecture**](./docs/architecture.md) - A deep dive into the domain-driven structure of the application.
- [Design System](./docs/design-system.md) - UI components and styling approach.
- [Internationalization (i18n)](./docs/i18n.md) - Multi-language support and translation system.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 & shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Validation**: Valibot
- **File Storage**: Cloudflare R2
- **Internationalization**: next-intl
- **AI**: OpenAI API (for automated translations)

## 📦 Recommended VS Code Extensions

To ensure a consistent and efficient development experience, we recommend installing the following VS Code extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)

## 🌍 Languages

The application supports 8 languages with English as the default language:

- 🇬🇧 English (en) - Default
- 🇩🇪 German (de)
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇳🇱 Dutch (nl)
- 🇮🇹 Italian (it)
- 🇷🇺 Russian (ru)
- 🇹🇷 Turkish (tr)

## 📋 Scripts

```bash
npm run dev                # Start development server
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint
npm run test               # Run Jest tests
npm run translations:merge     # Merge translation source files
npm run translations:translate # Auto-translate to all languages
npm run db:migrate         # Apply database migrations
npm run db:studio          # Open Prisma Studio to view/edit data
npm run db:reset           # Reset the database (deletes all data)
npm run db:seed            # Populates the datbase with placeholder data
```

## 🔧 Environment Variables

See `.env.example` for a full list of required environment variables. Copy this file to `.env` and fill in the appropriate values for your environment.
