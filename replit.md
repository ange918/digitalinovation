# Digital Innovation - Agence Web

## Overview

Site web d'agence digitale "Digital Innovation" basée au Bénin, construit avec React 19 et Vite. Le projet présente une interface moderne à thème sombre avec des accents vert néon, conçu pour présenter les services d'une agence digitale. L'application utilise une approche mobile-first avec CSS Grid et Flexbox pour des mises en page responsives.

## User Preferences

Preferred communication style: Simple, everyday language (Français).

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- **React 19.1.1**: Latest version of React serving as the core UI library
- **Vite 7.1.7**: Modern build tool providing fast HMR (Hot Module Replacement) and optimized production builds
- **React Compiler**: Enabled via babel-plugin-react-compiler for automatic optimization of React components

**Rationale**: Vite offers significantly faster development experience compared to Create React App, with near-instantaneous HMR. The React Compiler automatically optimizes component rendering without manual memoization.

### Styling Architecture

**CSS Approach**
- **Vanilla CSS**: Custom CSS pur avec variables CSS natives dans `src/index.css`
- **Design System**: Palette de couleurs et typographie définies via variables CSS
- **Google Fonts Integration**: Poppins (300, 400, 600, 700) pour le corps et Space Grotesk (700) pour les titres

**Design System Variables**:
- `--bg-dark: #070707` - Fond noir profond
- `--accent-green: #00e06a` - Vert néon (couleur principale)
- `--muted-blue: #d8eef7` - Bleu clair (section "Qui sommes-nous")
- `--deep-blue: #04106a` - Bleu foncé (footer)
- `--card-dark: #0c0d0e` - Fond des cartes
- `--text-light: #e6f0f5` - Texte clair
- `--text-dark: #0b2030` - Texte foncé

**Rationale**: CSS pur avec variables permet un contrôle total du design et un code léger sans dépendance externe. Le thème sombre avec accents néon crée une esthétique moderne d'agence digitale.

### Development Environment

**Code Quality Tools**
- **ESLint 9.36.0**: Configured with recommended React Hooks rules and React Refresh plugin
- **Custom ESLint Rules**: Ignores unused variables following uppercase patterns (common for React components)
- **React Hooks Plugin**: Enforces best practices for hooks usage
- **React Refresh Plugin**: Ensures proper Fast Refresh behavior during development

**Responsive Design Strategy**
- Mobile-first approach with breakpoints at 768px (tablet) and 1100px (desktop)
- Maximum container width of 1200px with adaptive padding
- CSS Grid and Flexbox for flexible, responsive layouts

### Build & Deployment Configuration

**Vite Configuration**
- Custom server settings for Replit environment:
  - Host: `0.0.0.0` (allows external connections)
  - Port: 5000
  - HMR client port: 443 (for proper WebSocket connections through Replit's proxy)

**Rationale**: These settings are specifically optimized for Replit's hosting environment where the application runs in a container and needs to handle proxied connections.

### Component Architecture

**Structure Pattern**
- Single entry point via `src/main.jsx`
- Component-based architecture with modular React components
- All components located in `src/components/`

**Components**:
1. **Header** (`Header.jsx`) - Logo "Digital Innovation" et icônes réseaux sociaux
2. **Hero** (`Hero.jsx`) - Section principale avec titre, sous-titre, CTA et icônes tech animées
3. **About** (`About.jsx`) - Section "Qui sommes-nous" avec 4 cartes de services
4. **Portfolio** (`Portfolio.jsx`) - Section des réalisations avec mockup
5. **Workflow** (`Workflow.jsx`) - 6 étapes du processus de travail
6. **Blog** (`Blog.jsx`) - Grille de 4 articles récents
7. **Footer** (`Footer.jsx`) - Informations de contact et réseaux sociaux
8. **Icons** (`Icons.jsx`) - Composants SVG réutilisables pour toutes les icônes

**Content (Français)**:
- Hero: "Agence web Digital Innovation" - Propulser les entrepreneurs dans l'ère digitale
- Services: Community Manager, Designer UI/UX, Copywriter, Développeurs web/mobile
- Workflow: 6 étapes (Écoute, Stratégie, Design, Développement, Tests, Lancement)
- Blog: Articles sur React, SEO, Cloud, Cybersécurité

**Layout Strategy**
- Container centralisé avec max-width: 1200px
- Grilles responsive pour services (2x2), workflow (3x2), blog (2x2)
- Flexbox pour header et footer

## External Dependencies

### Build & Development Tools
- **@vitejs/plugin-react**: Official Vite plugin for React with Fast Refresh support
- **babel-plugin-react-compiler**: Experimental React compiler for automatic optimizations
- **PostCSS & Autoprefixer**: CSS processing pipeline for vendor prefixes and transformations

### Styling Dependencies
- **Custom CSS**: Vanilla CSS with CSS Variables (no Tailwind)
- **Google Fonts API**: Poppins (300, 400, 600, 700) et Space Grotesk (700)

### Code Quality
- **ESLint ecosystem**: Core linting with React-specific plugins
- **TypeScript type definitions**: Type definitions for React and React DOM (development only)

### No Backend Dependencies
This is a frontend-only application with no database, authentication, or API integrations currently configured. All content is managed within React components.