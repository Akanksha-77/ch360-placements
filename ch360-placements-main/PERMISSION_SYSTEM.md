# Role and Permission System Implementation

This document describes the role and permission-based authentication system implemented for the CampusHub360 Placement Portal.

## Overview

The system now enforces that only users belonging to the "placement" permission group can access the portal. This is implemented at multiple levels:

1. **Login Level**: Users without placement group membership are denied access during login
2. **Route Level**: All protected routes check for placement permissions
3. **Component Level**: Individual components can check for specific permissions

## API Integration

The system integrates with the Django backend at `http://13.232.220.214:8000/api/auth/token/` and expects:

### User Profile Endpoint
- **URL**: `/api/auth/user/`
- **Method**: GET
- **Headers**: `Authorization: Bearer <access_token>`
- **Response Format**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "first_name": "John",
  "last_name": "Doe",
  "is_active": true,
  "groups": ["placement"],
  "user_permissions": ["auth.view_user", "companies.view_company"]
}
```

## Key Components

### 1. AuthService (`src/lib/auth.ts`)

Enhanced authentication service with permission checking:

```typescript
// Check if user has placement permission
authService.hasPlacementPermission(): boolean

// Check specific group membership
authService.hasGroup(groupName: string): boolean

// Check specific permission
authService.hasPermission(permission: string): boolean

// Get user profile
authService.getUserProfile(): UserProfile | null

// Fetch fresh user profile from API
authService.fetchUserProfile(): Promise<UserProfile>
```

### 2. PermissionGuard (`src/components/permission-guard.tsx`)

Component-level permission checking:

```tsx
<PermissionGuard requiredGroup="placement" requiredPermission="companies.view_company">
  <ProtectedComponent />
</PermissionGuard>
```

### 3. AuthGuard (`src/components/auth-guard.tsx`)

Enhanced route protection that checks:
- User authentication
- User profile existence
- Placement group membership
- User active status

### 4. Permission Utilities (`src/lib/permissions.ts`)

Helper functions and constants:

```typescript
import { hasPlacementAccess, hasPermission, hasGroup } from '@/lib/permissions';

// Check placement access
if (hasPlacementAccess()) {
  // User can access placement portal
}

// Check specific permission
if (hasPermission('companies.add_company')) {
  // User can add companies
}
```

## Permission Flow

1. **User Login**:
   - User enters credentials
   - System authenticates with Django backend
   - System fetches user profile including groups and permissions
   - System checks if user belongs to "placement" group
   - If not, user is denied access and logged out

2. **Route Protection**:
   - AuthGuard checks authentication status
   - If no user profile, fetches from API
   - Verifies placement group membership
   - Verifies user is active
   - Redirects to login if any check fails

3. **Component Protection**:
   - Components can use PermissionGuard for fine-grained control
   - Components can use permission utilities for conditional rendering

## Error Handling

The system handles various error scenarios:

- **Invalid Credentials**: Standard login error
- **Missing Placement Group**: Access denied with clear message
- **Inactive Account**: Account inactive message
- **API Errors**: Graceful fallback with error messages
- **Token Expiry**: Automatic refresh or redirect to login

## Testing

A debug component (`DebugPermissions`) is temporarily added to the Dashboard to help test the permission system. It shows:

- User information
- Account status
- Group memberships
- Permissions
- Placement access status

## Security Features

1. **Token Management**: Automatic token refresh and secure storage
2. **Permission Caching**: User profile cached in localStorage for performance
3. **Automatic Logout**: Users are logged out if permissions change
4. **Route Protection**: All routes protected by default
5. **Component Protection**: Fine-grained permission checking available

## Usage Examples

### Basic Permission Check
```typescript
import { authService } from '@/lib/auth';

if (authService.hasPlacementPermission()) {
  // User can access placement portal
}
```

### Component-Level Protection
```tsx
import { PermissionGuard } from '@/components/permission-guard';

<PermissionGuard requiredGroup="placement">
  <PlacementContent />
</PermissionGuard>
```

### Conditional Rendering
```tsx
import { hasPermission } from '@/lib/permissions';

{hasPermission('companies.add_company') && (
  <AddCompanyButton />
)}
```

## Backend Requirements

The Django backend must:

1. **User Groups**: Have a "placement" group that users can be assigned to
2. **User Profile Endpoint**: Provide `/api/auth/user/` endpoint
3. **Permission System**: Use Django's built-in permission system
4. **JWT Tokens**: Support JWT token authentication

## Configuration

The API base URL is configured in `src/lib/auth.ts`:

```typescript
const API_BASE_URL = 'http://13.232.220.214:8000';
```

To change the API endpoint, update this constant.

## Troubleshooting

### Common Issues

1. **"Access Denied" on Login**:
   - Check if user is assigned to "placement" group in Django admin
   - Verify user account is active

2. **"Failed to load user profile"**:
   - Check if `/api/auth/user/` endpoint exists
   - Verify JWT token is valid
   - Check network connectivity

3. **Permission checks not working**:
   - Ensure user profile is loaded
   - Check browser console for errors
   - Use debug component to verify permissions

### Debug Tools

1. **Debug Component**: Shows current user permissions
2. **Console Debug**: Call `debugUserPermissions()` in browser console
3. **Network Tab**: Check API calls to user profile endpoint

## Future Enhancements

1. **Role-Based UI**: Different UI based on user roles
2. **Permission Inheritance**: Hierarchical permission system
3. **Dynamic Permissions**: Runtime permission updates
4. **Audit Logging**: Track permission changes and access
5. **Multi-Tenant Support**: Organization-specific permissions


