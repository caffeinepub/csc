import { useEffect } from 'react';
import { useOfficialLogin } from '../hooks/useOfficialLogin';
import { useGetAllInquiries } from '../hooks/useAdminInquiries';
import { useQueryClient } from '@tanstack/react-query';
import { navigateTo } from '../utils/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InquiryList from '../components/admin/InquiryList';
import { BulkExportActions } from '../components/admin/InquiryActions';
import { LogOut, Loader2, AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import BrandMark from '../components/BrandMark';
import { getErrorMessage, isAuthorizationError } from '../utils/adminError';

export default function AdminPage() {
  const { isOfficiallyLoggedIn, logout } = useOfficialLogin();
  const { data: inquiries, isLoading, error, refetch, isFetching } = useGetAllInquiries();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isOfficiallyLoggedIn) {
      navigateTo('/', true);
    }
  }, [isOfficiallyLoggedIn]);

  const handleLogout = () => {
    // Clear all cached data
    queryClient.clear();
    logout();
    navigateTo('/');
  };

  if (!isOfficiallyLoggedIn) {
    return null;
  }

  // Extract error message and determine if it's an auth error
  const errorMessage = error ? getErrorMessage(error) : '';
  const isAuthError = error ? isAuthorizationError(error) : false;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandMark size="sm" />
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">पूछताछ प्रबंधन</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Inbox className="h-5 w-5" />
                  सभी पूछताछ
                </CardTitle>
                <CardDescription>सभी प्राप्त पूछताछ देखें और प्रबंधित करें</CardDescription>
              </div>
              {inquiries && inquiries.length > 0 && (
                <BulkExportActions inquiries={inquiries} />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{errorMessage}</span>
                  <div className="flex gap-2 ml-4">
                    {isAuthError ? (
                      <Button variant="outline" size="sm" onClick={handleLogout}>
                        Logout
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                        {isFetching ? 'Retrying...' : 'Retry'}
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ) : inquiries && inquiries.length > 0 ? (
              <InquiryList inquiries={inquiries} />
            ) : (
              <div className="text-center py-12">
                <Inbox className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No inquiries yet</h3>
                <p className="text-muted-foreground mb-6">
                  New inquiries submitted through the contact form will appear here.
                </p>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                  {isFetching ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
