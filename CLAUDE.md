# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MindMap Calendar is a Next.js 15 application that combines interactive mind mapping with calendar management and Google Calendar synchronization. Users create ideas as nodes in a mind map, then drag-and-drop them to schedule tasks in an integrated calendar system.

## Architecture

### Tech Stack
- **Framework**: Next.js 15.4.2 with App Router, React 19, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with Google OAuth (includes Calendar API scope)
- **Mind Map**: @xyflow/react (React Flow) with custom node components
- **Calendar**: React Big Calendar with moment.js
- **Drag & Drop**: @dnd-kit suite for cross-component interactions
- **Styling**: Tailwind CSS v4
- **Google Integration**: Google APIs SDK for Calendar synchronization

### Core Data Flow
1. **Mind Map Nodes** → Created in React Flow component
2. **Task Panel** → Shows unscheduled nodes as draggable tasks
3. **Calendar Events** → Tasks dropped onto calendar become scheduled events
4. **Google Sync** → Bidirectional synchronization with Google Calendar
5. **Database** → MongoDB stores nodes, events, and sync relationships

## Key Components

### Authentication (`/src/lib/auth.ts`)
- NextAuth configuration with Google provider
- Includes Google Calendar API scope for full integration
- Stores access/refresh tokens for API calls

### Database Models (`/src/models/`)
- **MindMapNode**: Position, metadata, connections, scheduling status
- **CalendarEvent**: Start/end dates, Google sync tracking, mind map relationships

### Mind Map System (`/src/components/MindMap/`)
- Custom React Flow nodes with priority indicators and tag system
- Real-time positioning, connections, and inline editing
- Integration with task scheduling workflow

### Calendar Integration (`/src/components/Calendar/`)
- React Big Calendar with custom event rendering
- Distinguishes mind map tasks from regular events
- Multi-view support (month/week/day) with French localization

### API Endpoints (`/src/app/api/`)
- `/mindmap` - CRUD operations for mind map nodes
- `/calendar` - Event management with date filtering
- `/google-sync` - Import/export Google Calendar events

## Development Commands

```bash
# Development with Turbopack
npm run dev

# Production build and type checking
npm run build

# Production server
npm run start

# Linting
npm run lint
```

## Environment Setup

Required variables in `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generated-secret>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
MONGODB_URI=<mongodb-connection-string>
```

### Google OAuth Setup
1. Enable Google Calendar API in Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Set OAuth consent screen to "Testing" mode
5. Add test users who can access the application

## Code Patterns

### Component Structure
- Feature-based component organization
- TypeScript interfaces in `/lib/types.ts`
- Props drilling for cross-component state
- React hooks for local state management

### Database Operations
- User-scoped queries using session email
- Mongoose models with proper indexing
- Connection pooling with global cache

### API Design
- Session validation on protected routes
- RESTful endpoints with proper HTTP methods
- Error handling with appropriate status codes

### Drag & Drop Implementation
- @dnd-kit context wraps main dashboard
- Tasks draggable from TaskPanel to Calendar
- Visual feedback during drag operations
- State updates on successful drops

## Key Integration Points

### Mind Map ↔ Calendar
- Node creation updates task panel
- Drag from panel schedules as calendar event
- Calendar events link back to original nodes
- Status synchronization between components

### Google Calendar Sync
- Import existing Google events on user request
- Export mind map tasks to Google Calendar
- Bidirectional updates with conflict handling
- Event metadata preservation

## Common Tasks

### Adding New Mind Map Features
1. Update `NodeData` interface in `/lib/types.ts`
2. Modify `MindMapNode` component for visual changes
3. Update database model in `/models/MindMapNode.ts`
4. Adjust API endpoints in `/api/mindmap/`

### Extending Calendar Functionality
1. Modify `CalendarComponent` for UI changes
2. Update `CalendarEvent` model for data changes
3. Adjust API endpoints in `/api/calendar/`
4. Update Google sync logic if needed

### Authentication Changes
1. Modify scopes in `/lib/auth.ts`
2. Update Google Cloud Console OAuth configuration
3. Test with OAuth consent screen updates

The application follows modern Next.js patterns with server-side authentication, client-side interactivity, and external API integration.