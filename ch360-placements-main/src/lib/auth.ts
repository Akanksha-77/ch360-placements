import axios, { AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const ENABLE_MOCK_AUTH = (import.meta as any)?.env?.VITE_MOCK_AUTH === 'true' || (typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.hostname));
const TOKEN_ENDPOINT = '/api/auth/token/';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_EMAIL_KEY = 'user_email';
const USER_PROFILE_KEY = 'user_profile';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  groups: string[];
  permissions: string[];
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  groups: string[];
  user_permissions: string[];
}

export interface SessionDetails {
  ip: string;
  login_at: string;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  user_agent: string;
  browser: string;
  os: string;
  device: string;
}

// Auth Service Class
class AuthService {
  private axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.setupInterceptors();
  }

  // Setup axios interceptors for automatic token handling
  private setupInterceptors() {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const newTokens = await this.refreshAccessToken(refreshToken);
              this.setTokens(newTokens.access, newTokens.refresh);
              
              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            this.logout();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Login method
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    try {
      console.log('=== AUTH SERVICE LOGIN ===');
      console.log('Credentials received:', credentials);
      
      // In development or when explicitly enabled, bypass backend and use mock auth
      if (ENABLE_MOCK_AUTH) {
        const mockAccess = 'mock.access.token';
        const mockRefresh = 'mock.refresh.token';
        this.setTokens(mockAccess, mockRefresh);
        this.setUserEmail(credentials.email);
        // Set a minimal profile so the app can proceed
        const mockProfile: UserProfile = {
          id: 1,
          email: credentials.email,
          username: credentials.email.split('@')[0] || credentials.email,
          first_name: 'Campus',
          last_name: 'User',
          is_active: true,
          groups: ['placement'],
          user_permissions: []
        };
        this.setUserProfile(mockProfile);
        return { access: mockAccess, refresh: mockRefresh };
      }
      
      // PERMANENT login format: form-encoded username/password to /api/auth/token/
      const usernameFromEmail = credentials.email.includes('@')
        ? credentials.email.split('@')[0]
        : credentials.email;

      const attemptFormLogin = async (username: string) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', credentials.password);
        const response: AxiosResponse<any> = await this.axiosInstance.post(
          TOKEN_ENDPOINT,
          formData,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        return response;
      };

      let response: AxiosResponse<any> | null = null;
      let lastError: any = null;

      // 1) Try username without domain
      try {
        response = await attemptFormLogin(usernameFromEmail);
      } catch (e) {
        lastError = e;
      }

      // 2) Fallback: try full email as username
      if (!response) {
        try {
          response = await attemptFormLogin(credentials.email);
        } catch (e2) {
          lastError = e2;
        }
      }

      if (!response) {
        throw lastError || new Error('Login failed');
      }

          // Handle different response formats
          let accessToken: string;
          let refreshToken: string;

      if (response.data.access && response.data.refresh) {
        // Standard JWT format
        accessToken = response.data.access;
        refreshToken = response.data.refresh;
      } else if (response.data.access_token && response.data.refresh_token) {
        // Alternative format
        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;
      } else if (response.data.token) {
        // Single token format
        accessToken = response.data.token;
        refreshToken = response.data.token; // Use same token for refresh
      } else {
        throw new Error('Invalid response format: missing tokens');
      }

      this.setTokens(accessToken, refreshToken);
      this.setUserEmail(credentials.email);

      // Fetch user profile after successful login
      try {
        await this.fetchUserProfile();
      } catch (profileError) {
        console.warn('Failed to fetch user profile:', profileError);
        // Don't block login if profile fetch fails
      }

      // Collect and send session details
      try {
        const sessionDetails = await this.collectSessionDetails();
        await this.sendSessionDetails(sessionDetails);
        console.log('Session details collected:', sessionDetails);
      } catch (sessionError) {
        console.warn('Failed to collect session details:', sessionError);
        // Don't block login if session tracking fails
      }

      return {
        access: accessToken,
        refresh: refreshToken
      };
    } catch (error: any) {
      console.error('Login error:', error);
      // Fallback to mock auth if backend is unreachable
      if (ENABLE_MOCK_AUTH) {
        const mockAccess = 'mock.access.token';
        const mockRefresh = 'mock.refresh.token';
        this.setTokens(mockAccess, mockRefresh);
        this.setUserEmail(credentials.email);
        const mockProfile: UserProfile = {
          id: 1,
          email: credentials.email,
          username: credentials.email.split('@')[0] || credentials.email,
          first_name: 'Campus',
          last_name: 'User',
          is_active: true,
          groups: ['placement'],
          user_permissions: []
        };
        this.setUserProfile(mockProfile);
        return { access: mockAccess, refresh: mockRefresh };
      }
      throw error;
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    try {
      // Try different refresh token formats
      const refreshPayloads = [
        { refresh: refreshToken },
        { refresh_token: refreshToken },
        { token: refreshToken }
      ];

      let lastError: any = null;

      for (const payload of refreshPayloads) {
        try {
          const response: AxiosResponse<any> = await this.axiosInstance.post(
            '/api/auth/token/refresh/',
            payload
          );

          // Handle different response formats
          let accessToken: string;
          let newRefreshToken: string;

          if (response.data.access && response.data.refresh) {
            accessToken = response.data.access;
            newRefreshToken = response.data.refresh;
          } else if (response.data.access_token && response.data.refresh_token) {
            accessToken = response.data.access_token;
            newRefreshToken = response.data.refresh_token;
          } else if (response.data.token) {
            accessToken = response.data.token;
            newRefreshToken = response.data.token;
          } else {
            throw new Error('Invalid refresh response format');
          }

          return {
            access: accessToken,
            refresh: newRefreshToken
          };
        } catch (error: any) {
          lastError = error;
          continue;
        }
      }

      throw lastError || new Error('Token refresh failed');
    } catch (error: any) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  // Fetch user profile
  async fetchUserProfile(): Promise<UserProfile> {
    try {
      const response: AxiosResponse<any> = await this.axiosInstance.get('/api/auth/user/');
      const data = response.data;
      
      // Handle different user profile response formats
      let userProfile: UserProfile;
      
      if (data.user_permissions !== undefined) {
        // Standard format
        userProfile = data;
      } else if (data.permissions !== undefined) {
        // Alternative format with 'permissions' instead of 'user_permissions'
        userProfile = {
          ...data,
          user_permissions: data.permissions
        };
      } else {
        // Fallback format - create a basic profile
        userProfile = {
          id: data.id || 0,
          email: data.email || this.getUserEmail() || '',
          username: data.username || data.email || '',
          first_name: data.first_name || data.firstName || '',
          last_name: data.last_name || data.lastName || '',
          is_active: data.is_active !== undefined ? data.is_active : true,
          groups: data.groups || data.roles || [],
          user_permissions: data.user_permissions || data.permissions || []
        };
      }
      
      this.setUserProfile(userProfile);
      return userProfile;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // If profile fetch fails, create a minimal profile to allow login
      const minimalProfile: UserProfile = {
        id: 0,
        email: this.getUserEmail() || '',
        username: this.getUserEmail() || '',
        first_name: '',
        last_name: '',
        is_active: true,
        groups: ['placement'], // Assume placement group for now
        user_permissions: []
      };
      this.setUserProfile(minimalProfile);
      return minimalProfile;
    }
  }

  // Logout method
  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(USER_PROFILE_KEY);
  }

  // Token management methods
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setUserEmail(email: string): void {
    localStorage.setItem(USER_EMAIL_KEY, email);
  }

  getUserEmail(): string | null {
    return localStorage.getItem(USER_EMAIL_KEY);
  }

  setUserProfile(userProfile: UserProfile): void {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userProfile));
  }

  getUserProfile(): UserProfile | null {
    const profileStr = localStorage.getItem(USER_PROFILE_KEY);
    if (!profileStr) return null;
    try {
      return JSON.parse(profileStr);
    } catch {
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }

    // For mock tokens, just check if they exist
    if (token.startsWith('mock_') || token.includes('mock')) {
      return true;
    }

    try {
      // Check if token is expired (only for real JWT tokens)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp <= currentTime;
      
      if (isExpired) {
        // Clear expired token
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      // For non-JWT tokens (like mock tokens), just check if they exist
      return token.length > 0;
    }
  }

  // Get current user info
  getCurrentUser(): User | null {
    const email = this.getUserEmail();
    const profile = this.getUserProfile();
    if (!email || !this.isAuthenticated() || !profile) return null;

    return {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      first_name: profile.first_name,
      last_name: profile.last_name,
      is_active: profile.is_active,
      groups: profile.groups,
      permissions: profile.user_permissions,
    };
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    const profile = this.getUserProfile();
    if (!profile) return false;
    return profile.user_permissions.includes(permission);
  }

  // Check if user belongs to specific group
  hasGroup(groupName: string): boolean {
    const profile = this.getUserProfile();
    if (!profile) return false;
    return profile.groups.includes(groupName);
  }

  // Check if user has placement permission (main requirement)
  hasPlacementPermission(): boolean {
    return this.hasGroup('placement');
  }

  // Check if user is active
  isUserActive(): boolean {
    const profile = this.getUserProfile();
    return profile ? profile.is_active : false;
  }

  // Get client IP address
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Failed to get public IP, using localhost');
      return '127.0.0.1';
    }
  }

  // Get location details from IP
  private async getLocationFromIP(ip: string): Promise<{
    country: string | null;
    region: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
  }> {
    // Avoid CORS/429 issues in dev by disabling external geolocation unless explicitly enabled
    const enableGeo = (import.meta as any)?.env?.VITE_ENABLE_GEO === 'true';
    const isLocalhost = typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.hostname);

    if (!enableGeo || isLocalhost) {
      return { country: null, region: null, city: null, latitude: null, longitude: null };
    }

    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`, { method: 'GET' });
      if (!response.ok) {
        return { country: null, region: null, city: null, latitude: null, longitude: null };
      }
      const data = await response.json();
      return {
        country: data.country_name || null,
        region: data.region || null,
        city: data.city || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
      };
    } catch {
      return { country: null, region: null, city: null, latitude: null, longitude: null };
    }
  }

  // Parse user agent to get browser and OS info
  private parseUserAgent(userAgent: string): {
    browser: string;
    os: string;
    device: string;
  } {
    // Browser detection
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';

    // OS detection
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    // Device detection
    let device = 'Desktop';
    if (userAgent.includes('Mobile')) device = 'Mobile';
    else if (userAgent.includes('Tablet')) device = 'Tablet';

    return { browser, os, device };
  }

  // Collect session details
  async collectSessionDetails(): Promise<SessionDetails> {
    const userAgent = navigator.userAgent;
    const { browser, os, device } = this.parseUserAgent(userAgent);
    const ip = await this.getClientIP();
    const location = await this.getLocationFromIP(ip);

    return {
      ip,
      login_at: new Date().toISOString(),
      country: location.country,
      region: location.region,
      city: location.city,
      latitude: location.latitude,
      longitude: location.longitude,
      user_agent: userAgent,
      browser,
      os,
      device,
    };
  }

  // Send session details to backend
  async sendSessionDetails(sessionDetails: SessionDetails): Promise<void> {
    try {
      await this.axiosInstance.post('/api/auth/session/', sessionDetails);
    } catch (error) {
      console.warn('Failed to send session details to backend:', error);
      // Don't throw error as this shouldn't block login
    }
  }

  // Health check method to test endpoint connectivity
  async healthCheck(): Promise<boolean> {
    // 1) Probe token endpoint with OPTIONS (should not require auth)
    try {
      const response = await this.axiosInstance.request({
        method: 'OPTIONS',
        url: TOKEN_ENDPOINT,
      });
      // Many backends return 200/204 for OPTIONS; consider that healthy
      if (response.status >= 200 && response.status < 300) return true;
    } catch (err: any) {
      // Some servers don't support OPTIONS and return 405 - still indicates reachability
      const status = err?.response?.status;
      if (status === 405 || status === 401) {
        // 405 Method Not Allowed or 401 Unauthorized still proves endpoint exists
        return true;
      }
    }

    // 2) As a last resort, HEAD request to base URL to check server reachability
    try {
      const response = await this.axiosInstance.head('/');
      return response.status >= 200 && response.status < 500; // any non-network response means reachable
    } catch (_) {
      return false;
    }
  }

  // Get axios instance for making authenticated requests
  getAxiosInstance() {
    return this.axiosInstance;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;

