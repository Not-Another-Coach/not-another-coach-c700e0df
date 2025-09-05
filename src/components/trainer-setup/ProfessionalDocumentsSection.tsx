import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, CheckCircle2, Clock, Upload, FileText, Shield, Award, X } from 'lucide-react';
import { useEnhancedTrainerVerification } from '@/hooks/useEnhancedTrainerVerification';
import { SectionHeader } from './SectionHeader';
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
  not_applicable?: boolean;
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

export const ProfessionalDocumentsSection = () => {
  const {
    loading,
    submitVerificationCheck,
    uploadDocument,
    getCheckByType,
  } = useEnhancedTrainerVerification();

  const [formData, setFormData] = useState<Record<string, VerificationCheckFormData>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [notApplicable, setNotApplicable] = useState<Record<string, boolean>>({});

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

  const handleNotApplicableChange = (checkType: string, isNotApplicable: boolean) => {
    setNotApplicable(prev => ({
      ...prev,
      [checkType]: isNotApplicable,
    }));
    
    // Clear form data when marking as not applicable
    if (isNotApplicable) {
      setFormData(prev => ({
        ...prev,
        [checkType]: { not_applicable: true },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [checkType]: { not_applicable: false },
      }));
    }
  };

  const isAnyFieldFilled = (checkType: string): boolean => {
    const data = formData[checkType];
    if (!data) return false;
    
    const fieldsToCheck = ['provider', 'member_id', 'certificate_id', 'policy_number', 'coverage_amount', 'issue_date', 'expiry_date', 'file'];
    return fieldsToCheck.some(field => {
      const value = data[field as keyof VerificationCheckFormData];
      return value !== undefined && value !== '' && value !== null;
    });
  };

  const validateRequiredFields = (checkType: keyof typeof CheckTypeConfig): string | null => {
    const data = formData[checkType];
    if (!data || notApplicable[checkType]) return null;

    // If any field is filled, all required fields become mandatory
    if (!isAnyFieldFilled(checkType)) return null;

    const config = CheckTypeConfig[checkType];
    const missingFields: string[] = [];

    config.fields.forEach(field => {
      const value = data[field as keyof VerificationCheckFormData];
      if (!value || value === '') {
        const fieldLabels: Record<string, string> = {
          provider: 'Provider',
          member_id: 'Member ID',
          certificate_id: 'Certificate ID',
          policy_number: 'Policy Number',
          coverage_amount: 'Coverage Amount',
          issue_date: 'Issue Date',
          expiry_date: 'Expiry Date',
          file: 'Document File',
        };
        missingFields.push(fieldLabels[field] || field);
      }
    });

    return missingFields.length > 0 ? `Missing required fields: ${missingFields.join(', ')}` : null;
  };

  const handleSubmitCheck = async (checkType: keyof typeof CheckTypeConfig) => {
    const data = formData[checkType];
    
    // Handle not applicable submissions
    if (notApplicable[checkType]) {
      toast.success(`${CheckTypeConfig[checkType].title} marked as not applicable`);
      return;
    }

    if (!data) return;

    // Validate required fields
    const validationError = validateRequiredFields(checkType);
    if (validationError) {
      toast.error(validationError);
      return;
    }

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
      
      toast.success(`${CheckTypeConfig[checkType].title} submitted successfully`);
    } catch (error) {
      console.error('Error submitting verification check:', error);
      toast.error(`Failed to submit ${CheckTypeConfig[checkType].title}`);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        icons={[FileText, Shield]}
        title="Professional Documents"
        description="Upload your professional certifications, insurance, and qualifications"
      />

      {/* Verification Checks */}
      {Object.entries(CheckTypeConfig).map(([checkType, config]) => {
        const existingCheck = getCheckByType(checkType as any);
        const statusConfig = existingCheck ? StatusConfig[existingCheck.status] : null;
        const IconComponent = config.icon;
        const isNotApplicableSet = notApplicable[checkType];
        const anyFieldFilled = isAnyFieldFilled(checkType);

        return (
          <Card key={checkType} className={`transition-colors ${
            anyFieldFilled && !existingCheck?.status ? 'border-amber-200 bg-amber-50/30' : ''
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  {config.title}
                  {config.required && !isNotApplicableSet && (
                    <span className={`text-red-500 ${anyFieldFilled ? 'font-bold' : ''}`}>
                      {anyFieldFilled ? '*' : ''}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isNotApplicableSet && (
                    <Badge variant="secondary">
                      <X className="h-3 w-3 mr-1" />
                      Not Applicable
                    </Badge>
                  )}
                  {statusConfig && (
                    <Badge className={statusConfig.color}>
                      <statusConfig.icon className="h-3 w-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{config.description}</p>

              {/* Not Applicable Toggle */}
              {!existingCheck && (
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <Label htmlFor={`${checkType}-not-applicable`} className="font-medium">
                      Not Applicable
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Check this if you don't have this type of document
                    </p>
                  </div>
                  <Switch
                    id={`${checkType}-not-applicable`}
                    checked={isNotApplicableSet}
                    onCheckedChange={(checked) => handleNotApplicableChange(checkType, checked)}
                  />
                </div>
              )}

              {/* Show existing check details if verified or under review */}
              {existingCheck && (
                <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                  <h4 className="font-medium">Submitted Information</h4>
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

              {/* Form for new submission or resubmission */}
              {(!existingCheck || existingCheck.status === 'rejected' || existingCheck.status === 'expired') && !isNotApplicableSet && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.fields.includes('provider') && (
                      <div>
                        <Label htmlFor={`${checkType}-provider`} className={anyFieldFilled ? 'text-red-600 font-medium' : ''}>
                          Provider {anyFieldFilled && '*'}
                        </Label>
                        <Input
                          id={`${checkType}-provider`}
                          value={formData[checkType]?.provider || ''}
                          onChange={(e) => handleInputChange(checkType, 'provider', e.target.value)}
                          placeholder="Insurance company / Certification provider"
                          className={anyFieldFilled && !formData[checkType]?.provider ? 'border-red-300' : ''}
                        />
                      </div>
                    )}

                    {config.fields.includes('member_id') && (
                      <div>
                        <Label htmlFor={`${checkType}-member_id`} className={anyFieldFilled ? 'text-red-600 font-medium' : ''}>
                          Member ID {anyFieldFilled && '*'}
                        </Label>
                        <Input
                          id={`${checkType}-member_id`}
                          value={formData[checkType]?.member_id || ''}
                          onChange={(e) => handleInputChange(checkType, 'member_id', e.target.value)}
                          placeholder="Your CIMSPA member ID"
                          className={anyFieldFilled && !formData[checkType]?.member_id ? 'border-red-300' : ''}
                        />
                      </div>
                    )}

                    {config.fields.includes('certificate_id') && (
                      <div>
                        <Label htmlFor={`${checkType}-certificate_id`} className={anyFieldFilled ? 'text-red-600 font-medium' : ''}>
                          Certificate ID {anyFieldFilled && '*'}
                        </Label>
                        <Input
                          id={`${checkType}-certificate_id`}
                          value={formData[checkType]?.certificate_id || ''}
                          onChange={(e) => handleInputChange(checkType, 'certificate_id', e.target.value)}
                          placeholder="Certificate number"
                          className={anyFieldFilled && !formData[checkType]?.certificate_id ? 'border-red-300' : ''}
                        />
                      </div>
                    )}

                    {config.fields.includes('policy_number') && (
                      <div>
                        <Label htmlFor={`${checkType}-policy_number`} className={anyFieldFilled ? 'text-red-600 font-medium' : ''}>
                          Policy Number {anyFieldFilled && '*'}
                        </Label>
                        <Input
                          id={`${checkType}-policy_number`}
                          value={formData[checkType]?.policy_number || ''}
                          onChange={(e) => handleInputChange(checkType, 'policy_number', e.target.value)}
                          placeholder="Insurance policy number"
                          className={anyFieldFilled && !formData[checkType]?.policy_number ? 'border-red-300' : ''}
                        />
                      </div>
                    )}

                    {config.fields.includes('coverage_amount') && (
                      <div>
                        <Label htmlFor={`${checkType}-coverage`} className={anyFieldFilled ? 'text-red-600 font-medium' : ''}>
                          Coverage Amount (£) {anyFieldFilled && '*'}
                        </Label>
                        <Input
                          id={`${checkType}-coverage`}
                          type="number"
                          value={formData[checkType]?.coverage_amount || ''}
                          onChange={(e) => handleInputChange(checkType, 'coverage_amount', parseInt(e.target.value))}
                          placeholder="1000000"
                          className={anyFieldFilled && !formData[checkType]?.coverage_amount ? 'border-red-300' : ''}
                        />
                      </div>
                    )}

                    {config.fields.includes('issue_date') && (
                      <div>
                        <Label htmlFor={`${checkType}-issue_date`} className={anyFieldFilled ? 'text-red-600 font-medium' : ''}>
                          Issue Date {anyFieldFilled && '*'}
                        </Label>
                        <Input
                          id={`${checkType}-issue_date`}
                          type="date"
                          value={formData[checkType]?.issue_date || ''}
                          onChange={(e) => handleInputChange(checkType, 'issue_date', e.target.value)}
                          className={anyFieldFilled && !formData[checkType]?.issue_date ? 'border-red-300' : ''}
                        />
                      </div>
                    )}

                    {config.fields.includes('expiry_date') && (
                      <div>
                        <Label htmlFor={`${checkType}-expiry_date`} className={anyFieldFilled ? 'text-red-600 font-medium' : ''}>
                          Expiry Date {anyFieldFilled && '*'}
                        </Label>
                        <Input
                          id={`${checkType}-expiry_date`}
                          type="date"
                          value={formData[checkType]?.expiry_date || ''}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => handleInputChange(checkType, 'expiry_date', e.target.value)}
                          className={anyFieldFilled && !formData[checkType]?.expiry_date ? 'border-red-300' : ''}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Must be a future date
                        </p>
                      </div>
                    )}
                  </div>

                  {config.fields.includes('file') && (
                    <div>
                      <Label htmlFor={`${checkType}-file`} className={anyFieldFilled ? 'text-red-600 font-medium' : ''}>
                        Upload Document {anyFieldFilled && '*'}
                      </Label>
                      <Input
                        id={`${checkType}-file`}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => handleFileChange(checkType, e.target.files?.[0] || null)}
                        className={`cursor-pointer ${anyFieldFilled && !formData[checkType]?.file ? 'border-red-300' : ''}`}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                      </p>
                    </div>
                  )}

                  {anyFieldFilled && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800 font-medium">
                        ⚠️ All fields are now required
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Since you've started filling this document, all fields marked with * are now mandatory to submit.
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => handleSubmitCheck(checkType as any)}
                    disabled={uploading === checkType || loading}
                    className="w-full"
                    variant={anyFieldFilled && validateRequiredFields(checkType as any) ? "destructive" : "default"}
                  >
                    {uploading === checkType ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {isNotApplicableSet ? 'Mark as Not Applicable' : `Submit ${config.title}`}
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
          <h4 className="font-medium mb-2">Required Documentation</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• CIMSPA Membership: Current membership with valid expiry date</li>
            <li>• Professional Insurance: Public liability and indemnity insurance</li>
            <li>• First Aid Certification: Current first aid certification from recognized provider</li>
          </ul>

          <h4 className="font-medium mt-4 mb-2">Upload Guidelines</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Documents must be clear and legible</li>
            <li>• All expiry dates must be in the future</li>
            <li>• Accepted formats: PDF, JPG, PNG, DOC, DOCX</li>
            <li>• Maximum file size: 10MB per document</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};