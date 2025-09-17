import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth';
import { debugUserPermissions } from '@/lib/permissions';
import { User, Shield, Users, CheckCircle, XCircle } from 'lucide-react';

export function DebugPermissions() {
  const [userProfile, setUserProfile] = useState(authService.getUserProfile());
  const [isLoading, setIsLoading] = useState(false);

  const refreshProfile = async () => {
    setIsLoading(true);
    try {
      const profile = await authService.fetchUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userProfile) {
      refreshProfile();
    }
  }, [userProfile]);

  if (!userProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permission Debug
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading user profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Permission Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="font-medium">User:</span>
          <span>{userProfile.first_name} {userProfile.last_name}</span>
          <span className="text-gray-500">({userProfile.email})</span>
        </div>

        {/* Account Status */}
        <div className="flex items-center gap-2">
          {userProfile.is_active ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <span className="font-medium">Status:</span>
          <Badge variant={userProfile.is_active ? "default" : "destructive"}>
            {userProfile.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Placement Access */}
        <div className="flex items-center gap-2">
          {authService.hasPlacementPermission() ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <span className="font-medium">Placement Access:</span>
          <Badge variant={authService.hasPlacementPermission() ? "default" : "destructive"}>
            {authService.hasPlacementPermission() ? "Granted" : "Denied"}
          </Badge>
        </div>

        {/* Groups */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4" />
            <span className="font-medium">Groups:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {userProfile.groups.length > 0 ? (
              userProfile.groups.map((group) => (
                <Badge key={group} variant="secondary">
                  {group}
                </Badge>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No groups assigned</span>
            )}
          </div>
        </div>

        {/* Permissions */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Permissions:</span>
          </div>
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            {userProfile.user_permissions.length > 0 ? (
              userProfile.user_permissions.map((permission) => (
                <Badge key={permission} variant="outline" className="text-xs">
                  {permission}
                </Badge>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No permissions assigned</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshProfile}
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh Profile"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={debugUserPermissions}
          >
            Debug Console
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


