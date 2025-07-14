
import { Moon, Sun, Monitor, LogOut } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClerkAuth } from '@/contexts/ClerkAuthContext';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import React from 'react';

const SettingsView = () => {
  const { theme, setTheme } = useTheme();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const { user, updateProfile, isLoading: authLoading } = useClerkAuth();

  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(user?.email_notifications ?? true);
  const [reminderTime, setReminderTime] = useState(user?.reminder_time || '12:00');
  const [saving, setSaving] = useState(false);

  // Update local state when user changes
  React.useEffect(() => {
    setEmailNotifications(user?.email_notifications ?? true);
    setReminderTime(user?.reminder_time || '12:00');
  }, [user]);

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await updateProfile({
        email_notifications: emailNotifications,
        reminder_time: reminderTime,
      });
      toast({ title: 'Notification settings updated!' });
    } catch (err) {
      toast({ title: 'Failed to update notification settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const handleLogout = async () => {
    try {
      // Sign out from Clerk
      await signOut();
      
      // Clear any stored data
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('User logged out successfully');
      
      // Navigate to the home page or login page
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback: clear storage and reload
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">App preferences and notifications</p>
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="max-w-2xl">
          {/* Theme Settings */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Theme
                </label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Choose how StreakFlow looks to you
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant={theme === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                      className="flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Sign Out</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sign out of your account</p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </Button>
              </div>
            </div>
          </div>

          {/* Other Settings Sections */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h3>
            {authLoading ? (
              <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            ) : (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSaveNotifications();
                }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">Email Reminders</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive motivational and end-of-day reminder emails</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    id="email-notifications"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="reminder-time" className="text-sm font-medium text-gray-900 dark:text-white">Preferred Reminder Time</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">When should we send your daily motivational email?</p>
                  </div>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={reminderTime}
                    onChange={e => setReminderTime(e.target.value)}
                    className="w-32"
                    disabled={!emailNotifications}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data & Privacy</h3>
            <p className="text-gray-600 dark:text-gray-400">Data management options coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsView;
