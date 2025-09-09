import { SignUp } from '@clerk/clerk-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UserPlus } from 'lucide-react';

const SignUpPage = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-full bg-muted/50 p-3">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Join StreakFlow</h1>
          <p className="text-muted-foreground">Create your account to start tracking habits</p>
        </div>
        <SignUp 
          routing="path" 
          path="/sign-up"
          appearance={{
            baseTheme: theme === 'dark' ? 'dark' : 'light',
            variables: {
              colorPrimary: theme === 'dark' ? '#8B5CF6' : '#8B5CF6',
              colorBackground: theme === 'dark' ? '#0F0F0F' : '#FFFFFF',
              colorInputBackground: theme === 'dark' ? '#1A1A1A' : '#FFFFFF',
              colorInputText: theme === 'dark' ? '#FFFFFF' : '#000000',
              colorText: theme === 'dark' ? '#FFFFFF' : '#000000',
              colorTextSecondary: theme === 'dark' ? '#A1A1AA' : '#6B7280',
              colorDanger: theme === 'dark' ? '#EF4444' : '#DC2626',
              colorSuccess: theme === 'dark' ? '#10B981' : '#059669',
              borderRadius: '0.5rem',
            },
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border-0 bg-transparent",
              headerTitle: theme === 'dark' ? "text-white" : "text-gray-900",
              headerSubtitle: theme === 'dark' ? "text-gray-300" : "text-gray-600",
              socialButtonsBlockButton: theme === 'dark' 
                ? "border-gray-600 hover:bg-gray-800 text-white bg-gray-900" 
                : "border-gray-300 hover:bg-gray-50 text-gray-900 bg-white",
              formButtonPrimary: theme === 'dark'
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white",
              footerActionLink: theme === 'dark' 
                ? "text-purple-400 hover:text-purple-300" 
                : "text-purple-600 hover:text-purple-700",
              identityPreviewText: theme === 'dark' ? "text-white" : "text-gray-900",
              formFieldInput: theme === 'dark'
                ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500",
              formFieldLabel: theme === 'dark' ? "text-white" : "text-gray-900",
              dividerLine: theme === 'dark' ? "bg-gray-600" : "bg-gray-300",
              dividerText: theme === 'dark' ? "text-gray-400" : "text-gray-500",
              formResendCodeLink: theme === 'dark' 
                ? "text-purple-400 hover:text-purple-300" 
                : "text-purple-600 hover:text-purple-700",
              otpCodeFieldInput: theme === 'dark'
                ? "bg-gray-900 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900",
              formFieldSuccessText: theme === 'dark' ? "text-green-400" : "text-green-600",
              formFieldErrorText: theme === 'dark' ? "text-red-400" : "text-red-600",
              formFieldWarningText: theme === 'dark' ? "text-yellow-400" : "text-yellow-600",
              formFieldHintText: theme === 'dark' ? "text-gray-400" : "text-gray-500",
              identityPreviewEditButton: theme === 'dark' 
                ? "text-purple-400 hover:text-purple-300" 
                : "text-purple-600 hover:text-purple-700",
              footerActionText: theme === 'dark' ? "text-gray-300" : "text-gray-600",
              formHeaderTitle: theme === 'dark' ? "text-white" : "text-gray-900",
              formHeaderSubtitle: theme === 'dark' ? "text-gray-300" : "text-gray-600",
            }
          }}
        />
      </div>
    </div>
  );
};

export default SignUpPage; 