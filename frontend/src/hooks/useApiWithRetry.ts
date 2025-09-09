import { useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import api from '@/lib/api';

export const useApiWithRetry = () => {
  const { getToken } = useAuth();

  const apiCallWithRetry = useCallback(async <T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 1
  ): Promise<T> => {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Get fresh token on each attempt
        const token = await getToken();
        if (token) {
          localStorage.setItem('clerk_token', token);
        }

        return await apiCall();
      } catch (error: any) {
        lastError = error;
        
        // If it's an auth error and we have retries left, try again
        if ((error.response?.status === 401 || error.response?.status === 403) && attempt < maxRetries) {
          const errorData = error.response?.data;
          const isTokenExpired = errorData?.code === 'TOKEN_EXPIRED' || 
                               errorData?.error?.toLowerCase().includes('expired') ||
                               error.response?.headers['x-token-expired'] === 'true';
          
          if (isTokenExpired) {
            console.log(`Token expired, refreshing and retrying... (attempt ${attempt + 1}/${maxRetries + 1})`);
            // Clear the expired token to force a fresh one
            localStorage.removeItem('clerk_token');
            // Wait a bit before retrying to allow token refresh
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            console.log(`Auth error, retrying... (attempt ${attempt + 1}/${maxRetries + 1})`);
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue;
        }
        
        // If it's not an auth error or we're out of retries, throw the error
        throw error;
      }
    }

    throw lastError;
  }, [getToken]);

  return { apiCallWithRetry };
}; 