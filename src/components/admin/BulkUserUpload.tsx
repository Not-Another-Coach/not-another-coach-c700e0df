import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Upload, Users, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate the structure
      if (!data.users || !Array.isArray(data.users)) {
        throw new Error('JSON must contain a "users" array');
      }

      // Basic validation of user objects
      const requiredFields = ['email', 'password', 'user_type', 'first_name', 'last_name'];
      const invalidUsers = data.users.filter((user: any) => 
        !requiredFields.every(field => user[field])
      );

      if (invalidUsers.length > 0) {
        throw new Error(`${invalidUsers.length} users are missing required fields (email, password, user_type, first_name, last_name)`);
      }

      setJsonData(data.users);
      setUploadResults(null);
      toast({
        title: "File loaded successfully",
        description: `Found ${data.users.length} users ready for upload`,
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
    if (!jsonData) return;

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

  const resetUpload = () => {
    setJsonData(null);
    setUploadResults(null);
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
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={uploadUsers} 
                      disabled={isUploading}
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
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Failed Users:</h4>
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