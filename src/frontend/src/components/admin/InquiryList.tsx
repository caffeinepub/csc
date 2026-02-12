import { useState } from 'react';
import { useAdminInquiriesList } from '../../hooks/useAdminInquiries';
import { Inquiry } from '../../backend';
import InquiryActions from './InquiryActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Inbox, Mail, MailOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function InquiryList() {
  const { data: inquiries, isLoading, error } = useAdminInquiriesList();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription>
          एरर: {error instanceof Error ? error.message : 'डेटा लोड करने में समस्या'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!inquiries || inquiries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Inbox className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">कोई पूछताछ नहीं</h3>
          <p className="text-muted-foreground">
            अभी तक कोई पूछताछ सबमिट नहीं की गई है।
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredInquiries = inquiries.filter((inquiry) => {
    if (filter === 'unread') return !inquiry.read;
    if (filter === 'read') return inquiry.read;
    return true;
  });

  const unreadCount = inquiries.filter((inq) => !inq.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">पूछताछ प्रबंधन (Inquiry Management)</h2>
          <p className="text-muted-foreground mt-1">
            कुल: {inquiries.length} | अपठित: {unreadCount}
          </p>
        </div>
        <InquiryActions inquiries={inquiries} />
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">
            सभी ({inquiries.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            <Mail className="h-4 w-4 mr-2" />
            अपठित ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read">
            <MailOpen className="h-4 w-4 mr-2" />
            पढ़े गए ({inquiries.length - unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4 mt-6">
          {filteredInquiries.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                इस फ़िल्टर में कोई पूछताछ नहीं मिली।
              </CardContent>
            </Card>
          ) : (
            filteredInquiries.map((inquiry) => (
              <InquiryCard key={inquiry.id.toString()} inquiry={inquiry} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InquiryCard({ inquiry }: { inquiry: Inquiry }) {
  const date = new Date(Number(inquiry.timestamp) / 1000000);
  const formattedDate = date.toLocaleString('hi-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className={inquiry.read ? 'opacity-75' : 'border-primary/50'}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">{inquiry.name}</CardTitle>
              {!inquiry.read && (
                <Badge variant="default" className="text-xs">
                  नया
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {inquiry.inquiryType === 'contact' ? 'सामान्य संपर्क' : 'सेवा अनुरोध'}
              </Badge>
              {inquiry.internal && (
                <Badge variant="secondary" className="text-xs">
                  आंतरिक
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>📞 {inquiry.phoneNumber}</p>
              {inquiry.email && <p>📧 {inquiry.email}</p>}
              {inquiry.serviceCategory && (
                <p>🏷️ सेवा: {inquiry.serviceCategory}</p>
              )}
              <p>🕒 {formattedDate}</p>
            </div>
          </div>
          <InquiryActions inquiry={inquiry} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm whitespace-pre-wrap">{inquiry.message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
