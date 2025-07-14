import { SignUp } from '@clerk/clerk-react';

const SignUpPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Join StreakFlow</h1>
          <p className="text-muted-foreground">Create your account to start tracking habits</p>
        </div>
        <SignUp 
          routing="path" 
          path="/sign-up"
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

export default SignUpPage; 