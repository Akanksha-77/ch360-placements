# CampusHub360 Placement Portal - Setup Instructions

## 🚀 Quick Start

Your Placement Admin Portal is now fixed and ready to run! Here's how to use it:

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Both Frontend & Backend**
   ```bash
   npm run dev
   ```
   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

3. **Start Individual Services**
   ```bash
   # Frontend only
   npm run dev:frontend
   
   # Backend only  
   npm run dev:backend
   ```

### 🔐 Login Credentials

Use these credentials to access the portal:
- **Email**: `placement@mits.ac.in`
- **Password**: `Mits@1234`

### 🌐 Access URLs

- **Frontend Portal**: http://localhost:3000
- **Backend API Health**: http://localhost:5000/api/health
- **Backend API Base**: http://localhost:5000/api

### 🛠️ What Was Fixed

1. ✅ **Backend Server**: Created Express.js server with API endpoints
2. ✅ **Error Boundaries**: Added error handling to prevent blank screens
3. ✅ **Scripts**: Fixed package.json scripts for dev environment
4. ✅ **Dependencies**: Added missing backend dependencies
5. ✅ **Port Configuration**: Frontend on 3000, Backend on 5000
6. ✅ **ES Modules**: Fixed server.js to work with ES modules
7. ✅ **Health Endpoint**: Added `/api/health` endpoint
8. ✅ **CORS**: Enabled cross-origin requests

### 📁 Project Structure

```
├── src/                    # Frontend React app
│   ├── components/         # UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom hooks
│   └── lib/               # Utilities
├── server.js              # Backend Express server
├── package.json           # Dependencies & scripts
└── vite.config.ts         # Vite configuration
```

### 🔧 Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start only frontend (port 3000)
- `npm run dev:backend` - Start only backend (port 5000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### 🎨 Features

- ✅ **Light/Dark Mode**: Toggle theme in header
- ✅ **Responsive Design**: Works on mobile and desktop
- ✅ **Dashboard**: Overview with stats and quick actions
- ✅ **Navigation**: Sidebar with all portal sections
- ✅ **Authentication**: Login system with token storage
- ✅ **Error Handling**: Graceful error boundaries
- ✅ **Modern UI**: Built with shadcn/ui components

### 🐛 Troubleshooting

If you encounter issues:

1. **Blank Screen**: Check browser console for errors
2. **Port Conflicts**: Make sure ports 3000 and 5000 are free
3. **Dependencies**: Run `npm install` to ensure all packages are installed
4. **Backend Issues**: Check if server.js is running without errors

### 📞 Support

The portal is now fully functional with:
- Frontend running on http://localhost:3000
- Backend API on http://localhost:5000
- Health check at http://localhost:5000/api/health

Enjoy using your CampusHub360 Placement Portal! 🎉
