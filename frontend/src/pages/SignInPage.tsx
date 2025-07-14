import { SignIn } from '@clerk/clerk-react';

const SignInPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to StreakFlow</h1>
          <p className="text-muted-foreground">Sign in to continue tracking your habits</p>
        </div>
        <SignIn 
          routing="path" 
          path="/sign-in"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-none border-0 bg-transparent",
            }
          }}
        />
      </div>
    </div>
  );
};

export default SignInPage; 