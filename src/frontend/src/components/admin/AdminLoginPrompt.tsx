import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminLoginPrompt() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      window.location.href = '/admin';
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6">
        <Alert>
          <AlertDescription className="text-base">
            <strong>Admin Access Required</strong>
            <p className="mt-2">
              इस पेज को देखने के लिए कृपया Internet Identity से लॉगिन करें।
            </p>
          </AlertDescription>
        </Alert>
        <Button
          onClick={handleAuth}
          disabled={isLoggingIn}
          size="lg"
          className="w-full sm:w-auto"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              लॉगिन हो रहा है...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-5 w-5" />
              Login with Internet Identity
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleAuth}
      variant="outline"
      size="sm"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}
