import { useEffect } from 'react';
import { useOfficialLogin } from '../hooks/useOfficialLogin';
import { useGetAllInquiries } from '../hooks/useAdminInquiries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InquiryList from '../components/admin/InquiryList';
import { BulkExportActions } from '../components/admin/InquiryActions';
import { LogOut, Loader2, AlertCircle, Inbox } from 'lucide-react';
import BrandMark from '../components/BrandMark';

export default function AdminPage() {
  const { isOfficiallyLoggedIn, logout } = useOfficialLogin();
  const { data: inquiries, isLoading, error, refetch } = useGetAllInquiries();

  useEffect(() => {
    if (!isOfficiallyLoggedIn) {
      window.history.replaceState(null, '', '/');
      window.location.href = '/';
    }
  }, [isOfficiallyLoggedIn]);

  const handleLogout = () => {
    logout();
    window.history.replaceState(null, '', '/');
    window.location.href = '/';
  };

  if (!isOfficiallyLoggedIn) {
    return null;
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
                <AlertDescription>
                  पूछताछ लोड करने में त्रुटि। कृपया पुनः प्रयास करें।
                  <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-4">
                    पुनः प्रयास करें
                  </Button>
                </AlertDescription>
              </Alert>
            ) : inquiries && inquiries.length > 0 ? (
              <InquiryList inquiries={inquiries} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>अभी तक कोई पूछताछ नहीं है</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
