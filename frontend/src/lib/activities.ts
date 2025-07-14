import api from './api';

export interface Activity {
  id: number;
  title: string;
  category: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  description?: string;
  target_days: number;
  user: number;
  created_at: string;
  updated_at: string;
  current_streak: number;
  best_streak: number;
  total_completions: number;
  completed_today: boolean;
  weekly_progress: number;
  recent_entries: StreakEntry[];
}

export interface StreakEntry {
  id: number;
  date: string;
  activity: number;
  completed: boolean;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateActivityData {
  title: string;
  category: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  description?: string;
  target_days?: number;
}

export interface UpdateActivityData {
  title?: string;
  category?: string;
  color?: string;
  frequency?: 'daily' | 'weekly' | 'custom';
  description?: string;
  target_days?: number;
}

export interface DashboardStats {
  total_activities: number;
  active_streaks: number;
  completed_today: number;
  average_streak: number;
  weekly_progress: number;
  activities: Activity[];
}

export interface CalendarEntry {
  date: string;
  activities: {
    id: number;
    title: string;
    color: string;
    completed: boolean;
    note: string;
  }[];
  total_completed: number;
  total_activities: number;
}

export interface AnalyticsData {
  total_activities: number;
  total_completions: number;
  average_streak: number;
  category_breakdown: Record<string, {
    count: number;
    total_streak: number;
    total_completions: number;
    avg_streak: number;
    avg_completions: number;
  }>;
  message: string;
}

export interface UserProfileStats {
  user: {
    id: number;
    username: string;
    full_name: string;
    email: string;
    first_name: string;
    last_name: string;
    date_joined: string;
    bio: string;
  };
  stats: {
    total_activities: number;
    total_completions: number;
    total_streaks: number;
    longest_streak: number;
    days_active: number;
    completion_rate: number;
  };
  achievements: Array<{
    id: number;
    name: string;
    description: string;
    achieved: boolean;
    icon: string;
  }>;
}

// Helper function to get fresh token
const getFreshToken = async () => {
  try {
    const { useAuth } = await import('@clerk/clerk-react');
    const { getToken } = useAuth();
    const token = await getToken();
    if (token) {
      localStorage.setItem('clerk_token', token);
    }
    return token;
  } catch (error) {
    console.error('Error getting fresh token:', error);
    return localStorage.getItem('clerk_token');
  }
};

// Activity API functions
export const activitiesAPI = {
  // Get all activities
  getActivities: async (): Promise<Activity[]> => {
    const response = await api.get('/activities/');
    return response.data.results || response.data;
  },

  // Get single activity
  getActivity: async (id: number): Promise<Activity> => {
    const response = await api.get(`/activities/${id}/`);
    return response.data;
  },

  // Create activity
  createActivity: async (data: CreateActivityData): Promise<Activity> => {
    const response = await api.post('/activities/', data);
    return response.data;
  },

  // Update activity
  updateActivity: async (id: number, data: UpdateActivityData): Promise<Activity> => {
    const response = await api.put(`/activities/${id}/`, data);
    return response.data;
  },

  // Delete activity
  deleteActivity: async (id: number): Promise<void> => {
    await api.delete(`/activities/${id}/`);
  },

  // Search activities
  searchActivities: async (query?: string, category?: string): Promise<Activity[]> => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    
    const response = await api.get(`/activities/search/?${params.toString()}`);
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/activities/dashboard/');
    return response.data;
  },

  // Complete activity for today
  completeActivity: async (id: number, note?: string): Promise<{ message: string; activity: Activity }> => {
    try {
      const response = await api.post(`/activities/complete/${id}/`, { note });
      return response.data;
    } catch (error: any) {
      // If token expired, try to refresh and retry once
      if (error.response?.status === 403 || error.response?.status === 401) {
        // Clear old token and try to get fresh one
        localStorage.removeItem('clerk_token');
        
        // Wait a moment for token refresh
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Retry the request
        const response = await api.post(`/activities/complete/${id}/`, { note });
        return response.data;
      }
      throw error;
    }
  },

  // Get calendar entries
  getCalendarEntries: async (startDate: string, endDate: string): Promise<CalendarEntry[]> => {
    const response = await api.get(`/activities/calendar/?start_date=${startDate}&end_date=${endDate}`);
    return response.data;
  },

  // Get analytics
  getAnalytics: async (): Promise<AnalyticsData> => {
    const response = await api.get('/activities/analytics/');
    return response.data;
  },

  // Get user profile stats
  getUserProfileStats: async (): Promise<UserProfileStats> => {
    const response = await api.get('/users/profile/stats/');
    return response.data;
  },
};

// Streak Entry API functions
export const entriesAPI = {
  // Get all entries
  getEntries: async (): Promise<StreakEntry[]> => {
    const response = await api.get('/activities/entries/');
    return response.data.results || response.data;
  },

  // Get single entry
  getEntry: async (id: number): Promise<StreakEntry> => {
    const response = await api.get(`/activities/entries/${id}/`);
    return response.data;
  },

  // Create entry
  createEntry: async (data: {
    date: string;
    activity: number;
    completed: boolean;
    note?: string;
  }): Promise<StreakEntry> => {
    const response = await api.post('/activities/entries/', data);
    return response.data;
  },

  // Update entry
  updateEntry: async (id: number, data: {
    completed?: boolean;
    note?: string;
  }): Promise<StreakEntry> => {
    const response = await api.put(`/activities/entries/${id}/`, data);
    return response.data;
  },

  // Delete entry
  deleteEntry: async (id: number): Promise<void> => {
    await api.delete(`/activities/entries/${id}/`);
  },
}; 