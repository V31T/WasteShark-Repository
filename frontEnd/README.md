# WasteShark - Autonomous Pool Cleaning Platform

A modern React frontend for managing autonomous pool-cleaning robots. Built with React.js, Vite, Tailwind CSS, and React Router.

## Features

- **Authentication Flow** - JWT-based authentication with mock login
- **Dashboard** - Real-time robot monitoring and control
- **Admin Panel** - Manage multiple robots (Add/Delete)
- **Responsive Design** - Mobile and desktop optimized
- **Modern UI** - Built with Tailwind CSS and custom components

## Project Structure

```
src/
├── assets/          # Logo and static images
├── components/      # Navbar, Button, StatusCard, etc.
├── pages/           # Home, Login, Dashboard, Admin
├── api/             # Placeholder API functions (auth.js, robots.js, mocks.js)
├── context/         # AuthContext.jsx for JWT token management
├── hooks/           # Custom hooks (ready for extensions)
├── App.jsx
└── main.jsx
```

## Tech Stack

- **React** 18.2.0
- **Vite** 5.0.8
- **React Router** 6.20.0
- **Tailwind CSS** 3.3.6
- **Axios** 1.6.2
- **React Hot Toast** 2.4.1

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd WasteShark_Cursor
```

2. Install dependencies
```bash
npm install
```

3. Create environment file (optional)
```bash
# Copy the example env file
cp .env.example .env
```

4. Start the development server
```bash
npm run dev
```

5. Open your browser and visit `http://localhost:5173`

## Design Guidelines

### Color Palette
- **Navy Blue**: `#001F54`
- **Royal Blue**: `#0046FF`
- **White**: `#FFFFFF`

### Pages

#### Home Page (`/`)
- Hero section with call-to-action buttons
- "Get Started" → Navigates to login
- "Learn More" → Scrolls to About section
- Footer with company info

#### Login Page (`/login`)
- Two-column responsive layout
- Left: Login form
- Right: Marketing info card
- Mock JWT token generation

#### Dashboard (`/dashboard`) - Protected
- Robot Control Center
- Real-time status monitoring
- Start/Stop cleaning controls
- System status overview

#### Admin Page (`/admin`) - Protected
- Robot management interface
- Add new robots
- Delete robots
- Status overview

## Authentication

The app uses mock JWT authentication for development:

- **Login**: Any email/password combination works
- **Token**: Stored in localStorage
- **Protected Routes**: `/dashboard` and `/admin` require authentication

### TODO: Backend Integration

Replace mock authentication in:
- `src/api/auth.js`
- `src/context/AuthContext.jsx`

## API Integration Points

All API functions are placeholders with TODO comments:

### Authentication (`src/api/auth.js`)
```javascript
// TODO: integrate with POST /login
// TODO: integrate with POST /createuser
// TODO: integrate with POST /logout
```

### Robot Management (`src/api/robots.js`)
```javascript
// TODO: integrate with GET /robots/:robotId/status
// TODO: integrate with POST /robots/:robotId/start
// TODO: integrate with POST /robots/:robotId/stop
// TODO: integrate with POST /robots
// TODO: integrate with DELETE /robots/:robotId
```

### Environment Variables

Create a `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000
```

## Components

### Reusable Components

- **Button** - Multiple variants (primary, secondary, danger, success)
- **StatusCard** - Display key metrics with icons
- **Navbar** - Responsive navigation with auth state
- **PrivateRoute** - Protected route wrapper

### Pages

- **Home** - Landing page with hero section
- **Login** - Authentication form
- **Dashboard** - Robot control interface
- **Admin** - Robot management panel

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## TODO: Backend Integration

1. Replace mock API calls in `/src/api/` with actual endpoints
2. Implement JWT validation in backend
3. Connect robot data streams for real-time updates
4. Add WebSocket support for live status updates
5. Implement proper error handling and retry logic

When integrating with the backend:

1. Update API functions in `src/api/`
2. Implement proper error handling
3. Add loading states for async operations
4. Test authentication flow
5. Update environment variables

##  Notes

- All API functions return mock data for development
- Authentication uses localStorage for token persistence
- Toast notifications provide user feedback
- Loading states prevent duplicate actions
- Responsive design works on all screen sizes

---

May god strike me down if Michael Huh doesnt pick me u-
