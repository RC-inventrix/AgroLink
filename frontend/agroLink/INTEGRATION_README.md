# AgroLink - Integrated Frontend

This is the consolidated AgroLink frontend application combining all 4 separate registration pages into a single Next.js application.

## Project Structure

```
app/
├── page.tsx                 # Home page (/)
├── register/
│   └── page.tsx            # Main registration page (/register)
├── register-farmer/
│   └── page.tsx            # Farmer registration (/register-farmer)
├── register-buyer/
│   └── page.tsx            # Buyer registration (/register-buyer)
├── layout.tsx              # Root layout
└── globals.css             # Global styles with AgroLink color palette
```

## Routes

- `/` - Home page with features and CTA
- `/register` - Main registration (sign up with email/password and role selection)
- `/register-farmer` - Farmer-specific registration details
- `/register-buyer` - Buyer-specific registration details

## Available Scripts

```bash
# Development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Tech Stack

- **Next.js 16.0.3** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **Zod** - Schema validation

## Color Palette

- **Primary (Dark Green)**: `#03230F`
- **Secondary (Gold)**: `#EEC044`
- **Background**: `#ffffff` (light), `#04000B` (dark)
- **Foreground**: `#03230F` (light), `#ffffff` (dark)

## Configuration Files

- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS theme
- `tsconfig.json` - TypeScript configuration
- `postcss.config.mjs` - PostCSS configuration

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Integration Notes

This application consolidates the following separate Next.js projects:
- `agro-link-home-page` → Home page (`/`)
- `main-registration-page` → Main registration (`/register`)
- `farmer-registration-page` → Farmer registration (`/register-farmer`)
- `buyer-registration-page` → Buyer registration (`/register-buyer`)

All pages maintain their original styling and functionality while being integrated into a single application with shared configuration and dependencies.
