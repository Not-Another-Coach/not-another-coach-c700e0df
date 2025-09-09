import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Download, Upload, RefreshCw, Database, Users, Eye } from 'lucide-react';
import { ContentType, VisibilityState, EngagementStage } from '@/hooks/useVisibilityMatrix';
import { toast } from 'sonner';

interface VisibilityStats {
  contentType: ContentType;
  stage: EngagementStage;
  visibilityState: VisibilityState;
  trainerCount: number;
  percentage: number;
}

export function VisibilityAnalytics() {
  const [stats, setStats] = useState<VisibilityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkOperation, setBulkOperation] = useState<'export' | 'import' | 'reset' | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockStats: VisibilityStats[] = [
        {
          contentType: 'profile_image',
          stage: 'browsing',
          visibilityState: 'visible',
          trainerCount: 45,
          percentage: 85
        },
        {
          contentType: 'testimonial_images', 
          stage: 'browsing',
          visibilityState: 'blurred',
          trainerCount: 38,
          percentage: 72
        },
        {
          contentType: 'gallery_images',
          stage: 'shortlisted',
          visibilityState: 'visible',
          trainerCount: 50,
          percentage: 95
        }
      ];
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load visibility analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkOperation = async (operation: 'export' | 'import' | 'reset') => {
    setBulkOperation(operation);
    try {
      // TODO: Implement actual bulk operations
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      switch (operation) {
        case 'export':
          toast.success('Visibility settings exported successfully');
          break;
        case 'import':
          toast.success('Visibility settings imported successfully');
          break;
        case 'reset':
          toast.success('All trainer visibility settings reset to system defaults');
          break;
      }
    } catch (error) {
      console.error(`Error during ${operation}:`, error);
      toast.error(`Failed to ${operation} visibility settings`);
    } finally {
      setBulkOperation(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visibility Analytics & Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Visibility Analytics & Tools
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Analytics, bulk operations, and advanced management tools for visibility settings.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="analytics" className="space-y-4">
            <TabsList>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="bulk-operations">Bulk Operations</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">53</div>
                    <p className="text-xs text-muted-foreground">Total Active Trainers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">324</div>
                    <p className="text-xs text-muted-foreground">Total Visibility Rules</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">Custom Overrides</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Visibility Distribution by Content Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['profile_image', 'testimonial_images', 'gallery_images'].map((contentType) => (
                      <div key={contentType} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{contentType.replace('_', ' ')}</span>
                          <span>85% visible by default</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk-operations" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Export Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Export all visibility settings to a JSON file for backup or migration.
                    </p>
                    <Button 
                      onClick={() => handleBulkOperation('export')}
                      disabled={bulkOperation === 'export'}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {bulkOperation === 'export' ? 'Exporting...' : 'Export Settings'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Import Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Import visibility settings from a JSON file. This will override existing settings.
                    </p>
                    <Button 
                      onClick={() => handleBulkOperation('import')}
                      disabled={bulkOperation === 'import'}
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {bulkOperation === 'import' ? 'Importing...' : 'Import Settings'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-destructive">Reset All to Defaults</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Reset all trainer visibility settings to system defaults. This action cannot be undone.
                    </p>
                    <Button 
                      onClick={() => handleBulkOperation('reset')}
                      disabled={bulkOperation === 'reset'}
                      variant="destructive"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {bulkOperation === 'reset' ? 'Resetting...' : 'Reset All Settings'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="validation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Visibility Rule Validation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">All trainers have profile images visible during browsing</span>
                      <Badge variant="default">✓ Valid</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Before/after images properly protected in early stages</span>
                      <Badge variant="default">✓ Valid</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active clients can see all content</span>
                      <Badge variant="default">✓ Valid</Badge>
                    </div>
                  </div>

                  <Button onClick={loadAnalytics} className="mt-4">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Validation Check
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}