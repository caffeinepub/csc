import { useEffect, useState } from 'react';
import { useOfficialLogin } from '../hooks/useOfficialLogin';
import { useGetAllInquiries } from '../hooks/useAdminInquiries';
import { useAdminActor } from '../hooks/useAdminActor';
import { useQueryClient } from '@tanstack/react-query';
import { navigateTo } from '../utils/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import InquiryList from '../components/admin/InquiryList';
import { BulkExportActions } from '../components/admin/InquiryActions';
import { LogOut, Loader2, AlertCircle, Inbox, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import BrandMark from '../components/BrandMark';
import { 
  getErrorMessage, 
  isAuthorizationError, 
  extractReplicaRejectionDetails,
  formatReplicaRejectionMessage,
  isReplicaRejectionError 
} from '../utils/adminError';

export default function AdminPage() {
  const { isOfficiallyLoggedIn, logout } = useOfficialLogin();
  const { retry: retryAdminActor, isReady: isAdminReady } = useAdminActor();
  const { 
    data: inquiries, 
    isLoading, 
    error, 
    safeRefetch, 
    isFetching,
    isAdminSessionInitializing,
    isAdminSessionError,
    adminSessionError,
  } = useGetAllInquiries();
  const queryClient = useQueryClient();
  const [showErrorDetails, setShowErrorDetails] = useState(false);

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

  const handleRefresh = () => {
    safeRefetch();
  };

  const handleRetryInit = () => {
    // Reset error details visibility
    setShowErrorDetails(false);
    // Trigger retry which will clear cache and reinitialize
    retryAdminActor();
  };

  if (!isOfficiallyLoggedIn) {
    return null;
  }

  // Show initializing state when admin session is still setting up
  if (isAdminSessionInitializing) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BrandMark size="sm" />
                <div>
                  <h1 className="text-xl font-bold">Admin Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Inquiry Management</p>
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
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Initializing admin session...</p>
                <p className="text-xs text-muted-foreground mt-2">This may take a few moments</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Show admin session initialization error with appropriate recovery action
  if (isAdminSessionError && adminSessionError) {
    const errorMessage = getErrorMessage(adminSessionError);
    const isAuthError = isAuthorizationError(adminSessionError);
    const isReplicaError = isReplicaRejectionError(adminSessionError);
    const replicaDetails = extractReplicaRejectionDetails(adminSessionError);

    // Determine the primary message and action
    let primaryMessage = errorMessage;
    let showRetry = true;
    let guidanceMessage = '';

    if (replicaDetails) {
      primaryMessage = formatReplicaRejectionMessage(replicaDetails);
      showRetry = true;
      
      if (replicaDetails.isCanisterStopped) {
        guidanceMessage = 'In preview: Confirm the backend service is running in your preview environment, then click Retry.';
      } else {
        guidanceMessage = 'The backend service may be temporarily unavailable. Please try again.';
      }
    } else if (isAuthError) {
      showRetry = false;
      guidanceMessage = 'Your session credentials are invalid. Please log out and log in again.';
    } else if (errorMessage.includes('timed out')) {
      showRetry = true;
      guidanceMessage = 'The initialization request took too long. The backend service may be slow or unavailable.';
    }

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BrandMark size="sm" />
                <div>
                  <h1 className="text-xl font-bold">Admin Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Inquiry Management</p>
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
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Admin Session Initialization Failed
              </CardTitle>
              <CardDescription>
                Unable to initialize admin session. {guidanceMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  <div className="space-y-3">
                    <p>{primaryMessage}</p>
                    
                    {replicaDetails && (replicaDetails.rejectCode !== undefined || replicaDetails.requestId) && (
                      <div className="mt-3">
                        <button
                          onClick={() => setShowErrorDetails(!showErrorDetails)}
                          className="flex items-center gap-2 text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-destructive/50 rounded px-1"
                        >
                          {showErrorDetails ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Show Details
                            </>
                          )}
                        </button>
                        
                        {showErrorDetails && (
                          <div className="mt-2 p-3 bg-destructive/10 rounded-md text-sm font-mono space-y-1">
                            {replicaDetails.rejectCode !== undefined && (
                              <div>
                                <span className="font-semibold">Reject Code:</span> {replicaDetails.rejectCode}
                              </div>
                            )}
                            {replicaDetails.requestId && (
                              <div>
                                <span className="font-semibold">Request ID:</span> {replicaDetails.requestId}
                              </div>
                            )}
                            <div className="pt-2 border-t border-destructive/20">
                              <span className="font-semibold">Full Error:</span>
                              <div className="mt-1 text-xs break-all">{errorMessage}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      {showRetry ? (
                        <Button variant="outline" size="sm" onClick={handleRetryInit}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Retry
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Disable refresh button during initialization or active fetch
  const isRefreshDisabled = isAdminSessionInitializing || isFetching;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandMark size="sm" />
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Inquiry Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshDisabled}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading inquiries...</p>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Error Loading Inquiries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Failed to load inquiries</AlertTitle>
                <AlertDescription>
                  <p className="mb-3">{getErrorMessage(error)}</p>
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : inquiries && inquiries.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Inquiries</h2>
                <p className="text-sm text-muted-foreground">
                  {inquiries.length} total inquiry{inquiries.length !== 1 ? 's' : ''}
                </p>
              </div>
              <BulkExportActions inquiries={inquiries} />
            </div>
            <InquiryList inquiries={inquiries} />
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12">
                <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No inquiries yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  New inquiries will appear here when submitted
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={isRefreshDisabled}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                  {isFetching ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
