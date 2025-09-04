import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Clock, Eye, FileText, AlertCircle, User } from 'lucide-react';
import { useTrainerVerification } from '@/hooks/useTrainerVerification';
import { OverviewView } from '@/components/profile-views/OverviewView';
import { EnhancedVerificationManagement } from './EnhancedVerificationManagement';
import { toast } from 'sonner';

const statusIcons = {
  pending: <Clock className="w-4 h-4" />,
  under_review: <Eye className="w-4 h-4" />,
  approved: <CheckCircle2 className="w-4 h-4" />,
  rejected: <XCircle className="w-4 h-4" />,
  verified: <CheckCircle2 className="w-4 h-4" />
};

const statusColors = {
  pending: 'bg-amber-100 text-amber-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  verified: 'bg-green-100 text-green-800'
};

export const VerificationManagement = () => {
  // Use the enhanced verification management for a better admin experience
  return <EnhancedVerificationManagement />;
};