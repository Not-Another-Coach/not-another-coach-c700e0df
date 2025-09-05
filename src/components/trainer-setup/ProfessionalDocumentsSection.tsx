import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Shield, FileText, Heart, CheckCircle, Clock, XCircle, AlertTriangle, Save, Edit } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useProfessionalDocumentsState } from "@/hooks/useProfessionalDocumentsState";
import { useEnhancedTrainerVerification } from "@/hooks/useEnhancedTrainerVerification";

interface DocumentFormData {
  provider?: string;
  member_id?: string;
  certificate_id?: string;
  policy_number?: string;
  coverage_amount?: number;
  issue_date?: string;
  expiry_date?: string;
  file?: File;
  not_applicable?: boolean;
}

const CheckTypeConfig = {
  cimspa_membership: {
    title: 'CIMSPA Membership',
    icon: Heart,
    description: 'Provide your current CIMSPA membership details',
    requiredFields: ['member_id', 'expiry_date', 'file'],
    isMandatory: true,
  },
  insurance_proof: {
    title: 'Professional Insurance',
    icon: Shield,
    description: 'Upload your professional indemnity insurance certificate',
    requiredFields: ['provider', 'policy_number', 'coverage_amount', 'expiry_date', 'file'],
    isMandatory: true,
  },
  first_aid_certification: {
    title: 'First Aid Certification',
    icon: FileText,
    description: 'Upload your current first aid certification',
    requiredFields: ['provider', 'certificate_id', 'issue_date', 'expiry_date', 'file'],
    isMandatory: true,
  },
};

const StatusConfig = {
  pending: { icon: Clock, variant: 'secondary' as const, label: 'Under Review' },
  verified: { icon: CheckCircle, variant: 'default' as const, label: 'Verified' },
  rejected: { icon: XCircle, variant: 'destructive' as const, label: 'Rejected' },
  expired: { icon: AlertTriangle, variant: 'outline' as const, label: 'Expired' },
};

