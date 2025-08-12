import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  BarChart3, 
  Users, 
  GitBranch, 
  Zap, 
  CheckCircle, 
  TrendingUp,
  Filter,
  PlayCircle,
  History
} from 'lucide-react';

export function AdvancedTemplatesArticle() {
  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header className="text-center space-y-4">
        <Badge variant="default" className="mb-2">
          New Feature
        </Badge>
        <h1 className="text-4xl font-bold">Advanced Onboarding Templates</h1>
        <p className="text-xl text-muted-foreground">
          Powerful template features with conditional logic, analytics, bulk operations, and version control
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>Published: {new Date().toLocaleDateString()}</span>
          <Separator orientation="vertical" className="h-4" />
          <span>Reading time: 8 min</span>
        </div>
      </header>

      {/* Introduction */}
      <section className="space-y-4">
        <p className="text-lg">
          Our advanced template system revolutionizes how trainers create, manage, and optimize their client onboarding process. 
          With smart conditional logic, comprehensive analytics, and powerful automation tools, you can deliver personalized 
          experiences at scale while maintaining complete control over your workflow.
        </p>
      </section>

      {/* Features Overview */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Key Features</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Conditional Logic
              </CardTitle>
              <CardDescription>
                Dynamic onboarding flows that adapt based on client responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Package-based step visibility
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Dependency-driven workflows
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Client response triggers
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Template Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive insights into template performance and usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Completion rate tracking
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Usage metrics and trends
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Performance KPIs
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                Bulk Operations
              </CardTitle>
              <CardDescription>
                Scale your operations with powerful batch processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  Mass template assignments
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  Bulk step updates
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  Progress tracking
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-green-500" />
                Version Control
              </CardTitle>
              <CardDescription>
                Track changes and rollback with confidence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <History className="h-4 w-4 text-purple-500" />
                  Change tracking
                </li>
                <li className="flex items-center gap-2">
                  <History className="h-4 w-4 text-purple-500" />
                  Version snapshots
                </li>
                <li className="flex items-center gap-2">
                  <History className="h-4 w-4 text-purple-500" />
                  Easy rollback
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Conditional Logic Deep Dive */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Filter className="h-6 w-6" />
          Conditional Logic in Detail
        </h2>
        
        <div className="space-y-4">
          <p>
            Conditional logic allows you to create dynamic onboarding flows that automatically adapt to each client's 
            unique needs and circumstances. Steps can be shown or hidden based on three key criteria:
          </p>
          
          <div className="grid gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Package Type Conditions</h4>
                <p className="text-sm text-muted-foreground">
                  Display specific steps only for certain package types. For example, show advanced nutrition 
                  planning only for premium clients, while basic clients see simplified meal guidance.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Previous Answer Triggers</h4>
                <p className="text-sm text-muted-foreground">
                  Customize the flow based on client responses. If a client indicates they're a beginner, 
                  show foundational steps. For experienced clients, skip basics and move to advanced content.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Step Dependencies</h4>
                <p className="text-sm text-muted-foreground">
                  Create logical sequences where certain steps only appear after prerequisites are completed. 
                  This ensures clients progress through your methodology in the optimal order.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Performance Analytics
        </h2>
        
        <div className="space-y-4">
          <p>
            Make data-driven decisions with comprehensive analytics that track every aspect of your template performance:
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Usage Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">Track</div>
                <ul className="text-sm space-y-1">
                  <li>• Template assignments</li>
                  <li>• Client engagement</li>
                  <li>• Step interactions</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Completion Rates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold text-green-600">Analyze</div>
                <ul className="text-sm space-y-1">
                  <li>• Step completion percentages</li>
                  <li>• Drop-off points</li>
                  <li>• Success patterns</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold text-purple-600">Optimize</div>
                <ul className="text-sm space-y-1">
                  <li>• Performance over time</li>
                  <li>• Seasonal patterns</li>
                  <li>• Improvement opportunities</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Bulk Operations */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <PlayCircle className="h-6 w-6" />
          Bulk Operations for Scale
        </h2>
        
        <div className="space-y-4">
          <p>
            Handle multiple clients efficiently with powerful bulk operation tools that maintain quality while saving time:
          </p>
          
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Available Operations</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Assign</Badge>
                    Bulk template assignments to multiple clients
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Update</Badge>
                    Mass updates to step details and instructions
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Complete</Badge>
                    Mark multiple steps as completed across clients
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Progress Tracking</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Real-time operation status</li>
                  <li>• Success/failure counts</li>
                  <li>• Detailed error logging</li>
                  <li>• Completion notifications</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Version Control */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <GitBranch className="h-6 w-6" />
          Version Control & Change Management
        </h2>
        
        <div className="space-y-4">
          <p>
            Never lose important changes with comprehensive version control that tracks every modification to your templates:
          </p>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Version Snapshots</CardTitle>
                <CardDescription>
                  Every significant change creates an immutable version snapshot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Each time you make important changes to a template, create a new version with a detailed changelog. 
                  This creates a complete snapshot of your template that can be restored at any time.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Easy Rollback</CardTitle>
                <CardDescription>
                  Revert to any previous version with a single click
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Made a change that didn't work out? No problem. Browse your version history and rollback to any 
                  previous state instantly. All your conditional logic, analytics, and settings are preserved.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Getting Started</h2>
        
        <div className="space-y-4">
          <p>
            Ready to upgrade your onboarding process? Here's how to start using advanced template features:
          </p>
          
          <ol className="space-y-4">
            <li className="flex gap-4">
              <Badge variant="outline" className="mt-1">1</Badge>
              <div>
                <h4 className="font-semibold">Access the Template Builder</h4>
                <p className="text-sm text-muted-foreground">
                  Navigate to your trainer dashboard and select "Onboarding Templates" to access the advanced builder.
                </p>
              </div>
            </li>
            
            <li className="flex gap-4">
              <Badge variant="outline" className="mt-1">2</Badge>
              <div>
                <h4 className="font-semibold">Create or Edit a Template</h4>
                <p className="text-sm text-muted-foreground">
                  Start with a new template or enhance an existing one with conditional logic and advanced features.
                </p>
              </div>
            </li>
            
            <li className="flex gap-4">
              <Badge variant="outline" className="mt-1">3</Badge>
              <div>
                <h4 className="font-semibold">Add Conditional Rules</h4>
                <p className="text-sm text-muted-foreground">
                  Use the Conditional Logic Builder to create dynamic flows that adapt to your clients' needs.
                </p>
              </div>
            </li>
            
            <li className="flex gap-4">
              <Badge variant="outline" className="mt-1">4</Badge>
              <div>
                <h4 className="font-semibold">Monitor Performance</h4>
                <p className="text-sm text-muted-foreground">
                  Use the Analytics Dashboard to track usage, completion rates, and optimize your templates over time.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Best Practices */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Best Practices</h2>
        
        <div className="grid gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Start Simple</h4>
              <p className="text-sm text-muted-foreground">
                Begin with basic conditional logic and gradually add complexity as you understand your clients' patterns.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Monitor Analytics</h4>
              <p className="text-sm text-muted-foreground">
                Regularly review your template analytics to identify bottlenecks and optimization opportunities.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Version Control</h4>
              <p className="text-sm text-muted-foreground">
                Create versions before major changes and use descriptive changelogs to track your template evolution.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Test Thoroughly</h4>
              <p className="text-sm text-muted-foreground">
                Use bulk operations on small groups first to ensure everything works as expected before scaling up.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Support */}
      <section className="bg-muted/50 rounded-lg p-6 text-center space-y-4">
        <h3 className="text-xl font-semibold">Need Help?</h3>
        <p className="text-muted-foreground">
          Our advanced template features are designed to be intuitive, but we're here to help if you need assistance.
        </p>
        <div className="flex justify-center gap-4">
          <Badge variant="outline">Knowledge Base</Badge>
          <Badge variant="outline">Video Tutorials</Badge>
          <Badge variant="outline">Support Chat</Badge>
        </div>
      </section>
    </article>
  );
}