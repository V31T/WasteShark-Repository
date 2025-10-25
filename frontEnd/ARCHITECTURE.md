# WasteShark Frontend - System Architecture Documentation

## Overview

This document outlines the system architecture, UML patterns, and overall design of the WasteShark autonomous pool cleaning platform frontend.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [UML Diagrams Implementation](#uml-diagrams-implementation)
3. [Design Patterns](#design-patterns)
4. [Component Structure](#component-structure)
5. [Data Flow](#data-flow)
6. [API Integration](#api-integration)

## System Architecture

### High-Level Architecture

The WasteShark frontend follows a **Component-Based Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Home   │  │  Login   │  │Dashboard │  │  Admin   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Component Layer                           │
│  ┌──────┐  ┌──────┐  ┌────────────┐  ┌──────────┐          │
│  │Navbar│  │Button│  │StatusCard  │  │PrivateRt │          │
│  └──────┘  └──────┘  └────────────┘  └──────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Context Layer                             │
│                    ┌────────────────┐                        │
│                    │  AuthContext   │                        │
│                    └────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  ┌──────────┐  ┌────────────┐  ┌─────────┐                  │
│  │  auth.js │  │ robots.js  │  │ mocks.js│                  │
│  └──────────┘  └────────────┘  └─────────┘                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend API (TODO)                         │
│        REST API with JWT Authentication                      │
└─────────────────────────────────────────────────────────────┘
```

## UML Diagrams Implementation

### 1. Component Diagram

The system implements the following main components:

#### **Authentication Module**
- **Component**: `AuthContext` (Singleton Pattern)
- **Responsibility**: Global authentication state management
- **Patterns**: Context Provider, Singleton
- **Location**: `src/context/AuthContext.jsx`

#### **Route Protection Module**
- **Component**: `PrivateRoute` (Decorator Pattern)
- **Responsibility**: Protects routes from unauthorized access
- **Patterns**: Decorator, Guard
- **Location**: `src/components/PrivateRoute.jsx`

#### **Robot Management Module**
- **Components**: `Dashboard`, `Admin` (CRUD Pattern)
- **Responsibility**: Robot control and management
- **Patterns**: CRUD, Repository, Observer
- **Location**: `src/pages/Dashboard.jsx`, `src/pages/Admin.jsx`

#### **API Layer Module**
- **Components**: `auth.js`, `robots.js` (Facade Pattern)
- **Responsibility**: Backend communication
- **Patterns**: Facade, Repository, Adapter
- **Location**: `src/api/`

### 2. Sequence Diagram Implementation

#### Authentication Flow
```
User → Login Page → AuthContext.login() → API Layer → Backend
                                                  ↓
                                            JWT Token
                                                  ↓
User ← Dashboard Page ← AuthContext ← localStorage
```

#### Robot Control Flow
```
User → Dashboard → StartCleaning() → API → Backend
                                          ↓
                                      Status Update
                                          ↓
User ← UI Update ← State Change ← Polling
```

## Design Patterns

### 1. **Singleton Pattern**
- **Implementation**: `AuthContext`
- **Purpose**: Single source of truth for authentication state
- **Usage**: `useAuth()` hook provides global access

### 2. **Decorator Pattern**
- **Implementation**: `PrivateRoute`
- **Purpose**: Adds authentication checks to routes
- **Usage**: Wraps protected components

### 3. **Facade Pattern**
- **Implementation**: API modules (`auth.js`, `robots.js`)
- **Purpose**: Simplifies complex API interactions
- **Usage**: Single interface for multiple backend operations

### 4. **Observer Pattern**
- **Implementation**: Real-time status updates
- **Purpose**: React to robot status changes
- **Usage**: `useEffect` hooks with polling

### 5. **Strategy Pattern**
- **Implementation**: Button variants, Status colors
- **Purpose**: Switchable algorithms/behaviors
- **Usage**: Dynamic styling based on variant

### 6. **Repository Pattern**
- **Implementation**: Data access in API layer
- **Purpose**: Centralized data management
- **Usage**: CRUD operations for robots

### 7. **Context Provider Pattern**
- **Implementation**: React Context API
- **Purpose**: Global state management
- **Usage**: Authentication state across components

## Component Structure

### Page Components

1. **Home** (`src/pages/Home.jsx`)
   - Landing page with hero section
   - About section with 3 feature cards
   - Footer with company info
   - **Pattern**: Landing Page

2. **Login** (`src/pages/Login.jsx`)
   - Two-column responsive layout
   - Form handler with validation
   - JWT authentication flow
   - **Pattern**: Form Handler, Mediator

3. **Dashboard** (`src/pages/Dashboard.jsx`)
   - Robot control center
   - Real-time status monitoring
   - Start/Stop cleaning controls
   - System metrics display
   - **Pattern**: Observer, Command

4. **Admin** (`src/pages/Admin.jsx`)
   - Robot management interface
   - Add/Delete robots
   - Status overview
   - **Pattern**: CRUD, Repository

### Reusable Components

1. **Navbar** (`src/components/Navbar.jsx`)
   - Logo display
   - Navigation links
   - Authentication state management
   - **Pattern**: Presentational Component

2. **Button** (`src/components/Button.jsx`)
   - Multiple variants (primary, secondary, danger, success)
   - Disabled states
   - **Pattern**: Strategy

3. **StatusCard** (`src/components/StatusCard.jsx`)
   - Display key metrics
   - Icon and color variations
   - **Pattern**: Presentation Component

4. **PrivateRoute** (`src/components/PrivateRoute.jsx`)
   - Route protection
   - Authentication checks
   - **Pattern**: Decorator, Guard

## Data Flow

### 1. Authentication Flow
```
User Input (Login Page)
    ↓
Form Submission
    ↓
AuthContext.login()
    ↓
Mock JWT Token Generation
    ↓
localStorage Storage
    ↓
State Update
    ↓
Navigation to Dashboard
```

### 2. Robot Status Flow
```
Component Mount
    ↓
useEffect Hook
    ↓
Polling (every 5s)
    ↓
API Call (getRobotStatus)
    ↓
State Update
    ↓
UI Re-render
```

### 3. Robot Control Flow
```
User Action (Start Cleaning)
    ↓
Button Click Handler
    ↓
API Call (startCleaning)
    ↓
Loading State
    ↓
State Update
    ↓
UI Feedback (Toast)
```

## API Integration

### Endpoints

#### Authentication
- `POST /login` - User authentication
- `POST /createuser` - User registration
- `POST /logout` - User logout

#### Robot Management
- `GET /robots` - List all robots
- `GET /robots/:id/status` - Get robot status
- `POST /robots/:id/start` - Start cleaning
- `POST /robots/:id/stop` - Stop cleaning
- `POST /robots` - Create robot
- `DELETE /robots/:id` - Delete robot

### TODO: Backend Integration

All API endpoints are currently mocked. To integrate with the backend:

1. Update `API_BASE_URL` in API files
2. Uncomment axios calls
3. Remove mock implementations
4. Add error handling
5. Implement JWT validation

## Technology Stack

- **React 18.2.0** - UI framework
- **React Router 6.20.0** - Navigation
- **Tailwind CSS 3.3.6** - Styling
- **Axios 1.6.2** - HTTP client
- **React Hot Toast 2.4.1** - Notifications
- **Vite 5.0.8** - Build tool

## Color Scheme

- **Navy Blue**: `#001F54` - Primary dark color
- **Royal Blue**: `#0046FF` - Primary accent color
- **White**: `#FFFFFF` - Background and text

## Branding

- **Logo**: Custom WasteShark logo with shark icon
- **Location**: `src/assets/logo.svg`
- **Usage**: Displayed in Navbar component

## Future Enhancements

1. WebSocket integration for real-time updates
2. PWA capabilities for offline support
3. Advanced robot monitoring with maps
4. Historical data visualization
5. Multi-robot selection and management
6. User role management
7. Notification system
8. Export functionality for reports

## Conclusion

The WasteShark frontend implements a modern, scalable architecture following React best practices and common design patterns. The component-based structure ensures maintainability and extensibility for future enhancements.
