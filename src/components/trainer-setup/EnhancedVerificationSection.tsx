import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, Clock, Upload, FileText, Shield, Award } from 'lucide-react';
import { useEnhancedTrainerVerification } from '@/hooks/useEnhancedTrainerVerification';
import { toast } from 'sonner';

interface VerificationCheckFormData {
  provider?: string;
  member_id?: string;
  certificate_id?: string;
  policy_number?: string;
  coverage_amount?: number;
  issue_date?: string;
  expiry_date?: string;
  file?: File;
}

const CheckTypeConfig = {
  cimspa_membership: {
    title: 'CIMSPA Membership',
    icon: Award,
    description: 'Provide your current CIMSPA membership details',
    fields: ['member_id', 'expiry_date', 'file'],
    required: true,
  },
  insurance_proof: {
    title: 'Professional Insurance',
    icon: Shield,
    description: 'Upload your professional indemnity insurance certificate',
    fields: ['provider', 'policy_number', 'coverage_amount', 'expiry_date', 'file'],
    required: true,
  },
  first_aid_certification: {
    title: 'First Aid Certification',
    icon: FileText,
    description: 'Upload your current first aid certification',
    fields: ['provider', 'certificate_id', 'issue_date', 'expiry_date', 'file'],
    required: true,
  },
};

