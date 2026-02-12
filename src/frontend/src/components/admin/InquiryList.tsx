import { useState } from 'react';
import { Inquiry, InquiryType } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import InquiryActions from './InquiryActions';
import { Phone, Mail, MessageSquare, Calendar, Tag } from 'lucide-react';

interface InquiryListProps {
  inquiries: Inquiry[];
}

export default function InquiryList({ inquiries }: InquiryListProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredInquiries = inquiries.filter((inquiry) => {
    if (filter === 'unread') return !inquiry.read;
    if (filter === 'read') return inquiry.read;
    return true;
  });

  const unreadCount = inquiries.filter((i) => !i.read).length;

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString('hi-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInquiryTypeLabel = (type: InquiryType) => {
    return type === InquiryType.contact ? 'संपर्क' : 'सेवा अनुरोध';
  };

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">सभी ({inquiries.length})</TabsTrigger>
          <TabsTrigger value="unread">
            अपठित {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="read">पढ़े गए ({inquiries.length - unreadCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          <ScrollArea className="h-[600px] pr-4">
            {filteredInquiries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>कोई पूछताछ नहीं मिली</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInquiries.map((inquiry) => (
                  <Card
                    key={inquiry.id.toString()}
                    className={inquiry.read ? 'opacity-75' : 'border-primary/50'}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {inquiry.name}
                            {!inquiry.read && (
                              <Badge variant="default" className="text-xs">
                                नया
                              </Badge>
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatTimestamp(inquiry.timestamp)}
                          </div>
                        </div>
                        <InquiryActions inquiry={inquiry} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{getInquiryTypeLabel(inquiry.inquiryType)}</Badge>
                        {inquiry.serviceCategory && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {inquiry.serviceCategory}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`tel:${inquiry.phoneNumber}`}
                            className="text-primary hover:underline"
                          >
                            {inquiry.phoneNumber}
                          </a>
                        </div>
                        {inquiry.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={`mailto:${inquiry.email}`}
                              className="text-primary hover:underline"
                            >
                              {inquiry.email}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {inquiry.message}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
