import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageReadReceiptProps {
  message: {
    id: string;
    created_at: string;
    read_at: string | null;
  };
  conversationReadAt: string | null;
}

export function MessageReadReceipt({ message, conversationReadAt }: MessageReadReceiptProps) {
  // Determine read status
  const isRead = message.read_at || 
    (conversationReadAt && new Date(message.created_at) < new Date(conversationReadAt));

  if (isRead) {
    // Double blue checkmarks for read messages
    return (
      <CheckCheck 
        className="w-4 h-4 text-blue-500" 
        aria-label="Read"
      />
    );
  }

  // Double gray checkmarks for delivered (sent but not read)
  return (
    <CheckCheck 
      className="w-4 h-4 text-muted-foreground" 
      aria-label="Delivered"
    />
  );
}
