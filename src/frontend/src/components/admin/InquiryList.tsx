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
  const [selectedInquiries, setSelectedInquiries] = useState<Set<bigint>>(new Set());
  
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

  // Count unread inquiries
  const unreadCount = useMemo(() => {
    return inquiries.filter(i => !i.read).length;
  }, [inquiries]);

  // Check if an inquiry is a demo inquiry
  const isDemoInquiry = (inquiry: Inquiry): boolean => {
    return inquiry.name === 'Demo Inquiry' && inquiry.phoneNumber === '1234567890';
  };

  // Toggle selection
  const toggleSelection = (inquiryId: bigint) => {
    const newSelection = new Set(selectedInquiries);
    if (newSelection.has(inquiryId)) {
      newSelection.delete(inquiryId);
    } else {
      newSelection.add(inquiryId);
    }
    setSelectedInquiries(newSelection);
  };

  // Select all filtered inquiries
  const selectAll = () => {
    const allIds = new Set(filteredInquiries.map(i => i.id));
    setSelectedInquiries(allIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedInquiries(new Set());
  };

  // Bulk mark as read
  const handleBulkMarkRead = async () => {
    const ids = Array.from(selectedInquiries);
    await bulkSetReadStatus.mutateAsync({ inquiryIds: ids, read: true });
    clearSelection();
  };

  // Bulk mark as unread
  const handleBulkMarkUnread = async () => {
    const ids = Array.from(selectedInquiries);
    await bulkSetReadStatus.mutateAsync({ inquiryIds: ids, read: false });
    clearSelection();
  };

  // Format timestamp
  const formatTimestamp = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp) / 1000000); // Convert from nanoseconds
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search by Name or Phone</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search inquiries..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inquiry Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="inquiry-type">Inquiry Type</Label>
              <Select value={inquiryTypeFilter} onValueChange={setInquiryTypeFilter}>
                <SelectTrigger id="inquiry-type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                  <SelectItem value="serviceRequest">Service Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Service Category Filter */}
            <div className="space-y-2">
              <Label htmlFor="service-category">Service Category</Label>
              <Select value={serviceCategoryFilter} onValueChange={setServiceCategoryFilter}>
                <SelectTrigger id="service-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {serviceCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedInquiries.size > 0 && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium">
                {selectedInquiries.size} selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkMarkRead}
                  disabled={bulkSetReadStatus.isPending}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark as Read
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkMarkUnread}
                  disabled={bulkSetReadStatus.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark as Unread
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearSelection}
                >
                  Clear Selection
                </Button>
              </div>
              {filteredInquiries.length > selectedInquiries.size && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={selectAll}
                  className="ml-auto"
                >
                  Select All ({filteredInquiries.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inquiry Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            All ({inquiries.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read">
            Read ({inquiries.length - unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredInquiries.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No inquiries found matching your filters.</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {filteredInquiries.map((inquiry) => {
                  const isDemo = isDemoInquiry(inquiry);
                  const isSelected = selectedInquiries.has(inquiry.id);
                  
                  return (
                    <Card
                      key={inquiry.id.toString()}
                      className={`transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : ''
                      } ${isDemo ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' : ''}`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            {/* Selection Checkbox */}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelection(inquiry.id)}
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <CardTitle className="text-lg">{inquiry.name}</CardTitle>
                                {!inquiry.read && (
                                  <Badge variant="default">Unread</Badge>
                                )}
                                {isDemo && (
                                  <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400">
                                    Demo
                                  </Badge>
                                )}
                                <Badge variant="outline">
                                  {inquiry.inquiryType === InquiryType.contact ? 'Contact' : 'Service Request'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {formatTimestamp(inquiry.timestamp)}
                              </div>
                            </div>
                          </div>
                          
                          <InquiryActions inquiry={inquiry} />
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={`tel:${inquiry.phoneNumber}`}
                              className="text-primary hover:underline"
                            >
                              {inquiry.phoneNumber}
                            </a>
                          </div>
                          {inquiry.email && (
                            <div className="flex items-center gap-2 text-sm">
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

                        {/* Service Category */}
                        {inquiry.serviceCategory && (
                          <div className="flex items-center gap-2 text-sm">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{inquiry.serviceCategory}</span>
                          </div>
                        )}

                        {/* Message */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            Message
                          </div>
                          <p className="text-sm text-muted-foreground pl-6 whitespace-pre-wrap">
                            {inquiry.message}
                          </p>
                        </div>

                        {/* Demo Inquiry Notice */}
                        {isDemo && (
                          <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-md">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                              <strong>Demo Inquiry:</strong> This is a sample inquiry shown when no actual inquiries exist. 
                              Real inquiries will appear here once submitted through the contact form.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
