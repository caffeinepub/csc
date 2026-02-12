import { useState } from 'react';
import { Inquiry } from '../../backend';
import { useDeleteInquiry, useSetInquiryReadStatus } from '../../hooks/useAdminInquiries';
import { exportInquiriesToJSON, exportInquiriesToCSV } from '../../utils/inquiryExport';
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
import { Download, MoreVertical, Trash2, Mail, MailOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InquiryActionsProps {
  inquiry?: Inquiry;
  inquiries?: Inquiry[];
}

export default function InquiryActions({ inquiry, inquiries }: InquiryActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteInquiry = useDeleteInquiry();
  const setReadStatus = useSetInquiryReadStatus();

  const handleDelete = async () => {
    if (!inquiry) return;

    try {
      await deleteInquiry.mutateAsync(inquiry.id);
      toast.success('पूछताछ सफलतापूर्वक हटा दी गई');
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('पूछताछ हटाने में त्रुटि');
      console.error('Delete error:', error);
    }
  };

  const handleToggleRead = async () => {
    if (!inquiry) return;

    try {
      await setReadStatus.mutateAsync({
        id: inquiry.id,
        read: !inquiry.read,
      });
      toast.success(inquiry.read ? 'अपठित के रूप में चिह्नित' : 'पढ़ा हुआ चिह्नित');
    } catch (error) {
      toast.error('स्थिति अपडेट करने में त्रुटि');
      console.error('Toggle read error:', error);
    }
  };

  const handleExportJSON = () => {
    if (!inquiries) return;
    exportInquiriesToJSON(inquiries);
    toast.success('JSON फ़ाइल डाउनलोड हो रही है');
  };

  const handleExportCSV = () => {
    if (!inquiries) return;
    exportInquiriesToCSV(inquiries);
    toast.success('CSV फ़ाइल डाउनलोड हो रही है');
  };

  // Export actions for bulk operations
  if (inquiries) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExportJSON}>
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportCSV}>
            Export as CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Individual inquiry actions
  if (!inquiry) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={handleToggleRead}
            disabled={setReadStatus.isPending}
          >
            {setReadStatus.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : inquiry.read ? (
              <Mail className="h-4 w-4 mr-2" />
            ) : (
              <MailOpen className="h-4 w-4 mr-2" />
            )}
            {inquiry.read ? 'अपठित के रूप में चिह्नित करें' : 'पढ़ा हुआ चिह्नित करें'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            हटाएं (Delete)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteInquiry.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  हटाया जा रहा है...
                </>
              ) : (
                'हटाएं'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
