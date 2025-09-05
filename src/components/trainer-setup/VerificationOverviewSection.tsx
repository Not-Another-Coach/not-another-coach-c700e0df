import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEnhancedTrainerVerification } from "@/hooks/useEnhancedTrainerVerification";
import { useProfessionalDocumentsState } from "@/hooks/useProfessionalDocumentsState";
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Heart, 
  Eye, 
  EyeOff,
  RefreshCw,
  Send
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const CheckTypeConfig = {
  cimspa_membership: {
    title: 'CIMSPA Membership',
    icon: Heart,
    description: 'Professional membership verification',
  },
  insurance_proof: {
    title: 'Professional Insurance',
    icon: Shield,
    description: 'Indemnity insurance coverage',
  },
  first_aid_certification: {
    title: 'First Aid Certification',
    icon: FileText,
    description: 'Current first aid qualification',
  },
};

export const VerificationOverviewSection = () => {
  const { 
    overview, 
    checks, 
    loading, 
    updateDisplayPreference, 
    fetchVerificationData,
    submitVerificationCheck
  } = useEnhancedTrainerVerification();
  
  const { canSubmitForReview } = useProfessionalDocumentsState();
  
  const [isUpdatingPreference, setIsUpdatingPreference] = useState(false);
  const [isSubmittingForReview, setIsSubmittingForReview] = useState(false);
  const { toast } = useToast();

  const handleDisplayPreferenceToggle = async () => {
    setIsUpdatingPreference(true);
    try {
      const newPreference = overview?.display_preference === 'verified_allowed' ? 'hidden' : 'verified_allowed';
      await updateDisplayPreference(newPreference);
      
      toast({
        title: "Display Preference Updated",
        description: `Verification badge is now ${newPreference}.`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update display preference.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPreference(false);
    }
  };

  const handleRefresh = async () => {
    await fetchVerificationData();
    toast({
      title: "Verification Data Refreshed",
      description: "Your verification status has been updated.",
    });
  };

  const handleSubmitAllForReview = async () => {
    if (!canSubmitForReview()) return;
    
    setIsSubmittingForReview(true);
    try {
      // Submit all draft documents for review
      const checkTypes = ['cimspa_membership', 'insurance_proof', 'first_aid_certification'];
      
      for (const checkType of checkTypes) {
        const check = checks.find(c => c.check_type === checkType);
        if (check && (check as any).draft_status === 'draft') {
          await submitVerificationCheck(checkType as any, {});
        }
      }
      
      await fetchVerificationData();
      
      toast({
        title: "Documents Submitted",
        description: "All your documents have been submitted for admin review. You will receive an update once they have been reviewed.",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingForReview(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Verification Overview</h2>
        <p className="text-muted-foreground">
          Review your verification status and submit documents for admin review.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Status
          </CardTitle>
          <CardDescription>
            Manage your professional verification documents and display preferences
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Submit All Documents Section */}
          {canSubmitForReview() && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium text-green-900">Ready for Review</h4>
                  <p className="text-sm text-green-700">
                    All required documents are complete and ready to submit for admin review.
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Send className="h-4 w-4 mr-2" />
                      Submit for Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Documents for Admin Review</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to submit all your professional documents for admin review? 
                        Once submitted, you won't be able to edit them until the review is complete.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {}}>Cancel</Button>
                      <Button 
                        onClick={handleSubmitAllForReview}
                        disabled={isSubmittingForReview}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isSubmittingForReview ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit All Documents
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}

          {/* Display Preference Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <h4 className="font-medium">Verification Badge Display</h4>
              <p className="text-sm text-muted-foreground">
                Control whether your verification status is visible to potential clients
              </p>
            </div>
            <Button
              variant={overview?.display_preference === 'verified_allowed' ? 'default' : 'outline'}
              size="sm"
              onClick={handleDisplayPreferenceToggle}
              disabled={isUpdatingPreference || loading}
              className="min-w-[100px]"
            >
              {isUpdatingPreference ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : overview?.display_preference === 'verified_allowed' ? (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Visible
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hidden
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Documents Status List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Document Status</h4>
              <Button variant="ghost" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              {Object.entries(CheckTypeConfig).map(([checkType, typeConfig]) => {
                const check = checks.find(c => c.check_type === checkType);
                
                const getStatusColor = (status: string, draftStatus?: string) => {
                  if (draftStatus === 'draft') {
                    return 'text-blue-600';
                  }
                  switch (status) {
                    case 'verified':
                      return 'text-green-600';
                    case 'pending':
                      return 'text-amber-600';
                    case 'rejected':
                      return 'text-red-600';
                    case 'expired':
                      return 'text-orange-600';
                    default:
                      return 'text-muted-foreground';
                  }
                };

                const getDisplayStatus = (check: any) => {
                  if (!check) return 'Not Started';
                  
                  if (check.draft_status === 'draft') {
                    return 'Draft Saved';
                  }
                  
                  switch (check.status) {
                    case 'verified':
                      return 'Verified';
                    case 'pending':
                      return 'Under Review';
                    case 'rejected':
                      return 'Rejected';
                    case 'expired':
                      return 'Expired';
                    default:
                      return 'Not Started';
                  }
                };

                return (
                  <div key={checkType} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <typeConfig.icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{typeConfig.title}</p>
                        <p className="text-xs text-muted-foreground">{typeConfig.description}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getStatusColor(check?.status || 'not_started', (check as any)?.draft_status)}`}>
                          {getDisplayStatus(check)}
                        </p>
                        {(check as any)?.submitted_at && (
                          <p className="text-xs text-muted-foreground">
                            Submitted: {format(new Date((check as any).submitted_at), 'MMM d, yyyy')}
                          </p>
                        )}
                        {(check as any)?.draft_status === 'draft' && check?.updated_at && (
                          <p className="text-xs text-muted-foreground">
                            Saved: {format(new Date(check.updated_at), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overall Status */}
          <Separator />
          
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Overall Verification Status</span>
            </div>
            <Badge variant={overview?.overall_status === 'verified' ? 'default' : 'secondary'} className="text-sm">
              {overview?.overall_status === 'verified' ? 'Verified Trainer' : 'Pending Verification'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};