export const ProfessionalDocumentsSection = () => {
  const {
    formData,
    notApplicable,
    savingStatus,
    updateFormData,
    updateNotApplicable,
    isAnyFieldFilled,
    saveDraft
  } = useProfessionalDocumentsState();

  const { 
    checks, 
    uploadDocument 
  } = useEnhancedTrainerVerification();
  
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleInputChange = (checkType: string, field: string, value: any) => {
    updateFormData(checkType, field, value);
  };

  const handleFileChange = (checkType: string, field: string, file: File | null) => {
    updateFormData(checkType, field, file);
  };

  const handleNotApplicableChange = (checkType: string, isNotApplicable: boolean) => {
    updateNotApplicable(checkType, isNotApplicable);
  };

  const handleSaveDraft = async (checkType: string) => {
    const data = formData[checkType];
    if (!data && !notApplicable[checkType]) return;

    await saveDraft(checkType);
    
    toast({
      title: "Draft Saved",
      description: `Your ${CheckTypeConfig[checkType as keyof typeof CheckTypeConfig].title} draft has been saved.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Professional Documents</h2>
        <p className="text-muted-foreground">
          Save your professional certifications as drafts and submit them all for review when ready.
        </p>
      </div>

      {Object.entries(CheckTypeConfig).map(([checkType, config]) => {
        const check = checks.find(c => c.check_type === checkType);
        const status = check?.status;
        const draftStatus = check?.draft_status || 'draft';
        const isNotApplicable = notApplicable[checkType];
        const hasFilledFields = isAnyFieldFilled(checkType);
        const canSave = hasFilledFields || isNotApplicable;
        const isSubmitted = draftStatus === 'submitted' && status !== 'rejected';

        // Determine display status
        let displayStatus = status;
        if (draftStatus === 'draft' && hasFilledFields) {
          displayStatus = 'draft';
        }

        return (
          <Card key={checkType} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <config.icon className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">{config.title}</h3>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>
              </div>
              
              {displayStatus && (
                <Badge 
                  variant={displayStatus === 'draft' ? 'secondary' : (StatusConfig[displayStatus]?.variant || 'secondary')} 
                  className="flex-shrink-0"
                >
                  {displayStatus === 'draft' ? (
                    <>
                      <Edit className="h-3 w-3 mr-1" />
                      Draft
                    </>
                  ) : StatusConfig[displayStatus] ? (
                    <>
                      <StatusConfig[displayStatus].icon className="h-3 w-3 mr-1" />
                      {StatusConfig[displayStatus].label}
                    </>
                  ) : null}
                </Badge>
              )}
            </div>

            {/* Submission lock notice */}
            {isSubmitted && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium">
                  This document has been submitted for admin review and cannot be edited.
                </p>
              </div>
            )}

            {/* Not Applicable Toggle */}
            {!isSubmitted && (
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`not-applicable-${checkType}`}
                    checked={isNotApplicable}
                    onCheckedChange={(checked) => updateNotApplicable(checkType, checked)}
                  />
                  <Label htmlFor={`not-applicable-${checkType}`} className="text-sm">
                    Not applicable to my training services
                  </Label>
                </div>
              </div>
            )}

            {/* Show existing information if available */}
            {check && !isNotApplicable && (
              <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">
                  {draftStatus === 'draft' ? 'Current Draft:' : 'Submitted Information:'}
                </h4>
                {check.provider && <p className="text-sm"><strong>Provider:</strong> {check.provider}</p>}
                {check.member_id && <p className="text-sm"><strong>Member ID:</strong> {check.member_id}</p>}
                {check.certificate_id && <p className="text-sm"><strong>Certificate ID:</strong> {check.certificate_id}</p>}
                {check.policy_number && <p className="text-sm"><strong>Policy Number:</strong> {check.policy_number}</p>}
                {check.coverage_amount && <p className="text-sm"><strong>Coverage:</strong> £{check.coverage_amount}</p>}
                {check.issue_date && <p className="text-sm"><strong>Issue Date:</strong> {format(new Date(check.issue_date), 'PPP')}</p>}
                {check.expiry_date && <p className="text-sm"><strong>Expiry Date:</strong> {format(new Date(check.expiry_date), 'PPP')}</p>}
                {check.evidence_file_url && (
                  <p className="text-sm">
                    <strong>Document:</strong> 
                    <a href={check.evidence_file_url} target="_blank" className="text-primary hover:underline ml-1">
                      View uploaded document
                    </a>
                  </p>
                )}
              </div>
            )}

            {/* Form for editing (only if not submitted or rejected) */}
            {!isNotApplicable && (!isSubmitted || status === 'rejected') && (
              <div className="space-y-4">
                {config.requiredFields.map((field) => {
                  const fieldKey = field as keyof DocumentFormData;
                  const isRequired = hasFilledFields; // Make required only if any field is filled
                  
                  if (field === 'file') {
                    return (
                      <div key={field}>
                        <Label htmlFor={`${checkType}-${field}`} className="text-sm font-medium">
                          Upload Evidence {isRequired && <span className="text-destructive">*</span>}
                        </Label>
                        <div className="mt-1">
                          <Input
                            id={`${checkType}-${field}`}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => handleFileChange(checkType, field, e.target.files?.[0] || null)}
                            className="cursor-pointer"
                          />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={field}>
                      <Label htmlFor={`${checkType}-${field}`} className="text-sm font-medium">
                        {field.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        {isRequired && <span className="text-destructive">*</span>}
                      </Label>
                      <div className="mt-1">
                        {field.includes('date') ? (
                          <Input
                            id={`${checkType}-${field}`}
                            type="date"
                            value={formData[checkType]?.[fieldKey] as string || ''}
                            onChange={(e) => handleInputChange(checkType, field, e.target.value)}
                          />
                        ) : field === 'coverage_amount' ? (
                          <Input
                            id={`${checkType}-${field}`}
                            type="number"
                            placeholder="Enter amount"
                            value={formData[checkType]?.[fieldKey] as number || ''}
                            onChange={(e) => handleInputChange(checkType, field, parseFloat(e.target.value) || undefined)}
                          />
                        ) : (
                          <Input
                            id={`${checkType}-${field}`}
                            type="text"
                            placeholder={`Enter ${field.replace('_', ' ')}`}
                            value={formData[checkType]?.[fieldKey] as string || ''}
                            onChange={(e) => handleInputChange(checkType, field, e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}

                <Button
                  onClick={() => handleSaveDraft(checkType)}
                  disabled={!canSave || savingStatus[checkType]}
                  className="w-full"
                  variant="outline"
                >
                  {savingStatus[checkType] ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Draft
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>
        );
      })}

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="p-6">
          <h4 className="font-medium mb-2 text-blue-900">Document Upload Guidelines</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Save your documents as drafts as you work on them</li>
            <li>• All fields become mandatory once you start filling any field</li>
            <li>• Use the verification overview to submit all documents for admin review</li>
            <li>• Accepted formats: PDF, JPG, PNG, DOC, DOCX (max 10MB per file)</li>
            <li>• Ensure all documents are current and clearly readable</li>
            <li>• Processing time: 2-5 business days after submission</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};