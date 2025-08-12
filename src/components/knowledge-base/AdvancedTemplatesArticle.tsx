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
  History,
  Send,
  Archive,
  FileText,
  Download
} from 'lucide-react';

export function AdvancedTemplatesArticle() {
  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header className="text-center space-y-4">
        <Badge variant="default" className="mb-2">
          Complete Guide
        </Badge>
        <h1 className="text-4xl font-bold">Advanced Template Management System</h1>
        <p className="text-xl text-muted-foreground">
          Complete guide to template publishing, activity management, bulk operations, and workflow optimization
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>Updated: {new Date().toLocaleDateString()}</span>
          <Separator orientation="vertical" className="h-4" />
          <span>Reading time: 12 min</span>
        </div>
      </header>

      {/* Introduction */}
      <section className="space-y-4">
        <p className="text-lg">
          Our comprehensive template management system provides everything you need to create, publish, and optimize 
          sophisticated onboarding workflows. This guide covers the complete lifecycle from activity creation to 
          template publishing and bulk management operations.
        </p>
      </section>

      {/* Template Publishing Workflow */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <CheckCircle className="h-6 w-6" />
          Template Publishing Workflow
        </h2>
        
        <div className="space-y-4">
          <p>
            The template publishing system provides complete lifecycle management for your onboarding templates, 
            ensuring quality control and preventing disruption to active client workflows.
          </p>
          
          <div className="grid gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Template Status System</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary"><FileText className="h-3 w-3 mr-1" />Draft</Badge>
                    <span className="text-sm">Templates under development. Can be freely edited and modified.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Published</Badge>
                    <span className="text-sm">Active templates available for client onboarding. Locked to prevent structural changes.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-orange-500 text-orange-600"><Archive className="h-3 w-3 mr-1" />Archived</Badge>
                    <span className="text-sm">Removed from active use but preserved for reference. Can be reactivated.</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Publishing Actions</h4>
                <div className="grid md:grid-cols-3 gap-4 mt-3">
                  <div className="text-center p-3 border rounded-lg">
                    <Send className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <h5 className="font-medium text-sm">Publish</h5>
                    <p className="text-xs text-muted-foreground">Make active and lock structure</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Archive className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                    <h5 className="font-medium text-sm">Archive</h5>
                    <p className="text-xs text-muted-foreground">Remove from active use</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <PlayCircle className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <h5 className="font-medium text-sm">Reactivate</h5>
                    <p className="text-xs text-muted-foreground">Restore archived templates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">How to Publish Templates</h4>
                <ol className="space-y-2 text-sm">
                  <li><strong>Individual Publishing:</strong> Click the green "Send" icon next to any draft template</li>
                  <li><strong>Bulk Publishing:</strong> Use "Bulk Actions" button to publish multiple templates at once</li>
                  <li><strong>Archive Management:</strong> Click orange "Archive" icon on published templates to retire them</li>
                  <li><strong>Reactivation:</strong> Use the blue "Reactivate" icon to restore archived templates</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Activities and Templates Relationship */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Activities vs Templates: Understanding the Relationship
        </h2>
        
        <div className="space-y-4">
          <p>
            Understanding the distinction between Activities and Templates is crucial for effective onboarding management. 
            They work together to create a powerful, reusable system for client onboarding.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-blue-600">Activities</CardTitle>
                <CardDescription>Reusable Building Blocks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  Activities are standardized tasks that can be reused across multiple templates and client packages. 
                  Think of them as your library of onboarding components.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Reusable:</strong> Create once, use everywhere</li>
                  <li>• <strong>Standardized:</strong> Include default timing and SLA settings</li>
                  <li>• <strong>Rich Content:</strong> Support rich text guidance and attachments</li>
                  <li>• <strong>Organized:</strong> Categorized for easy discovery and management</li>
                  <li>• <strong>Flexible:</strong> Both system and custom activities available</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">Templates</CardTitle>
                <CardDescription>Structured Workflows</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  Templates are comprehensive onboarding workflows that organize activities into logical sequences 
                  tailored for specific client packages or onboarding scenarios.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Comprehensive:</strong> Combine multiple activities into complete workflows</li>
                  <li>• <strong>Package-Linked:</strong> Can be linked to specific client packages</li>
                  <li>• <strong>Intelligent:</strong> Support conditional logic and dependencies</li>
                  <li>• <strong>Lifecycle-Managed:</strong> Have publishing and version control</li>
                  <li>• <strong>Client-Specific:</strong> Generate personalized onboarding plans</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">How They Work Together</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Activities serve as the foundation for building comprehensive templates. Here's the complete workflow:
              </p>
              <ol className="text-sm space-y-2">
                <li><strong>1. Build Activity Library:</strong> Create your collection of reusable onboarding tasks</li>
                <li><strong>2. Design Templates:</strong> Create structured workflows for different client scenarios</li>
                <li><strong>3. Import Activities:</strong> Use the Activity Importer to add activities to template sections</li>
                <li><strong>4. Customize per Template:</strong> Adjust timing, descriptions, and requirements</li>
                <li><strong>5. Publish Templates:</strong> Make complete workflows available for client onboarding</li>
                <li><strong>6. Manage Lifecycle:</strong> Archive outdated templates and create new versions</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Activity Import System */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Download className="h-6 w-6" />
          Using the Activity Import System
        </h2>
        
        <div className="space-y-4">
          <p>
            The Activity Importer streamlines template creation by leveraging your existing activity library. 
            No more recreating the same tasks – just import, customize, and deploy.
          </p>
          
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <h4 className="font-semibold">Step-by-Step Import Process</h4>
            
            <ol className="space-y-4">
              <li className="flex gap-4">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div>
                  <h5 className="font-medium">Access Template Sections</h5>
                  <p className="text-sm text-muted-foreground">
                    In the Template Builder, click the "Settings" (gear) icon on any template to edit its sections.
                  </p>
                </div>
              </li>
              
              <li className="flex gap-4">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div>
                  <h5 className="font-medium">Choose Your Section</h5>
                  <p className="text-sm text-muted-foreground">
                    Navigate to the appropriate tab (Getting Started, Ongoing Support, Commitments, etc.) 
                    where you want to add activities.
                  </p>
                </div>
              </li>
              
              <li className="flex gap-4">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div>
                  <h5 className="font-medium">Open Activity Importer</h5>
                  <p className="text-sm text-muted-foreground">
                    Click the "Import Activities" button to open the activity selector with advanced 
                    filtering and search capabilities.
                  </p>
                </div>
              </li>
              
              <li className="flex gap-4">
                <Badge variant="outline" className="mt-1">4</Badge>
                <div>
                  <h5 className="font-medium">Select and Import</h5>
                  <p className="text-sm text-muted-foreground">
                    Use filters, search by name/description, select multiple activities, and import them 
                    with all default settings preserved.
                  </p>
                </div>
              </li>
            </ol>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Advanced Import Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Smart Filtering</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Filter by category (Onboarding, First Week, etc.)</li>
                    <li>• Search by activity name or description</li>
                    <li>• Filter by system vs. custom activities</li>
                    <li>• Quick "Select All" and "Clear All" options</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Intelligent Import</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Default due dates automatically applied</li>
                    <li>• SLA settings preserved from activities</li>
                    <li>• Rich text guidance imported intact</li>
                    <li>• Reference tracking for future updates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bulk Template Management */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Bulk Template Management
        </h2>
        
        <div className="space-y-4">
          <p>
            Manage multiple templates efficiently with powerful bulk operations. Perfect for major updates, 
            seasonal changes, or organizational restructuring.
          </p>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Bulk Actions</CardTitle>
              <CardDescription>
                Access via the "Bulk Actions" button in the Template Builder header
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Send className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h5 className="font-medium">Bulk Publish</h5>
                  <p className="text-xs text-muted-foreground">
                    Publish multiple draft templates simultaneously with confirmation
                  </p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Archive className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <h5 className="font-medium">Bulk Archive</h5>
                  <p className="text-xs text-muted-foreground">
                    Archive multiple published templates safely
                  </p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <PlayCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h5 className="font-medium">Bulk Reactivate</h5>
                  <p className="text-xs text-muted-foreground">
                    Restore multiple archived templates to active status
                  </p>
                </div>
              </div>
              
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-4">
                  <h5 className="font-medium mb-2">Safety Features</h5>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>Smart Filtering:</strong> Only eligible templates shown for each action</li>
                    <li>• <strong>Clear Warnings:</strong> Detailed explanations before operations</li>
                    <li>• <strong>Individual Preview:</strong> Review each template before confirming</li>
                    <li>• <strong>Progress Tracking:</strong> Real-time status during bulk operations</li>
                    <li>• <strong>Error Handling:</strong> Detailed feedback if any operations fail</li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">When to Use Bulk Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2 text-green-600">Good Use Cases</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Publishing a set of related templates</li>
                    <li>• Seasonal template updates</li>
                    <li>• Retiring outdated template versions</li>
                    <li>• Organizational restructuring</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2 text-orange-600">Use with Caution</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Templates currently in use by clients</li>
                    <li>• Untested or experimental templates</li>
                    <li>• Templates with external dependencies</li>
                    <li>• Operations during peak usage times</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Visual Status System */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Filter className="h-6 w-6" />
          Understanding the Visual Status System
        </h2>
        
        <div className="space-y-4">
          <p>
            The template system uses color-coded badges and icons to provide instant visual feedback 
            about template status and available actions.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <Badge variant="secondary"><FileText className="h-3 w-3 mr-1" />Draft</Badge>
                    <span className="text-sm">Editable, unpublished</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded bg-green-50">
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />Published
                    </Badge>
                    <span className="text-sm">Active, locked</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded bg-orange-50">
                    <Badge variant="outline" className="border-orange-500 text-orange-600">
                      <Archive className="h-3 w-3 mr-1" />Archived
                    </Badge>
                    <span className="text-sm">Retired, restorable</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Action Buttons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <Send className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Publish template</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <Archive className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Archive template</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <PlayCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Reactivate archived</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <Settings className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Edit sections</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Getting Started Guide */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Complete Getting Started Guide</h2>
        
        <div className="space-y-4">
          <p>
            Follow this comprehensive guide to implement the complete template management system in your practice:
          </p>
          
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge variant="outline">Phase 1</Badge>
                  Build Your Activity Library
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm">
                  <li><strong>1.</strong> Navigate to Template Management → Activities tab</li>
                  <li><strong>2.</strong> Read the explanatory text about reusable building blocks</li>
                  <li><strong>3.</strong> Create activities for common onboarding tasks</li>
                  <li><strong>4.</strong> Set appropriate default due dates and SLA requirements</li>
                  <li><strong>5.</strong> Add detailed descriptions and rich text guidance</li>
                  <li><strong>6.</strong> Organize activities by category for easy discovery</li>
                  <li><strong>7.</strong> Review both system and custom activities for completeness</li>
                </ol>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge variant="outline">Phase 2</Badge>
                  Create Template Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm">
                  <li><strong>1.</strong> Go to Template Management → Templates tab</li>
                  <li><strong>2.</strong> Create new templates or edit existing draft templates</li>
                  <li><strong>3.</strong> Click "Edit Sections" (gear icon) to configure structure</li>
                  <li><strong>4.</strong> Use "Import Activities" to add activities to each section</li>
                  <li><strong>5.</strong> Customize timing, descriptions, and requirements per template</li>
                  <li><strong>6.</strong> Link templates to specific packages if needed</li>
                  <li><strong>7.</strong> Test template structure before publishing</li>
                </ol>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Badge variant="outline">Phase 3</Badge>
                  Publish and Manage Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm">
                  <li><strong>1.</strong> Review templates carefully before publishing</li>
                  <li><strong>2.</strong> Use individual publish buttons (green send icon) or bulk actions</li>
                  <li><strong>3.</strong> Monitor template status with visual status indicators</li>
                  <li><strong>4.</strong> Use filtering to manage different template statuses</li>
                  <li><strong>5.</strong> Archive outdated templates instead of deleting them</li>
                  <li><strong>6.</strong> Use bulk actions for major organizational changes</li>
                  <li><strong>7.</strong> Regularly review and optimize template performance</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Best Practices & Tips</h2>
        
        <div className="grid gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Activity Library Strategy</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Build a comprehensive activity library before creating templates. Well-organized activities 
                make template creation faster and ensure consistency.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Use clear, descriptive activity names</li>
                <li>• Set realistic default timings based on experience</li>
                <li>• Include detailed guidance to reduce client questions</li>
                <li>• Review and update activities based on client feedback</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Publishing Strategy</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Only publish templates when they're fully tested and ready for client use. Published templates 
                are locked to prevent accidental changes.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Test templates with a small client group first</li>
                <li>• Ensure all activities are properly configured</li>
                <li>• Verify package links are correct</li>
                <li>• Have a rollback plan for new templates</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Lifecycle Management</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Use the archive feature instead of deleting templates. Archived templates preserve your work 
                and can be reactivated if needed.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Archive seasonal or outdated templates</li>
                <li>• Keep detailed notes about why templates were archived</li>
                <li>• Regularly review archived templates for reuse opportunities</li>
                <li>• Use bulk actions for major template updates</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Bulk Operations Safety</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Bulk operations are powerful but should be used thoughtfully. Always review selections 
                carefully before confirming changes.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Use bulk actions during low-activity periods</li>
                <li>• Double-check template selections before confirming</li>
                <li>• Monitor progress during bulk operations</li>
                <li>• Have a communication plan for affected clients</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Common Issues & Solutions</h2>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Publishing Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3">
                <div className="p-3 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950">
                  <h5 className="font-medium text-sm">Can't delete published template</h5>
                  <p className="text-xs text-muted-foreground">
                    <strong>Solution:</strong> Archive the template first, then it can be permanently deleted if needed.
                  </p>
                </div>
                <div className="p-3 border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                  <h5 className="font-medium text-sm">Template not appearing in client onboarding</h5>
                  <p className="text-xs text-muted-foreground">
                    <strong>Solution:</strong> Ensure template is published and linked to the correct package.
                  </p>
                </div>
                <div className="p-3 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950">
                  <h5 className="font-medium text-sm">Activity import not working</h5>
                  <p className="text-xs text-muted-foreground">
                    <strong>Solution:</strong> Check that activities exist in your library and try refreshing the page.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Conclusion */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Transform Your Onboarding Today</h2>
        <p className="text-lg">
          The complete template management system provides everything you need to create, publish, and optimize 
          sophisticated onboarding workflows. Start with building your activity library, create structured templates, 
          publish strategically, and use the powerful management tools to maintain an efficient onboarding process.
        </p>
        <div className="bg-muted/50 rounded-lg p-6">
          <h4 className="font-semibold mb-2">Ready to Get Started?</h4>
          <p className="text-sm text-muted-foreground">
            Head to your Template Management dashboard and begin with Phase 1: building your activity library. 
            Remember, activities are the building blocks – create them first, then use them to build powerful 
            template workflows that will transform your client onboarding experience.
          </p>
        </div>
      </section>
    </article>
  );
}