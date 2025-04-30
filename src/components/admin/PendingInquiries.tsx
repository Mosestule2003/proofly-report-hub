
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Sample inquiry data structure
interface Inquiry {
  id: string;
  userId: string;
  userName: string;
  inquiryText: string;
  date: string;
  assigned?: string;
}

interface PendingInquiriesProps {
  className?: string;
}

const sampleInquiries: Inquiry[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'John Doe',
    inquiryText: 'When will my property evaluation be ready?',
    date: '2025-04-18',
    assigned: 'Sarah'
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Alice Smith',
    inquiryText: 'I need to change my property address.',
    date: '2025-04-18'
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Bob Johnson',
    inquiryText: 'Can I get a refund for my last order?',
    date: '2025-04-17'
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'Emma Williams',
    inquiryText: 'Is there a way to expedite my evaluation?',
    date: '2025-04-16',
    assigned: 'Mike'
  }
];

const PendingInquiries: React.FC<PendingInquiriesProps> = ({ className }) => {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pending Inquiries</CardTitle>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sampleInquiries.map((inquiry) => (
            <div key={inquiry.id} className="flex items-start gap-3 border-b pb-4 last:border-0 last:pb-0">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback>{inquiry.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{inquiry.userName}</span>
                  <span className="text-xs text-muted-foreground">{inquiry.date}</span>
                </div>
                <p className="text-sm mt-1 line-clamp-2">{inquiry.inquiryText}</p>
                {inquiry.assigned ? (
                  <div className="mt-2 text-xs bg-blue-50 text-blue-700 py-1 px-2 rounded inline-block">
                    Assigned to {inquiry.assigned}
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="mt-2">
                    Assign
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingInquiries;
