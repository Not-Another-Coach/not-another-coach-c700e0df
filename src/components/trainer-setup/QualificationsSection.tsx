import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Search, Plus, CheckCircle, Clock, FileText } from "lucide-react";

interface QualificationsSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

const popularQualifications = [
  "NASM-CPT",
  "ACSM-CPT", 
  "ACE-CPT",
  "NSCA-CSCS",
  "CIMSPA",
  "REPs Level 3",
  "REPs Level 4",
  "Precision Nutrition",
  "FMS Level 1",
  "FMS Level 2",
  "TRX Certification",
  "Yoga Alliance RYT-200",
  "Yoga Alliance RYT-500",
  "Pilates Certification",
  "CrossFit Level 1",
  "CrossFit Level 2",
  "Pre/Postnatal Exercise Specialist",
  "Corrective Exercise Specialist",
  "Nutrition Coaching",
  "Mental Health First Aid"
];

export function QualificationsSection({ formData, updateFormData }: QualificationsSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [customQualification, setCustomQualification] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const filteredQualifications = popularQualifications.filter(qual =>
    qual.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQualificationToggle = (qualification: string) => {
    const current = formData.qualifications || [];
    const updated = current.includes(qualification)
      ? current.filter((q: string) => q !== qualification)
      : [...current, qualification];
    updateFormData({ qualifications: updated });
  };

  const handleAddCustomQualification = () => {
    if (customQualification.trim()) {
      const current = formData.qualifications || [];
      if (!current.includes(customQualification.trim())) {
        updateFormData({ qualifications: [...current, customQualification.trim()] });
      }
      setCustomQualification("");
    }
  };

  const handleFileUpload = (files: File[]) => {
    // TODO: Implement file upload to Supabase storage
    console.log("Uploading certificate files:", files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileUpload(files);
  };

  const removeQualification = (qualification: string) => {
    const current = formData.qualifications || [];
    updateFormData({ qualifications: current.filter((q: string) => q !== qualification) });
  };

  // Mock verification status for demonstration
  const getVerificationStatus = (qualification: string) => {
    // In real app, this would check against uploaded certificates and admin verification
    const verified = ["NASM-CPT", "ACE-CPT"].includes(qualification);
    const pending = ["ACSM-CPT"].includes(qualification);
    
    if (verified) return "verified";
    if (pending) return "pending";
    return "unverified";
  };

  return (
    <div className="space-y-6">
      {/* Selected Qualifications */}
      {formData.qualifications && formData.qualifications.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Qualifications</Label>
          <div className="flex flex-wrap gap-2">
            {formData.qualifications.map((qualification: string) => {
              const status = getVerificationStatus(qualification);
              return (
                <Badge
                  key={qualification}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1"
                >
                  <span>{qualification}</span>
                  {status === "verified" && (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  )}
                  {status === "pending" && (
                    <Clock className="h-3 w-3 text-amber-600" />
                  )}
                  <button
                    onClick={() => removeQualification(qualification)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Qualifications */}
      <div className="space-y-2">
        <Label>Select Your Qualifications *</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search qualifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Popular Qualifications */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
          {filteredQualifications.map((qualification) => (
            <div key={qualification} className="flex items-center space-x-2">
              <Checkbox
                id={qualification}
                checked={formData.qualifications?.includes(qualification) || false}
                onCheckedChange={() => handleQualificationToggle(qualification)}
              />
              <Label htmlFor={qualification} className="text-sm cursor-pointer">
                {qualification}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Qualification */}
      <div className="space-y-2">
        <Label>Add Custom Qualification</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter custom qualification..."
            value={customQualification}
            onChange={(e) => setCustomQualification(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomQualification()}
          />
          <Button
            variant="outline"
            onClick={handleAddCustomQualification}
            disabled={!customQualification.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Certificate Upload */}
      <div className="space-y-2">
        <Label>Upload Certificates</Label>
        <Card className={`border-2 border-dashed transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}>
          <CardContent className="p-6">
            <div
              className="text-center"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
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
                  <FileText className="h-4 w-4 mr-2" />
                  Browse Files
                </label>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Uploaded Certificates */}
        {formData.proof_upload_urls && formData.proof_upload_urls.length > 0 && (
          <div className="space-y-2 mt-4">
            <Label>Uploaded Certificates</Label>
            <div className="space-y-2">
              {formData.proof_upload_urls.map((url: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Certificate {index + 1}</span>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending Review
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Verification Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
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
}