# PollenPilot - AI-Powered Hayfever Management Prototype

## Overview

PollenPilot is a React-based web application designed to test AI-powered hayfever management with Melbourne users. The application serves as a prototype to validate user interaction patterns and AI recommendation quality through three guided user flows: Morning Check-in, Activity Planning, and Bad Day Recovery. The system integrates with Anthropic's Claude AI to provide contextual, Melbourne-specific pollen advice based on simulated weather and pollen data scenarios.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Component Structure**: Modular component design with separation between UI components and business logic

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Request Handling**: Express middleware for JSON parsing, CORS, and request logging
- **Storage**: In-memory storage implementation with interface for future database integration
- **Session Management**: Chat session-based conversation tracking

### Data Layer
- **Database ORM**: Drizzle ORM configured for PostgreSQL with schema validation using Zod
- **Schema Design**: Three main entities - users, chat sessions, and response ratings
- **Data Validation**: Comprehensive input validation using Zod schemas for type safety
- **Migration Strategy**: Drizzle Kit for database migrations and schema management

### AI Integration
- **AI Provider**: Anthropic Claude API integration for conversational AI capabilities
- **Context Management**: System prompts with Melbourne-specific pollen data and scenario information
- **Conversation Flow**: Stateful chat sessions with message history persistence
- **Response Processing**: Real-time message exchange with Claude API including confidence levels

### Mock Data System
- **Scenario Management**: Four predefined Melbourne pollen scenarios with realistic weather data
- **Data Structure**: JSON-based scenario definitions including pollen levels, weather conditions, and risk assessments
- **User Flow Support**: Scenarios designed to support three specific interaction patterns

## External Dependencies

### Third-Party Services
- **Anthropic Claude API**: Primary AI service for generating pollen management advice and conversational responses
- **Neon Database**: PostgreSQL hosting service for production data persistence

### UI and Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives for building the component library
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development and consistent design system
- **Lucide React**: Icon library providing consistent iconography throughout the application

### Development Tools
- **Vite**: Fast build tool and development server with hot module replacement
- **ESBuild**: JavaScript bundler for production builds
- **TypeScript**: Static type checking and enhanced developer experience
- **Replit Integration**: Custom Replit plugins for development environment integration