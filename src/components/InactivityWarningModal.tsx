import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock } from 'lucide-react';

interface InactivityWarningModalProps {
  open: boolean;
  remainingSeconds: number;
  onStayLoggedIn: () => void;
}

export function InactivityWarningModal({
  open,
  remainingSeconds,
  onStayLoggedIn,
}: InactivityWarningModalProps) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-amber-100 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-xl">
              Session Timeout Warning
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            You've been inactive for a while. For your security, you'll be
            automatically logged out in{' '}
            <span className="font-bold text-foreground tabular-nums">
              {timeDisplay}
            </span>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onStayLoggedIn} className="w-full">
            Stay Logged In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
