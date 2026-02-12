import { Inquiry } from '../backend';

export function exportInquiriesToJSON(inquiries: Inquiry[]) {
  const dataStr = JSON.stringify(inquiries, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `inquiries-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportInquiriesToCSV(inquiries: Inquiry[]) {
  const headers = [
    'ID',
    'Timestamp',
    'Type',
    'Name',
    'Phone',
    'Email',
    'Service Category',
    'Message',
    'Internal',
    'Read',
  ];

  const rows = inquiries.map((inquiry) => {
    const date = new Date(Number(inquiry.timestamp) / 1000000);
    const formattedDate = date.toLocaleString('en-IN');
    
    return [
      inquiry.id.toString(),
      formattedDate,
      inquiry.inquiryType === 'contact' ? 'Contact' : 'Service Request',
      escapeCSV(inquiry.name),
      inquiry.phoneNumber,
      inquiry.email || '',
      inquiry.serviceCategory || '',
      escapeCSV(inquiry.message),
      inquiry.internal ? 'Yes' : 'No',
      inquiry.read ? 'Yes' : 'No',
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `inquiries-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(text: string): string {
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}
