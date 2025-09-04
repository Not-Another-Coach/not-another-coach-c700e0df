import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Upload, FileText, Eye, Trash2, Plus, Send, Search, CheckCircle, Clock } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  usePopularQualifications, 
  useTrainerCustomRequests, 
  useCreateCustomQualificationRequest,
  useTrackQualificationUsage
} from '@/hooks/useQualifications';

interface QualificationsSectionProps {
  formData: {
    qualifications?: string[];
    certificates?: Array<{
      name: string;
      url: string;
      type: string;
      qualification: string;
    }>;
  };
  updateFormData: (updates: any) => void;
}

const CATEGORIES = [
  { value: 'personal_training', label: 'Personal Training' },
  { value: 'strength_training', label: 'Strength Training' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'pilates', label: 'Pilates' },
  { value: 'crossfit', label: 'CrossFit' },
  { value: 'functional_training', label: 'Functional Training' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'dance_fitness', label: 'Dance Fitness' },
  { value: 'barre', label: 'Barre' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'specialty', label: 'Specialty' },
  { value: 'general', label: 'General' },
];

export const QualificationsSection: React.FC<QualificationsSectionProps> = ({
  formData,
  updateFormData,
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [customQualification, setCustomQualification] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [newRequestData, setNewRequestData] = useState({
    qualification_name: '',
    category: 'general',
    description: '',
  });

  // Hooks for fetching data
  const { data: popularQualifications = [], isLoading: loadingQualifications } = usePopularQualifications();
  const { data: customRequests = [] } = useTrainerCustomRequests();
  const createCustomRequest = useCreateCustomQualificationRequest();
  const trackUsage = useTrackQualificationUsage();

  const handleQualificationToggle = (qualification: string, qualificationId?: string) => {
    const currentQualifications = formData.qualifications || [];
    let updatedQualifications;
    
    if (currentQualifications.includes(qualification)) {
      updatedQualifications = currentQualifications.filter(q => q !== qualification);
    } else {
      updatedQualifications = [...currentQualifications, qualification];
      
      // Track usage if qualification ID is available
      if (qualificationId) {
        trackUsage.mutate({
          qualification_id: qualificationId,
          qualification_type: 'popular'
        });
      }
    }
    
    updateFormData({ qualifications: updatedQualifications });
  };

  const handleAddCustomQualification = () => {
    if (customQualification.trim()) {
      const currentQualifications = formData.qualifications || [];
      if (!currentQualifications.includes(customQualification.trim())) {
        updateFormData({ 
          qualifications: [...currentQualifications, customQualification.trim()] 
        });
      }
      setCustomQualification('');
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('trainer-documents')
          .upload(filePath, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('trainer-documents')
          .getPublicUrl(filePath);

        return {
          name: file.name,
          url: urlData.publicUrl,
          type: file.type,
          qualification: '', // Will be linked to specific qualification later
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const currentCertificates = formData.certificates || [];
      
      updateFormData({ 
        certificates: [...currentCertificates, ...uploadedFiles]
      });
      
      toast.success(`${uploadedFiles.length} certificate(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload certificates');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileUpload(files);
  };

  const removeQualification = (qualification: string) => {
    const currentQualifications = formData.qualifications || [];
    updateFormData({ 
      qualifications: currentQualifications.filter(q => q !== qualification) 
    });
  };

  const removeCertificate = (index: number) => {
    const currentCertificates = formData.certificates || [];
    updateFormData({ 
      certificates: currentCertificates.filter((_, i) => i !== index) 
    });
  };

  // Mock verification status for demonstration
  const getVerificationStatus = (qualification: string) => {
    // In real app, this would check against uploaded certificates and admin verification
    const verified = ["NASM Certified Personal Trainer", "ACE Personal Trainer Certification"].includes(qualification);
    const pending = ["ACSM Certified Personal Trainer"].includes(qualification);
    
    if (verified) return "verified";
    if (pending) return "pending";
    return "unverified";
  };

  const handleSubmitCustomRequest = () => {
    if (!newRequestData.qualification_name.trim()) {
      toast.error('Please enter a qualification name');
      return;
    }

    createCustomRequest.mutate(newRequestData, {
      onSuccess: () => {
        setRequestDialogOpen(false);
        setNewRequestData({
          qualification_name: '',
          category: 'general',
          description: '',
        });
      }
    });
  };

  // Filter qualifications based on search term
  const filteredQualifications = popularQualifications.filter(qualification =>
    qualification.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingQualifications) {
    return (
      <div className="space-y-6">
        <SectionHeader
          icons={[CheckCircle, FileText]}
          title="Qualifications & Certifications"
          description="Select your qualifications and upload certificates to build trust with potential clients."
        />
        <Card>
          <CardContent className="p-6">
            <div>Loading qualifications...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        icons={[CheckCircle, FileText]}
        title="Qualifications & Certifications"
        description="Select your qualifications and upload certificates to build trust with potential clients."
      />

      {/* Selected Qualifications */}
      {((formData.qualifications && formData.qualifications.length > 0) || customRequests.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Qualifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {/* Regular qualifications */}
              {formData.qualifications?.map((qualification: string) => {
                const status = getVerificationStatus(qualification);
                return (
                  <Badge
                    key={qualification}
                    variant="outline"
                    className="flex items-center gap-2 px-3 py-1"
                  >
                    <span>{qualification}</span>
                    {status === "verified" && (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    )}
                    {status === "pending" && (
                      <Clock className="w-3 h-3 text-amber-600" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQualification(qualification)}
                      className="h-auto p-0 ml-2 hover:bg-transparent"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                );
              })}

              {/* Custom qualification requests */}
              {customRequests.map((request) => (
                <Badge
                  key={`custom-${request.id}`}
                  variant={
                    request.status === 'approved' ? 'default' :
                    request.status === 'rejected' ? 'destructive' : 'secondary'
                  }
                  className="flex items-center gap-2 px-3 py-1"
                >
                  <span>{request.qualification_name}</span>
                  {request.status === 'approved' && (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  )}
                  {request.status === 'pending' && (
                    <Clock className="w-3 h-3 text-amber-600" />
                  )}
                  {request.status === 'rejected' && (
                    <X className="w-3 h-3 text-red-600" />
                  )}
                  <Badge 
                    variant="outline" 
                    className="text-xs ml-1 bg-background"
                  >
                    {request.status}
                  </Badge>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Select Qualifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Popular Qualifications</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search qualifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredQualifications.map((qualification) => (
                <div key={qualification.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={qualification.id}
                    checked={formData.qualifications?.includes(qualification.name) || false}
                    onCheckedChange={() => handleQualificationToggle(qualification.name, qualification.id)}
                  />
                  <label 
                    htmlFor={qualification.id}
                    className="text-sm cursor-pointer flex-1 flex items-center justify-between"
                  >
                    <span>{qualification.name}</span>
                    {qualification.requires_verification && (
                      <Badge variant="outline" className="text-xs ml-2">
                        Cert Required
                      </Badge>
                    )}
                  </label>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter custom qualification"
                  value={customQualification}
                  onChange={(e) => setCustomQualification(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCustomQualification();
                    }
                  }}
                />
                <Button 
                  onClick={handleAddCustomQualification}
                  className="shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex justify-center">
                <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-sm">
                      <Send className="w-4 h-4 mr-2" />
                      Request New Qualification
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Request New Qualification</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="new-qualification-name">Qualification Name *</Label>
                        <Input
                          id="new-qualification-name"
                          value={newRequestData.qualification_name}
                          onChange={(e) => setNewRequestData({
                            ...newRequestData,
                            qualification_name: e.target.value
                          })}
                          placeholder="e.g., Advanced Nutrition Specialist"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="new-qualification-category">Category</Label>
                        <Select
                          value={newRequestData.category}
                          onValueChange={(value) => setNewRequestData({
                            ...newRequestData,
                            category: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="new-qualification-description">Description (Optional)</Label>
                        <Textarea
                          id="new-qualification-description"
                          value={newRequestData.description}
                          onChange={(e) => setNewRequestData({
                            ...newRequestData,
                            description: e.target.value
                          })}
                          placeholder="Brief description of this qualification"
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setRequestDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitCustomRequest}
                          disabled={createCustomRequest.isPending}
                        >
                          Submit Request
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <Card 
            className={`border-2 border-dashed transition-colors cursor-pointer ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
          >
            <CardContent className="p-6">
              <div
                className="text-center"
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-2">
                  Drag & drop your certificates here
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  or click to browse • PDF, JPG, PNG accepted
                </p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="certificate-upload"
                />
                <Button variant="outline" size="sm" asChild>
                  <label htmlFor="certificate-upload" className="cursor-pointer">
                    <FileText className="w-4 h-4 mr-2" />
                    Browse Files
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Uploaded Certificates */}
          {formData.certificates && formData.certificates.length > 0 && (
            <div className="space-y-2 mt-4">
              <Label>Uploaded Certificates</Label>
              <div className="space-y-2">
                {formData.certificates.map((file: any, index: number) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm font-medium">{file.name}</span>
                          <Badge variant="outline" className="text-xs ml-2">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending Review
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            console.log('Attempting to view file:', file.name, 'URL:', file.url);
                            // Since the bucket is now public, directly open the file
                            window.open(file.url, '_blank');
                          }}
                          className="text-xs"
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCertificate(index)}
                          className="text-destructive hover:text-destructive text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Certificate Verification
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Our team will review your uploaded certificates within 2-3 business days. 
                Verified credentials will display a green badge on your profile.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};