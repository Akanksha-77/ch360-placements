# Recruitr Pro - Placement Portal

A comprehensive placement portal for managing job and internship opportunities between companies and students.

## Features

- **Admin Dashboard**: Create and manage job/internship offers
- **Student Portal**: Browse and search available opportunities
- **Company Management**: Track company information and relationships
- **Reports & Analytics**: Monitor placement statistics and trends
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Build Tool**: Vite
- **State Management**: React Query + Local Storage
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API server running on `http://127.0.0.1:8000`

### Installation

1. Clone the repository:
```bash
git clone <your-github-repo-url>
cd recruitr-pro-main
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Authentication

The application now connects to a backend API server at `http://127.0.0.1:8000`. Make sure your backend server is running before attempting to log in.

**Default Login Credentials:**
- Email: `placement@mits.ac.in`
- Password: `Mits@1234`

The login form includes a connection status indicator that shows whether the backend server is accessible.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── dashboard/      # Dashboard-specific components
│   ├── layout/         # Layout components (header, sidebar)
│   └── ui/            # Base UI components (shadcn/ui)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and stores
├── pages/              # Page components
└── main.tsx           # Application entry point
```

## Key Pages

- **Dashboard**: Overview and quick actions
- **Admin Offers**: Create/manage job and internship offers
- **Student Portal**: Browse available opportunities
- **Companies**: Company management
- **Jobs/Internships**: Detailed listings
- **Reports**: Analytics and insights

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Update routing in `src/App.tsx`
4. Add navigation items in `src/components/layout/sidebar.tsx`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub.

## Environment variables

Create a `.env.local` file in `ch360-placements-main` to point the frontend to your backend:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_PLACEMENTS_BASE=/api/v1/placements
```

If your backend exposes different paths, adjust these accordingly. Restart the dev server after changes.