const StatusConfig = {
  pending: { icon: Clock, color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Under Review' },
  verified: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Verified' },
  rejected: { icon: AlertCircle, color: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected' },
  expired: { icon: AlertCircle, color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Expired' },
};

export const EnhancedVerificationSection = () => {
  const {
    loading,
    overview,
    checks,
    updateDisplayPreference,
    submitVerificationCheck,
    uploadDocument,
    getCheckByType,
    getVerificationBadgeStatus,
  } = useEnhancedTrainerVerification();

  const [formData, setFormData] = useState<Record<string, VerificationCheckFormData>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  const handleInputChange = (checkType: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [checkType]: {
        ...prev[checkType],
        [field]: value,
      },
    }));
  };

  const handleFileChange = (checkType: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [checkType]: {
        ...prev[checkType],
        file: file || undefined,
      },
    }));
  };

  const handleSubmitCheck = async (checkType: keyof typeof CheckTypeConfig) => {
    const data = formData[checkType];
    if (!data) return;

    // Validate expiry date is in the future
    if (data.expiry_date) {
      const expiryDate = new Date(data.expiry_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only
      
      if (expiryDate <= today) {
        toast.error('Expiry date must be in the future');
        return;
      }
    }

    setUploading(checkType);

    try {
      let evidence_file_url: string | undefined;

      // Upload file if provided
      if (data.file) {
        const uploadPath = await uploadDocument(checkType, data.file);
        if (!uploadPath) {
          toast.error('Failed to upload document');
          return;
        }
        evidence_file_url = uploadPath;
      }

      // Submit verification check with proper data mapping
      const submitData = {
        provider: data.provider,
        member_id: data.member_id,
        certificate_id: data.certificate_id,
        policy_number: data.policy_number,
        coverage_amount: data.coverage_amount ? Number(data.coverage_amount) : undefined,
        issue_date: data.issue_date,
        expiry_date: data.expiry_date,
        evidence_file_url,
        evidence_metadata: data.file ? {
          filename: data.file.name,
          size: data.file.size,
          type: data.file.type,
        } : undefined,
      };

      console.log('Submitting verification check:', { checkType, submitData });
      
      await submitVerificationCheck(checkType, submitData);

      // Clear form data
      setFormData(prev => ({
        ...prev,
        [checkType]: {},
      }));
      
      // Success toast is now handled in the hook
    } catch (error) {
      console.error('Error submitting verification check:', error);
      toast.error(`Failed to submit ${CheckTypeConfig[checkType].title}`);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Checks */}
      {Object.entries(CheckTypeConfig).map(([checkType, config]) => {
        const existingCheck = getCheckByType(checkType as any);
        const statusConfig = existingCheck ? StatusConfig[existingCheck.status] : null;
        const IconComponent = config.icon;

        return (
          <Card key={checkType}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  {config.title}
                  {config.required && <span className="text-red-500">*</span>}
                </div>
                {statusConfig && (
                  <Badge className={statusConfig.color}>
                    <statusConfig.icon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{config.description}</p>

        {existingCheck && (
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <h4 className="font-medium">
              Submitted Information 
            </h4>
            {existingCheck.provider && (
              <p className="text-sm"><strong>Provider:</strong> {existingCheck.provider}</p>
            )}
            {existingCheck.member_id && (
              <p className="text-sm"><strong>Member ID:</strong> {existingCheck.member_id}</p>
            )}
            {existingCheck.certificate_id && (
              <p className="text-sm"><strong>Certificate ID:</strong> {existingCheck.certificate_id}</p>
            )}
            {existingCheck.policy_number && (
              <p className="text-sm"><strong>Policy Number:</strong> {existingCheck.policy_number}</p>
            )}
            {existingCheck.coverage_amount && (
              <p className="text-sm"><strong>Coverage:</strong> £{existingCheck.coverage_amount.toLocaleString()}</p>
            )}
            {existingCheck.expiry_date && (
              <p className="text-sm"><strong>Expiry Date:</strong> {new Date(existingCheck.expiry_date).toLocaleDateString()}</p>
            )}
            {existingCheck.evidence_file_url && (
              <div className="text-sm">
                <strong>Document:</strong> 
                <a 
                  href={`https://ogpiovfxjxcclptfybrk.supabase.co/storage/v1/object/public/trainer-verification-documents/${existingCheck.evidence_file_url.split('/').pop()}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline ml-1 inline-flex items-center gap-1"
                >
                  <FileText className="h-4 w-4" />
                  View document
                </a>
              </div>
            )}
            {existingCheck.rejection_reason && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                <p className="text-sm text-red-700">{existingCheck.rejection_reason}</p>
              </div>
            )}
            {existingCheck.admin_notes && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-medium text-blue-800">Admin Notes:</p>
                <p className="text-sm text-blue-700">{existingCheck.admin_notes}</p>
              </div>
            )}
          </div>
        )}

              {/* Status message for pending/verified checks */}
              {existingCheck && (existingCheck.status === 'pending' || existingCheck.status === 'verified') && (
                <div className={`p-4 rounded-lg border ${
                  existingCheck.status === 'verified' 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {existingCheck.status === 'verified' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                    <p className="font-medium">
                      {existingCheck.status === 'verified' 
                        ? 'Verification Complete' 
                        : 'Submitted for Review'
                      }
                    </p>
                  </div>
                  <p className="text-sm mt-1">
                    {existingCheck.status === 'verified' 
                      ? 'Your verification has been approved and is now active.'
                      : 'Your verification request has been submitted and is being reviewed by our admin team. You will be notified once the review is complete.'
                    }
                  </p>
                </div>
              )}

              {/* Form for new submission or resubmission - only show if no check exists or check was rejected/expired */}
              {(() => {
                return (!existingCheck || existingCheck.status === 'rejected' || existingCheck.status === 'expired');
              })() && (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    {existingCheck?.status === 'rejected' && "Please update your information and resubmit."}
                    {existingCheck?.status === 'expired' && "Your verification has expired. Please submit updated information."}
                    {!existingCheck && "Complete the form below to submit for verification."}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.fields.includes('provider') && (
                      <div>
                        <Label htmlFor={`${checkType}-provider`}>Provider</Label>
                        <Input
                          id={`${checkType}-provider`}
                          value={formData[checkType]?.provider || ''}
                          onChange={(e) => handleInputChange(checkType, 'provider', e.target.value)}
                          placeholder="Insurance company / Certification provider"
                        />
                      </div>
                    )}

                    {config.fields.includes('member_id') && (
                      <div>
                        <Label htmlFor={`${checkType}-member_id`}>Member ID</Label>
                        <Input
                          id={`${checkType}-member_id`}
                          value={formData[checkType]?.member_id || ''}
                          onChange={(e) => handleInputChange(checkType, 'member_id', e.target.value)}
                          placeholder="Your CIMSPA member ID"
                        />
                      </div>
                    )}

                    {config.fields.includes('certificate_id') && (
                      <div>
                        <Label htmlFor={`${checkType}-certificate_id`}>Certificate ID</Label>
                        <Input
                          id={`${checkType}-certificate_id`}
                          value={formData[checkType]?.certificate_id || ''}
                          onChange={(e) => handleInputChange(checkType, 'certificate_id', e.target.value)}
                          placeholder="Certificate number"
                        />
                      </div>
                    )}

                    {config.fields.includes('policy_number') && (
                      <div>
                        <Label htmlFor={`${checkType}-policy_number`}>Policy Number</Label>
                        <Input
                          id={`${checkType}-policy_number`}
                          value={formData[checkType]?.policy_number || ''}
                          onChange={(e) => handleInputChange(checkType, 'policy_number', e.target.value)}
                          placeholder="Insurance policy number"
                        />
                      </div>
                    )}

                    {config.fields.includes('coverage_amount') && (
                      <div>
                        <Label htmlFor={`${checkType}-coverage`}>Coverage Amount (£)</Label>
                        <Input
                          id={`${checkType}-coverage`}
                          type="number"
                          value={formData[checkType]?.coverage_amount || ''}
                          onChange={(e) => handleInputChange(checkType, 'coverage_amount', parseInt(e.target.value))}
                          placeholder="1000000"
                        />
                      </div>
                    )}

                    {config.fields.includes('issue_date') && (
                      <div>
                        <Label htmlFor={`${checkType}-issue_date`}>Issue Date</Label>
                        <Input
                          id={`${checkType}-issue_date`}
                          type="date"
                          value={formData[checkType]?.issue_date || ''}
                          onChange={(e) => handleInputChange(checkType, 'issue_date', e.target.value)}
                        />
                      </div>
                    )}

                    {config.fields.includes('expiry_date') && (
                      <div>
                        <Label htmlFor={`${checkType}-expiry_date`}>Expiry Date</Label>
                        <Input
                          id={`${checkType}-expiry_date`}
                          type="date"
                          value={formData[checkType]?.expiry_date || ''}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => handleInputChange(checkType, 'expiry_date', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Must be a future date
                        </p>
                      </div>
                    )}
                  </div>

                  {config.fields.includes('file') && (
                    <div>
                      <Label htmlFor={`${checkType}-file`}>Upload Document</Label>
                      <Input
                        id={`${checkType}-file`}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => handleFileChange(checkType, e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => handleSubmitCheck(checkType as any)}
                    disabled={uploading === checkType || loading}
                    className="w-full"
                  >
                    {uploading === checkType ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit for Review
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Information Card */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-medium mb-2">Verification Benefits</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Display "Verified Coach" badge on your profile</li>
            <li>• Increased client trust and credibility</li>
            <li>• Higher visibility in search results</li>
            <li>• Access to premium features</li>
          </ul>

          <h4 className="font-medium mt-4 mb-2">Verification Process</h4>
          <ol className="text-sm text-muted-foreground space-y-1">
            <li>1. Submit required documentation</li>
            <li>2. Admin review (2-5 business days)</li>
            <li>3. Receive verification status notification</li>
            <li>4. Badge appears on profile (if enabled)</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};