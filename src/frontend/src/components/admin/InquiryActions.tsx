import { useState } from 'react';
import { Inquiry } from '../../backend';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Trash2, CheckCircle, Circle, Download } from 'lucide-react';
import { useDeleteInquiry, useSetInquiryReadStatus } from '../../hooks/useAdminInquiries';
import { toast } from 'sonner';
import { exportToJSON, exportToCSV } from '../../utils/inquiryExport';

interface InquiryActionsProps {
  inquiry: Inquiry;
}

export default function InquiryActions({ inquiry }: InquiryActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteInquiry = useDeleteInquiry();
  const setReadStatus = useSetInquiryReadStatus();

  const handleToggleRead = async () => {
    try {
      await setReadStatus.mutateAsync({
        inquiryId: inquiry.id,
        read: !inquiry.read,
      });
      toast.success(inquiry.read ? 'अपठित के रूप में चिह्नित' : 'पढ़ा हुआ चिह्नित');
    } catch (error) {
      toast.error('स्थिति बदलने में त्रुटि');
      console.error('Error toggling read status:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInquiry.mutateAsync(inquiry.id);
      toast.success('पूछताछ हटा दी गई');
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('पूछताछ हटाने में त्रुटि');
      console.error('Error deleting inquiry:', error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleToggleRead} disabled={setReadStatus.isPending}>
            {inquiry.read ? (
              <>
                <Circle className="mr-2 h-4 w-4" />
                अपठित के रूप में चिह्नित करें
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                पढ़ा हुआ चिह्नित करें
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            हटाएं
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>क्या आप निश्चित हैं?</AlertDialogTitle>
            <AlertDialogDescription>
              यह क्रिया पूर्ववत नहीं की जा सकती। यह पूछताछ स्थायी रूप से हटा दी जाएगी।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>रद्द करें</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteInquiry.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteInquiry.isPending ? 'हटाया जा रहा है...' : 'हटाएं'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface BulkExportActionsProps {
  inquiries: Inquiry[];
}

export function BulkExportActions({ inquiries }: BulkExportActionsProps) {
  const handleExportJSON = () => {
    exportToJSON(inquiries);
    toast.success('JSON फ़ाइल डाउनलोड हो रही है');
  };

  const handleExportCSV = () => {
    exportToCSV(inquiries);
    toast.success('CSV फ़ाइल डाउनलोड हो रही है');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportJSON}>
          <Download className="mr-2 h-4 w-4" />
          JSON के रूप में डाउनलोड करें
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          CSV के रूप में डाउनलोड करें
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
