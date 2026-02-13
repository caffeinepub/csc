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
  isReplicaRejectionError,
  isBackendInitializationBug,
  isRecoverableError,
  isAdminSecretAlreadyUsedError
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

  // Handle inquiry fetch errors that might indicate stale admin session
  const handleRetryInquiries = () => {
    // If we have an authorization error on inquiry fetch, reinitialize admin session first
    if (inquiriesError && isAuthorizationError(inquiriesError)) {
      console.log('Authorization error on inquiry fetch - reinitializing admin session');
      retryAdminActor();
    } else {
      // Otherwise just refetch inquiries
      safeRefetch();
    }
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
                    Setting up secure connection to backend...
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
    const isAuthError = isAuthorizationError(adminError);
    const isReplicaError = isReplicaRejectionError(adminError);
    const replicaDetails = extractReplicaRejectionDetails(adminError);
    const isInitBug = isBackendInitializationBug(adminError);
    const isRecoverable = isRecoverableError(adminError);
    const isAlreadyUsedError = isAdminSecretAlreadyUsedError(adminError);

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
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">Admin Session Initialization Failed</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p className="text-base">{errorMessage}</p>

              {isAlreadyUsedError && (
                <div className="bg-muted/50 p-4 rounded-md border border-border">
                  <p className="text-sm font-medium mb-2">What does this mean?</p>
                  <p className="text-sm text-muted-foreground">
                    The admin session has already been initialized in a previous session. This is normal behavior. 
                    Click <strong>Retry Initialization</strong> below to proceed with loading your admin dashboard.
                  </p>
                </div>
              )}

              {isInitBug && (
                <div className="bg-muted/50 p-4 rounded-md border border-border">
                  <p className="text-sm font-medium mb-2">Backend Code Issue Detected</p>
                  <p className="text-sm text-muted-foreground">
                    The backend accepted your admin credentials but failed to grant admin privileges. 
                    This requires updating the backend code to properly assign the admin role after secret validation.
                  </p>
                </div>
              )}

              {isReplicaError && replicaDetails && (
                <div className="bg-muted/50 p-4 rounded-md border border-border">
                  <p className="text-sm font-medium mb-2">Backend Service Issue</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {formatReplicaRejectionMessage(replicaDetails)}
                  </p>
                  {replicaDetails.isCanisterStopped && (
                    <p className="text-sm text-muted-foreground">
                      Please contact your system administrator to start the backend canister.
                    </p>
                  )}
                </div>
              )}

              {/* Technical Details (Collapsible) */}
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  className="w-full justify-between"
                >
                  <span className="text-sm font-medium">
                    {showErrorDetails ? 'Hide' : 'Show'} Technical Details
                  </span>
                  {showErrorDetails ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>

                {showErrorDetails && (
                  <div className="mt-3 bg-muted p-4 rounded-md space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Error Message:</p>
                      <p className="text-xs font-mono break-all">{errorMessage}</p>
                    </div>
                    {replicaDetails?.rejectCode !== undefined && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Reject Code:</p>
                        <p className="text-xs font-mono">{replicaDetails.rejectCode}</p>
                      </div>
                    )}
                    {replicaDetails?.requestId && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Request ID:</p>
                        <p className="text-xs font-mono break-all">{replicaDetails.requestId}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {/* Primary action: Retry for recoverable errors, Logout for auth errors */}
                {isRecoverable ? (
                  <>
                    <Button
                      onClick={handleRetryInit}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry Initialization
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="flex-1"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleRetryInit}
                      className="flex-1"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry Initialization
                    </Button>
                    <Button
                      onClick={handleLogout}
                      className="flex-1 bg-destructive hover:bg-destructive/90"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                )}
              </div>

              {isAuthError && !isRecoverable && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  If you continue to see this error, your credentials may be invalid. Please log out and try again.
                </p>
              )}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  // Admin session is ready - show the dashboard
  const isLoading = isInquiriesLoading || isInquiriesFetching;
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
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
        {inquiriesError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to Load Inquiries</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>{getErrorMessage(inquiriesError)}</p>
              {isAuthorizationError(inquiriesError) && (
                <div className="bg-muted/50 p-3 rounded-md border border-border">
                  <p className="text-sm text-muted-foreground">
                    Your admin session may have expired or become invalid. 
                    Click <strong>Reinitialize Session</strong> to restore access.
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRetryInquiries}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {isAuthorizationError(inquiriesError) ? 'Reinitialize Session' : 'Try Again'}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading inquiries...</p>
              </div>
            </CardContent>
          </Card>
        ) : !hasInquiries ? (
          <Card>
            <CardHeader>
              <CardTitle>No Inquiries Yet</CardTitle>
              <CardDescription>
                When customers submit inquiries through the contact form, they will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-muted-foreground">
                <Inbox className="h-16 w-16" />
                <p>Your inquiry list is empty</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Inquiries</h2>
                <p className="text-sm text-muted-foreground">
                  {inquiries.length} total {inquiries.length === 1 ? 'inquiry' : 'inquiries'}
                </p>
              </div>
              <BulkExportActions inquiries={inquiries} />
            </div>
            <InquiryList inquiries={inquiries} />
          </div>
        )}
      </main>
    </div>
  );
}
