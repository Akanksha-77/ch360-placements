import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { authService, SessionDetails } from '@/lib/auth';
import { MapPin, Clock, Monitor, Globe, RefreshCw } from 'lucide-react';

export function SessionTracker() {
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const collectSessionInfo = async () => {
    setIsLoading(true);
    try {
      const details = await authService.collectSessionDetails();
      setSessionDetails(details);
    } catch (error) {
      console.error('Failed to collect session details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    collectSessionInfo();
  }, []);

  if (!sessionDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading session details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Session Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Login Time */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="font-medium">Login Time:</span>
          <span className="text-sm text-gray-600">
            {new Date(sessionDetails.login_at).toLocaleString()}
          </span>
        </div>

        {/* IP Address */}
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-green-600" />
          <span className="font-medium">IP Address:</span>
          <Badge variant="outline">{sessionDetails.ip}</Badge>
        </div>

        {/* Location */}
        {(sessionDetails.country || sessionDetails.region || sessionDetails.city) && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-red-600" />
            <span className="font-medium">Location:</span>
            <span className="text-sm text-gray-600">
              {[sessionDetails.city, sessionDetails.region, sessionDetails.country]
                .filter(Boolean)
                .join(', ') || 'Unknown'}
            </span>
          </div>
        )}

        {/* Device Info */}
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-purple-600" />
          <span className="font-medium">Device:</span>
          <div className="flex gap-1">
            <Badge variant="secondary">{sessionDetails.device}</Badge>
            <Badge variant="outline">{sessionDetails.os}</Badge>
            <Badge variant="outline">{sessionDetails.browser}</Badge>
          </div>
        </div>

        {/* Coordinates (if available) */}
        {(sessionDetails.latitude && sessionDetails.longitude) && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-orange-600" />
            <span className="font-medium">Coordinates:</span>
            <span className="text-sm text-gray-600">
              {sessionDetails.latitude.toFixed(4)}, {sessionDetails.longitude.toFixed(4)}
            </span>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={collectSessionInfo}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


