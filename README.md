# SplitBill Frontend

A modern, beautiful frontend for the SplitBill expense sharing application built with React, TypeScript, and Tailwind CSS.

## Features

- **Authentication**: Secure login and registration with JWT token management
- **Dashboard**: Overview of groups, expenses, and balance statistics
- **Group Management**: Create and manage expense sharing groups
- **Expense Tracking**: Add, view, and split expenses between group members
- **User Profile**: Manage account settings and personal information
- **Responsive Design**: Beautiful UI that works on all devices
- **Modern Stack**: Built with React, TypeScript, Tailwind CSS, and shadcn/ui components

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API calls

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on http://localhost:8000

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── Layout.tsx      # Main layout component
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── lib/               # Utility libraries
│   ├── api.ts         # API client and types
│   └── utils.ts       # Utility functions
├── pages/             # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Groups.tsx      # Group management
│   ├── Expenses.tsx    # Expense tracking
│   ├── Profile.tsx     # User profile
│   ├── Login.tsx       # Login page
│   └── Register.tsx    # Registration page
├── App.tsx            # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles
```

## API Integration

The frontend is designed to work with a backend API that provides the following endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Groups
- `GET /api/groups` - Get user groups
- `POST /api/groups` - Create new group
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### Expenses
- `GET /api/expenses` - Get expenses (with optional group filter)
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get expense details
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features in Detail

### Authentication
- JWT-based authentication
- Automatic token refresh
- Protected routes
- Logout functionality

### Dashboard
- Overview of all groups and expenses
- Balance statistics
- Recent activity
- Quick actions for creating groups and expenses

### Groups
- Create new groups with descriptions
- View group members
- Add members to groups
- Group-specific expense tracking

### Expenses
- Add expenses with descriptions and amounts
- Split expenses between group members
- Filter expenses by group
- Search expenses by description
- View expense history

### Profile
- Update personal information
- Change password
- Account overview
- Logout functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
