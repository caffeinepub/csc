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
  formatAdminInitErrorMessage,
  isReplicaRejectionError,
  isRecoverableError,
} from '../utils/adminError';

export default function AdminPage() {
  const { isOfficiallyLoggedIn, logout } = useOfficialLogin();
  const { retry: retryAdminActor, isReady: isAdminReady, isInitializing: isAdminInitializing, isError: isAdminError, error: adminError } = useAdminActor();
  const { 
    data: inquiries, 
    isLoading: isInquiriesLoading, 
    error: inquiriesError, 
    safeRefetch, 
    isFetching: isInquiriesFetching,
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

  // Handle inquiry fetch errors - no auto-retry to prevent loops
  const handleRetryInquiries = () => {
    // Just refetch inquiries - self-healing already attempted once
    safeRefetch();
  };

  if (!isOfficiallyLoggedIn) {
    return null;
  }

  // Show initializing state when admin session is still setting up
  if (isAdminInitializing) {
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
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold">Initializing Admin Session</h2>
                  <p className="text-muted-foreground">
                    Connecting to backend service...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Show error state if admin session initialization failed
  if (isAdminError && adminError) {
    const errorMessage = getErrorMessage(adminError);
    const isRecoverable = isRecoverableError(adminError);
    const isAuthError = isAuthorizationError(adminError);
    const replicaDetails = extractReplicaRejectionDetails(adminError);

    // Build primary user-facing message with inline replica details
    const primaryMessage = formatAdminInitErrorMessage(adminError);

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
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">Admin Session Initialization Failed</AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p className="text-sm leading-relaxed whitespace-pre-line">{primaryMessage}</p>
              
              {/* Collapsible technical details */}
              {(replicaDetails || errorMessage.length > 200) && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowErrorDetails(!showErrorDetails)}
                    className="flex items-center gap-2 text-sm font-medium hover:underline"
                  >
                    {showErrorDetails ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Hide Technical Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show Technical Details
                      </>
                    )}
                  </button>
                  
                  {showErrorDetails && (
                    <div className="mt-2 p-3 bg-muted/50 rounded-md">
                      <p className="text-xs font-mono break-all">{errorMessage}</p>
                      {replicaDetails && (
                        <div className="mt-2 text-xs space-y-1">
                          {replicaDetails.rejectCode !== undefined && (
                            <p><span className="font-semibold">Reject Code:</span> {replicaDetails.rejectCode}</p>
                          )}
                          {replicaDetails.requestId && (
                            <p><span className="font-semibold">Request ID:</span> {replicaDetails.requestId}</p>
                          )}
                          {replicaDetails.healthCheckFailed && (
                            <p className="text-destructive font-semibold">Health check failed - backend service is not responding</p>
                          )}
                          {replicaDetails.isCanisterStopped && (
                            <p className="text-destructive font-semibold">Backend canister is stopped</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 mt-4">
                {isRecoverable ? (
                  <>
                    <Button onClick={handleRetryInit} variant="default">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry Initialization
                    </Button>
                    <Button onClick={handleLogout} variant="outline">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : isAuthError ? (
                  <>
                    <Button onClick={handleLogout} variant="default">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                    <Button onClick={handleRetryInit} variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleRetryInit} variant="default">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                    <Button onClick={handleLogout} variant="outline">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  // Admin session ready - show dashboard
  if (isAdminReady) {
    // Show inquiry loading state
    if (isInquiriesLoading) {
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
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-semibold">Loading Inquiries</h2>
                    <p className="text-muted-foreground">
                      Fetching inquiry data from backend...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      );
    }

    // Show inquiry fetch error state (separate from initialization errors)
    if (inquiriesError) {
      const errorMessage = getErrorMessage(inquiriesError);
      const isAuthError = isAuthorizationError(inquiriesError);

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
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">Failed to Load Inquiries</AlertTitle>
              <AlertDescription className="mt-2 space-y-3">
                <p className="text-sm">{errorMessage}</p>
                
                <div className="flex gap-3 mt-4">
                  <Button onClick={handleRetryInquiries} variant="default">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                  {isAuthError && (
                    <Button onClick={handleRetryInit} variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reinitialize Session
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </main>
        </div>
      );
    }

    // Show dashboard with inquiries
    const hasInquiries = inquiries && inquiries.length > 0;

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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inquiries</CardTitle>
                  <CardDescription>
                    {hasInquiries
                      ? `Manage and respond to customer inquiries (${inquiries.length} total)`
                      : 'No inquiries yet'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isInquiriesFetching}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isInquiriesFetching ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  {hasInquiries && <BulkExportActions inquiries={inquiries} />}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {hasInquiries ? (
                <InquiryList inquiries={inquiries} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Inquiries Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    When customers submit inquiries through your website, they will appear here for you to manage and respond to.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Fallback: should not reach here
  return null;
}
