import { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useAdminInquiries';
import AdminLoginPrompt from '../components/admin/AdminLoginPrompt';
import InquiryList from '../components/admin/InquiryList';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import BrandMark from '../components/BrandMark';

export default function AdminPage() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminCheckLoading, error: adminError } = useIsCallerAdmin();

  // Show loading state while initializing or checking authentication
  if (isInitializing || (isAuthenticated && (profileLoading || adminCheckLoading))) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandMark size="sm" />
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-12">
          <AdminLoginPrompt />
        </main>
      </div>
    );
  }

  // Show unauthorized message if not admin
  if (isAuthenticated && profileFetched && isAdmin === false) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandMark size="sm" />
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
            <AdminLoginPrompt />
          </div>
        </header>
        <main className="container mx-auto px-4 py-12">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">
              <strong>अनधिकृत पहुंच (Unauthorized Access)</strong>
              <p className="mt-2">
                आपके पास इस पेज को देखने की अनुमति नहीं है। केवल एडमिन यूजर्स ही इस पेज को एक्सेस कर सकते हैं।
              </p>
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  // Show error if admin check failed
  if (adminError) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandMark size="sm" />
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
            <AdminLoginPrompt />
          </div>
        </header>
        <main className="container mx-auto px-4 py-12">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>
              एरर: {adminError instanceof Error ? adminError.message : 'कुछ गलत हो गया'}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  // Show admin dashboard if authenticated and authorized
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandMark size="sm" />
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">
                {userProfile?.name || 'Admin User'}
              </p>
            </div>
          </div>
          <AdminLoginPrompt />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <InquiryList />
      </main>
    </div>
  );
}
