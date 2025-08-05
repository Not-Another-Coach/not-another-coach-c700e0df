import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Upload, Users, CheckCircle, XCircle, FileText, Download, Eye, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BulkUserData {
  email: string;
  password: string;
  user_type: 'client' | 'trainer';
  first_name: string;
  last_name: string;
  [key: string]: any;
}

interface UploadResult {
  email: string;
  user_id?: string;
  status: 'success' | 'error';
  error?: string;
  user_type: 'client' | 'trainer';
}

interface UploadSummary {
  total: number;
  successful: number;
  failed: number;
}

export const BulkUserUpload = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<{
    summary: UploadSummary;
    results: UploadResult[];
  } | null>(null);
  const [jsonData, setJsonData] = useState<BulkUserData[] | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Maximum file size (5MB) and user count
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const MAX_USERS = 1000;

  const downloadTemplate = () => {
    const template = {
      users: [
        {
          email: "client1@example.com",
          password: "SecurePass123!",
          user_type: "client",
          first_name: "John",
          last_name: "Doe",
          primary_goals: ["weight_loss", "strength"],
          secondary_goals: ["flexibility"],
          training_location_preference: "hybrid",
          open_to_virtual_coaching: true,
          preferred_training_frequency: 3,
          preferred_time_slots: ["morning", "evening"],
          start_timeline: "next_month",
          preferred_coaching_style: ["motivational", "structured"],
          motivation_factors: ["health", "confidence"],
          client_personality_type: ["extroverted", "goal_oriented"],
          experience_level: "beginner",
          preferred_package_type: "ongoing",
          budget_range_min: 50,
          budget_range_max: 100,
          budget_flexibility: "flexible",
          waitlist_preference: "quality_over_speed",
          flexible_scheduling: true
        },
        {
          email: "trainer1@example.com",
          password: "SecurePass123!",
          user_type: "trainer",
          first_name: "Sarah",
          last_name: "Johnson",
          bio: "Certified personal trainer with 5+ years experience specializing in weight loss and strength training. Passionate about helping clients achieve their fitness goals through personalized workout plans.",
          tagline: "Transform your body, transform your life",
          location: "San Francisco, CA",
          training_types: ["personal_training", "group_fitness"],
          specializations: ["weight_loss", "strength_training", "nutrition"],
          qualifications: ["NASM-CPT", "Nutrition Specialist"],
          ideal_client_types: ["beginners", "weight_loss_focused"],
          coaching_styles: ["motivational", "structured"],
          hourly_rate: 85,
          years_certified: 5,
          training_vibe: "energetic",
          communication_style: "supportive",
          delivery_format: ["in_person", "virtual"],
          max_clients: 20,
          packages: [
            {
              id: "starter-package",
              name: "Starter Transformation",
              price: 299,
              duration: "4 weeks",
              description: "Perfect for beginners ready to start their fitness journey",
              sessions: 8,
              includes: ["Personalized workout plan", "Nutrition guidance", "Progress tracking"]
            }
          ]
        }
      ]
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-users-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Template downloaded",
      description: "Use this template as a starting point for your bulk upload",
    });
  };

  const validateUsers = (users: BulkUserData[]): string[] => {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails = new Set<string>();

    // File size and count validation
    if (users.length > MAX_USERS) {
      errors.push(`Too many users: ${users.length}. Maximum allowed: ${MAX_USERS}`);
    }

    users.forEach((user, index) => {
      const userNum = index + 1;

      // Required field validation
      const requiredFields = ['email', 'password', 'user_type', 'first_name', 'last_name'];
      const missingFields = requiredFields.filter(field => !user[field]);
      if (missingFields.length > 0) {
        errors.push(`User ${userNum}: Missing required fields: ${missingFields.join(', ')}`);
      }

      // Email validation
      if (user.email && !emailRegex.test(user.email)) {
        errors.push(`User ${userNum}: Invalid email format: ${user.email}`);
      }

      // Duplicate email check
      if (user.email) {
        if (emails.has(user.email.toLowerCase())) {
          errors.push(`User ${userNum}: Duplicate email: ${user.email}`);
        } else {
          emails.add(user.email.toLowerCase());
        }
      }

      // User type validation
      if (user.user_type && !['client', 'trainer'].includes(user.user_type)) {
        errors.push(`User ${userNum}: Invalid user_type: ${user.user_type}. Must be 'client' or 'trainer'`);
      }

      // Password strength validation
      if (user.password && user.password.length < 8) {
        errors.push(`User ${userNum}: Password too short. Minimum 8 characters required`);
      }

      // Trainer-specific validations
      if (user.user_type === 'trainer') {
        if (user.hourly_rate && (user.hourly_rate < 10 || user.hourly_rate > 500)) {
          errors.push(`User ${userNum}: Hourly rate should be between $10-$500`);
        }
      }

      // Client-specific validations
      if (user.user_type === 'client') {
        if (user.budget_range_min && user.budget_range_max && user.budget_range_min > user.budget_range_max) {
          errors.push(`User ${userNum}: Budget minimum cannot be greater than maximum`);
        }
      }
    });

    return errors;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => file.type === 'application/json' || file.name.endsWith('.json'));
    
    if (jsonFile) {
      processFile(jsonFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a JSON file",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    try {
      // File size check
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum allowed: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate the structure
      if (!data.users || !Array.isArray(data.users)) {
        throw new Error('JSON must contain a "users" array');
      }

      if (data.users.length === 0) {
        throw new Error('No users found in the file');
      }

      // Validate users
      const errors = validateUsers(data.users);
      setValidationErrors(errors);

      if (errors.length > 0) {
        toast({
          title: "Validation errors found",
          description: `${errors.length} validation errors detected. Please review before uploading.`,
          variant: "destructive",
        });
      }

      setJsonData(data.users);
      setUploadResults(null);
      setShowPreview(false);
      
      toast({
        title: "File loaded successfully",
        description: `Found ${data.users.length} users${errors.length > 0 ? ' with validation errors' : ' ready for upload'}`,
        variant: errors.length > 0 ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        title: "Invalid JSON file",
        description: error instanceof Error ? error.message : "Failed to parse JSON",
        variant: "destructive",
      });
    }
  };

  const uploadUsers = async () => {
    if (!jsonData || validationErrors.length > 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data, error } = await supabase.functions.invoke('bulk-create-users', {
        body: { users: jsonData }
      });

      if (error) {
        throw error;
      }

      setUploadResults(data);
      setUploadProgress(100);
      
      toast({
        title: "Upload completed",
        description: `Successfully created ${data.summary.successful} users, ${data.summary.failed} failed`,
        variant: data.summary.failed === 0 ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const retryFailedUsers = async () => {
    if (!uploadResults) return;

    const failedEmails = uploadResults.results
      .filter(result => result.status === 'error')
      .map(result => result.email);
    
    const failedUsers = jsonData?.filter(user => failedEmails.includes(user.email)) || [];

    if (failedUsers.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data, error } = await supabase.functions.invoke('bulk-create-users', {
        body: { users: failedUsers }
      });

      if (error) {
        throw error;
      }

      // Merge results
      const newResults = [...uploadResults.results];
      data.results.forEach((newResult: UploadResult) => {
        const index = newResults.findIndex(r => r.email === newResult.email);
        if (index >= 0) {
          newResults[index] = newResult;
        }
      });

      const newSummary = {
        total: uploadResults.summary.total,
        successful: newResults.filter(r => r.status === 'success').length,
        failed: newResults.filter(r => r.status === 'error').length
      };

      setUploadResults({
        summary: newSummary,
        results: newResults
      });
      
      setUploadProgress(100);
      
      toast({
        title: "Retry completed",
        description: `Successfully created ${data.summary.successful} additional users`,
      });
    } catch (error) {
      toast({
        title: "Retry failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setJsonData(null);
    setUploadResults(null);
    setValidationErrors([]);
    setShowPreview(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Bulk User Upload
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload multiple users at once using a JSON file. Supports both clients and trainers.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header Actions */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Maximum: {MAX_USERS.toLocaleString()} users, {MAX_FILE_SIZE / 1024 / 1024}MB file size
            </div>
            <Button 
              onClick={downloadTemplate} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Template
            </Button>
          </div>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`p-4 rounded-full ${isDragOver ? 'bg-primary/10' : 'bg-muted/50'}`}>
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  Drop your JSON file here, or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary hover:underline"
                  >
                    browse files
                  </button>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports JSON files with user data
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">
                    {validationErrors.length} validation errors found:
                  </div>
                  <ScrollArea className="h-32 w-full">
                    <ul className="text-sm space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="list-disc list-inside">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* File Preview */}
          {jsonData && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>{jsonData.length} users</strong> loaded from JSON file
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">
                        {jsonData.filter(u => u.user_type === 'client').length} Clients
                      </Badge>
                      <Badge variant="outline">
                        {jsonData.filter(u => u.user_type === 'trainer').length} Trainers
                      </Badge>
                      {validationErrors.length > 0 && (
                        <Badge variant="destructive">
                          {validationErrors.length} Errors
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setShowPreview(!showPreview)} 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {showPreview ? 'Hide' : 'Preview'}
                    </Button>
                    <Button 
                      onClick={uploadUsers} 
                      disabled={isUploading || validationErrors.length > 0}
                      size="sm"
                    >
                      {isUploading ? 'Uploading...' : 'Upload Users'}
                    </Button>
                    <Button 
                      onClick={resetUpload} 
                      variant="outline" 
                      size="sm"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Data Preview Table */}
          {showPreview && jsonData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Data Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jsonData.slice(0, 50).map((user, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-xs">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.user_type === 'trainer' ? 'default' : 'secondary'}>
                              {user.user_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.first_name} {user.last_name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {user.user_type === 'trainer' 
                              ? `$${user.hourly_rate || 'N/A'}/hr`
                              : `Budget: $${user.budget_range_min || 'N/A'}-${user.budget_range_max || 'N/A'}`
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {jsonData.length > 50 && (
                    <div className="text-center text-sm text-muted-foreground mt-2">
                      Showing first 50 of {jsonData.length} users
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Creating users...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Results */}
          {uploadResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {uploadResults.summary.failed === 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  )}
                  Upload Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{uploadResults.summary.total}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{uploadResults.summary.successful}</div>
                    <div className="text-sm text-muted-foreground">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{uploadResults.summary.failed}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                </div>

                {uploadResults.summary.failed > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Failed Users:</h4>
                      <Button
                        onClick={retryFailedUsers}
                        disabled={isUploading}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Retry Failed ({uploadResults.summary.failed})
                      </Button>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {uploadResults.results
                        .filter(result => result.status === 'error')
                        .map((result, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm p-2 bg-red-50 rounded">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span>{result.email}</span>
                            <span className="text-muted-foreground">- {result.error}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* JSON Format Example */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">JSON Format Example</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`{
  "users": [
    {
      "email": "client@example.com",
      "password": "password123",
      "user_type": "client",
      "first_name": "John",
      "last_name": "Doe",
      "primary_goals": ["weight_loss", "strength"],
      "budget_range_min": 50,
      "budget_range_max": 100
    },
    {
      "email": "trainer@example.com", 
      "password": "password123",
      "user_type": "trainer",
      "first_name": "Jane",
      "last_name": "Smith",
      "bio": "Experienced trainer",
      "hourly_rate": 80,
      "specializations": ["weight_loss"]
    }
  ]
}`}
              </pre>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};