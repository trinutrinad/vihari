# Overview

YatraHub is a comprehensive travel planning application designed for exploring destinations across India. The application provides users with tools to discover destinations, plan journeys, access travel services (flights, hotels, transport), and manage travel itineraries. It features a modern React-based frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence and offering real-time travel planning capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript, implementing a component-based architecture with the following key decisions:

- **UI Framework**: Uses shadcn/ui components built on Radix UI primitives for consistent, accessible interface elements
- **Styling**: TailwindCSS for utility-first styling with custom design tokens and CSS variables for theming
- **State Management**: TanStack React Query for server state management and caching, eliminating the need for complex client-side state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
The backend follows a REST API pattern with Express.js:

- **Framework**: Express.js with TypeScript for type safety
- **API Design**: RESTful endpoints organized by resource (destinations, journey plans, transport, accommodations)
- **Middleware**: Custom logging middleware for API request tracking and error handling
- **Development Tools**: Vite integration for hot module replacement during development

## Database Design
PostgreSQL database with Drizzle ORM for type-safe database operations:

- **Schema Definition**: Centralized schema definitions in shared directory for type consistency between frontend and backend
- **Migration Management**: Drizzle Kit for database schema migrations
- **Connection**: Neon Database serverless PostgreSQL for cloud deployment
- **Session Storage**: PostgreSQL-based session storage for authentication persistence

## Authentication System
Mock authentication system for development with provisions for production authentication:

- **Development Mode**: Mock user authentication for rapid development
- **Session Management**: PostgreSQL session storage with express-session
- **User Management**: Dedicated user table with profile information storage
- **Authorization**: Middleware-based route protection

## External Service Integrations
The application is designed to integrate with various travel APIs:

- **Currency Conversion**: Mock implementation with provisions for real currency exchange APIs
- **Maps Integration**: Placeholder for Google Maps/Places API integration
- **Travel Booking APIs**: Architecture supports integration with flight, hotel, and transport booking services
- **Location Services**: Geolocation API integration for location-based services

## Development Workflow
The project uses a monorepo structure with shared TypeScript definitions:

- **Shared Types**: Common schema definitions used across frontend and backend
- **Build Process**: Vite for frontend bundling and esbuild for backend compilation
- **Development Server**: Integrated Vite dev server with Express API proxy
- **Code Quality**: TypeScript strict mode with comprehensive type checking

## Data Flow Architecture
The application follows a unidirectional data flow pattern:

- **API Layer**: Centralized API client with error handling and request logging
- **Query Management**: React Query handles caching, background updates, and loading states
- **Component Architecture**: Props-down, events-up pattern with minimal prop drilling
- **Error Boundaries**: Structured error handling at component and API levels

The architecture prioritizes type safety, developer experience, and scalability while maintaining a clean separation of concerns between presentation, business logic, and data persistence layers.