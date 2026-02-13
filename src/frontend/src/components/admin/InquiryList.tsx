import { useState, useMemo } from 'react';
import { Inquiry, InquiryType } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import InquiryActions from './InquiryActions';
import { useBulkSetInquiryReadStatus } from '../../hooks/useAdminInquiries';
import { Phone, Mail, MessageSquare, Calendar, Tag, Search, Filter, CheckCheck, XCircle } from 'lucide-react';

interface InquiryListProps {
  inquiries: Inquiry[];
}

export default function InquiryList({ inquiries }: InquiryListProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchText, setSearchText] = useState('');
  const [inquiryTypeFilter, setInquiryTypeFilter] = useState<string>('all');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('all');
  
  const bulkSetReadStatus = useBulkSetInquiryReadStatus();

  // Extract unique service categories from inquiries
  const serviceCategories = useMemo(() => {
    const categories = new Set<string>();
    inquiries.forEach(inquiry => {
      if (inquiry.serviceCategory) {
        categories.add(inquiry.serviceCategory);
      }
    });
    return Array.from(categories).sort();
  }, [inquiries]);

  // Apply all filters
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inquiry) => {
      // Read/unread filter
      if (filter === 'unread' && inquiry.read) return false;
      if (filter === 'read' && !inquiry.read) return false;

      // Search filter (name + phone number)
      if (searchText) {
        const search = searchText.toLowerCase();
        const matchesName = inquiry.name.toLowerCase().includes(search);
        const matchesPhone = inquiry.phoneNumber.includes(search);
        if (!matchesName && !matchesPhone) return false;
      }

      // Inquiry type filter
      if (inquiryTypeFilter !== 'all') {
        if (inquiryTypeFilter === 'contact' && inquiry.inquiryType !== InquiryType.contact) return false;
        if (inquiryTypeFilter === 'serviceRequest' && inquiry.inquiryType !== InquiryType.serviceRequest) return false;
      }

      // Service category filter
      if (serviceCategoryFilter !== 'all') {
        if (inquiry.serviceCategory !== serviceCategoryFilter) return false;
      }

      return true;
    });
  }, [inquiries, filter, searchText, inquiryTypeFilter, serviceCategoryFilter]);

  const unreadCount = inquiries.filter((i) => !i.read).length;

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInquiryTypeLabel = (type: InquiryType) => {
    return type === InquiryType.contact ? 'Contact' : 'Service Request';
  };

  const handleBulkMarkAsRead = () => {
    const inquiryIds = filteredInquiries
      .filter(i => !i.read)
      .map(i => i.id);
    
    if (inquiryIds.length > 0) {
      bulkSetReadStatus.mutate({ inquiryIds, read: true });
    }
  };

  const handleBulkMarkAsUnread = () => {
    const inquiryIds = filteredInquiries
      .filter(i => i.read)
      .map(i => i.id);
    
    if (inquiryIds.length > 0) {
      bulkSetReadStatus.mutate({ inquiryIds, read: false });
    }
  };

  const hasUnreadInFiltered = filteredInquiries.some(i => !i.read);
  const hasReadInFiltered = filteredInquiries.some(i => i.read);

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4" />
          <span>Search and Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-xs">Search by name or phone</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Inquiry Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="inquiryType" className="text-xs">Inquiry Type</Label>
            <Select value={inquiryTypeFilter} onValueChange={setInquiryTypeFilter}>
              <SelectTrigger id="inquiryType">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="serviceRequest">Service Request</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Service Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="serviceCategory" className="text-xs">Service Category</Label>
            <Select value={serviceCategoryFilter} onValueChange={setServiceCategoryFilter}>
              <SelectTrigger id="serviceCategory">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {serviceCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions */}
        {filteredInquiries.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <span className="text-xs text-muted-foreground">Bulk actions:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkMarkAsRead}
              disabled={!hasUnreadInFiltered || bulkSetReadStatus.isPending}
              className="h-8"
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all as read
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkMarkAsUnread}
              disabled={!hasReadInFiltered || bulkSetReadStatus.isPending}
              className="h-8"
            >
              <XCircle className="mr-1 h-3 w-3" />
              Mark all as unread
            </Button>
          </div>
        )}
      </div>

      {/* Tabs and List */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({inquiries.length})</TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="read">Read ({inquiries.length - unreadCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          <div className="mb-2 text-sm text-muted-foreground">
            {filteredInquiries.length} results found
          </div>
          <ScrollArea className="h-[600px] pr-4">
            {filteredInquiries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No inquiries found</p>
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
                                New
                              </Badge>
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatTimestamp(inquiry.timestamp)}</span>
                          </div>
                        </div>
                        <InquiryActions inquiry={inquiry} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Tag className="h-3 w-3" />
                          {getInquiryTypeLabel(inquiry.inquiryType)}
                        </Badge>
                        {inquiry.serviceCategory && (
                          <Badge variant="secondary" className="gap-1">
                            {inquiry.serviceCategory}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${inquiry.phoneNumber}`} className="hover:underline">
                            {inquiry.phoneNumber}
                          </a>
                        </div>
                        {inquiry.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${inquiry.email}`} className="hover:underline">
                              {inquiry.email}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm whitespace-pre-wrap">{inquiry.message}</p>
                        </div>
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
