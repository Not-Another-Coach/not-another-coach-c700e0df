import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Shield, 
  Upload, 
  FileText, 
  AlertCircle,
  Eye
} from 'lucide-react';
import { useTrainerVerification } from '@/hooks/useTrainerVerification';
import { useTrainerProfile } from '@/hooks/useTrainerProfile';
import { VerificationNotifications } from './VerificationNotifications';
import { SectionHeader } from './SectionHeader';
import { EnhancedVerificationSection } from './EnhancedVerificationSection';
import { toast } from 'sonner';

const statusConfig = {
  pending: {
    icon: <Clock className="w-5 h-5" />,
    color: 'bg-amber-100 text-amber-800',
    title: 'Verification Pending',
    description: 'Your verification request is being reviewed by our admin team.'
  },
  under_review: {
    icon: <Eye className="w-5 h-5" />,
    color: 'bg-blue-100 text-blue-800',
    title: 'Under Review',
    description: 'An admin is currently reviewing your verification request.'
  },
  verified: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'bg-green-100 text-green-800',
    title: 'Verified',
    description: 'Congratulations! Your profile has been verified and is now published.'
  },
  rejected: {
    icon: <XCircle className="w-5 h-5" />,
    color: 'bg-red-100 text-red-800',
    title: 'Verification Rejected',
    description: 'Your verification request was rejected. Please review the feedback and resubmit.'
  }
};

export const VerificationSection = () => {
  // Use the enhanced verification section for a better experience
  return (
    <div className="space-y-6">
      <SectionHeader 
        icons={[Shield, CheckCircle2]}
        title="Profile Verification"
        description="Get your profile verified to start accepting clients and build trust"
      />
      
      <VerificationNotifications />
      
      <EnhancedVerificationSection />
    </div>
  );
};