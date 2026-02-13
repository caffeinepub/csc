import { Inquiry, InquiryType } from '../backend';

function escapeCSV(value: string | undefined | null): string {
  if (!value) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1000000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getInquiryTypeLabel(type: InquiryType): string {
  return type === InquiryType.contact ? 'Contact' : 'Service Request';
}

export function exportInquiriesToJSON(inquiries: Inquiry[]): void {
  const dataStr = JSON.stringify(inquiries, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `inquiries-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportInquiriesToCSV(inquiries: Inquiry[]): void {
  const headers = [
    'ID',
    'Timestamp',
    'Type',
    'Name',
    'Phone',
    'Email',
    'Message',
    'Service Category',
    'Read Status',
  ];

  const rows = inquiries.map((inquiry) => [
    inquiry.id.toString(),
    formatTimestamp(inquiry.timestamp),
    getInquiryTypeLabel(inquiry.inquiryType),
    escapeCSV(inquiry.name),
    escapeCSV(inquiry.phoneNumber),
    escapeCSV(inquiry.email || ''),
    escapeCSV(inquiry.message),
    escapeCSV(inquiry.serviceCategory || ''),
    inquiry.read ? 'Read' : 'Unread',
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `inquiries-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
