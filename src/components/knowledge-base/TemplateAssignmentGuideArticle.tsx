import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users,
  ArrowRight,
  CheckCircle,
  Settings,
  Eye,
  Calendar,
  Package,
  User,
  FileText,
  Clock
} from 'lucide-react';

export function TemplateAssignmentGuideArticle() {
  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header className="text-center space-y-4">
        <Badge variant="default" className="mb-2">
          System Guide
        </Badge>
        <h1 className="text-4xl font-bold">Template Assignment & Client Onboarding</h1>
        <p className="text-xl text-muted-foreground">
          Complete guide to how templates are assigned to clients and how both trainers and clients view onboarding progress
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>Updated: {new Date().toLocaleDateString()}</span>
          <Separator orientation="vertical" className="h-4" />
          <span>Reading time: 8 min</span>
        </div>
      </header>

      {/* How Assignment Works */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <ArrowRight className="h-6 w-6" />
          How Template Assignment Works
        </h2>
        
        <div className="space-y-4">
          <p>
            Template assignment is an automatic process that happens when clients become active with a trainer. 
            The system creates personalized onboarding journeys based on the selected package and trainer's configuration.
          </p>
          
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3">Assignment Trigger Process</h4>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <Badge variant="outline" className="mt-1">1</Badge>
                  <div>
                    <h5 className="font-medium">Client Selects Coach & Package</h5>
                    <p className="text-sm text-muted-foreground">
                      Client chooses a trainer and a specific training package through the coach selection process.
                    </p>
                  </div>
                </li>
                
                <li className="flex gap-3">
                  <Badge variant="outline" className="mt-1">2</Badge>
                  <div>
                    <h5 className="font-medium">Engagement Stage Changes to "Active Client"</h5>
                    <p className="text-sm text-muted-foreground">
                      When the coach selection is completed, the client's engagement stage automatically updates.
                    </p>
                  </div>
                </li>
                
                <li className="flex gap-3">
                  <Badge variant="outline" className="mt-1">3</Badge>
                  <div>
                    <h5 className="font-medium">System Creates Onboarding Steps</h5>
                    <p className="text-sm text-muted-foreground">
                      The system automatically creates individual onboarding steps based on the package's "Ways of Working" configuration.
                    </p>
                  </div>
                </li>
                
                <li className="flex gap-3">
                  <Badge variant="outline" className="mt-1">4</Badge>
                  <div>
                    <h5 className="font-medium">Templates Applied & Customized</h5>
                    <p className="text-sm text-muted-foreground">
                      Any matching templates are applied, and default timing from activities library is automatically set.
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Package-Based Assignment */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Package className="h-6 w-6" />
          Package-Based Assignment Logic
        </h2>
        
        <div className="space-y-4">
          <p>
            Templates are assigned based on the package selected and the trainer's "Ways of Working" configuration for that specific package.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ways of Working Connection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  Each package has an "onboarding_items" array defined in the trainer's Ways of Working setup.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Package-specific onboarding steps</li>
                  <li>• Automatic template matching by name</li>
                  <li>• Activity library integration</li>
                  <li>• Default timing and SLA application</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template Matching</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  The system matches onboarding items to existing templates and activities by name.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Exact name matching from templates</li>
                  <li>• Activity defaults applied when available</li>
                  <li>• Template overrides package settings</li>
                  <li>• Custom timing and requirements preserved</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Assignment Priority Order</h4>
              <ol className="text-sm space-y-1">
                <li><strong>1. Published Templates:</strong> Active templates matching onboarding item names</li>
                <li><strong>2. Activity Defaults:</strong> Default timing and SLA from activities library</li>
                <li><strong>3. Package Configuration:</strong> Basic onboarding items from Ways of Working</li>
                <li><strong>4. System Defaults:</strong> Standard completion methods and basic requirements</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trainer View */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Trainer View: Managing Client Onboarding
        </h2>
        
        <div className="space-y-4">
          <p>
            Trainers can view and manage all assigned templates and client progress through multiple dashboard sections.
          </p>
          
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Client Onboarding Tracker
                </CardTitle>
                <CardDescription>
                  Primary interface for monitoring all active clients' onboarding progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <h5 className="font-medium">Features Available:</h5>
                <div className="grid md:grid-cols-2 gap-3">
                  <ul className="text-sm space-y-1">
                    <li>• View all active clients and their progress</li>
                    <li>• See individual step completion status</li>
                    <li>• Mark steps complete on behalf of clients</li>
                    <li>• Add trainer notes to any step</li>
                  </ul>
                  <ul className="text-sm space-y-1">
                    <li>• Edit step details and instructions</li>
                    <li>• Monitor completion percentages</li>
                    <li>• Track overdue steps and SLA breaches</li>
                    <li>• Access step-by-step progress details</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Active Clients Section
                </CardTitle>
                <CardDescription>
                  High-level overview with client management tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <h5 className="font-medium">Available Actions:</h5>
                <ul className="text-sm space-y-1">
                  <li>• View client profiles and goals</li>
                  <li>• Send direct messages to clients</li>
                  <li>• Add discovery call notes</li>
                  <li>• Track client start dates and milestones</li>
                  <li>• Monitor overall client engagement</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">How to Access Trainer Views</h4>
              <ol className="text-sm space-y-2">
                <li><strong>Dashboard Overview:</strong> Navigate to Trainer Dashboard → Active Clients section</li>
                <li><strong>Detailed Tracking:</strong> Go to Template Management → Client Onboarding Tracker</li>
                <li><strong>Individual Management:</strong> Click on any client to see their specific onboarding journey</li>
                <li><strong>Step Management:</strong> Click individual steps to edit, complete, or add notes</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Client View */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <User className="h-6 w-6" />
          Client View: Onboarding Journey Experience
        </h2>
        
        <div className="space-y-4">
          <p>
            Clients see their assigned templates as a personalized onboarding journey with clear progress tracking and interactive steps.
          </p>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Onboarding Journey Section
              </CardTitle>
              <CardDescription>
                Located in the client dashboard, showing complete onboarding progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Progress Overview</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Visual progress bar with percentage</li>
                    <li>• Completed vs. total steps counter</li>
                    <li>• Trainer name and relationship context</li>
                    <li>• Overall journey status</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Individual Steps</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Step names and descriptions</li>
                    <li>• Instructions and guidance</li>
                    <li>• File upload requirements</li>
                    <li>• Completion status indicators</li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <h5 className="font-medium mb-2">Interactive Features</h5>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="text-center p-3 border rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                    <h6 className="font-medium text-sm">Mark Complete</h6>
                    <p className="text-xs text-muted-foreground">Self-complete eligible steps</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <FileText className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                    <h6 className="font-medium text-sm">File Upload</h6>
                    <p className="text-xs text-muted-foreground">Upload required documents</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Users className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                    <h6 className="font-medium text-sm">Add Notes</h6>
                    <p className="text-xs text-muted-foreground">Communicate with trainer</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Client Experience Features</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Visual Indicators</h5>
                  <ul className="text-sm space-y-1">
                    <li>• <CheckCircle className="inline h-3 w-3 text-green-500 mr-1" />Completed steps (green checkmark)</li>
                    <li>• <Clock className="inline h-3 w-3 text-muted-foreground mr-1" />Pending steps (clock icon)</li>
                    <li>• <Badge variant="secondary" className="inline-flex h-4 text-xs">Required</Badge> vs Optional badges</li>
                    <li>• Expandable sections for detailed instructions</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Interaction Options</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Skip optional steps when appropriate</li>
                    <li>• Add personal notes to any step</li>
                    <li>• Upload files directly to specific steps</li>
                    <li>• View trainer notes and feedback</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Step Completion Methods */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <CheckCircle className="h-6 w-6" />
          Step Completion Methods
        </h2>
        
        <div className="space-y-4">
          <p>
            Different steps have different completion methods depending on who needs to perform or verify the action.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-blue-600">Client Completion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">Steps that clients can complete themselves.</p>
                <ul className="text-sm space-y-1">
                  <li>• Uploading documents or photos</li>
                  <li>• Filling out questionnaires</li>
                  <li>• Confirming understanding</li>
                  <li>• Self-reported activities</li>
                </ul>
                <Badge variant="outline" className="mt-2">Client Action Required</Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">Trainer Completion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">Steps that require trainer verification or action.</p>
                <ul className="text-sm space-y-1">
                  <li>• Assessment reviews</li>
                  <li>• Program customization</li>
                  <li>• Goal setting sessions</li>
                  <li>• Progress evaluations</li>
                </ul>
                <Badge variant="outline" className="mt-2">Trainer Action Required</Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-purple-600">Automatic Completion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">Steps completed automatically by the system.</p>
                <ul className="text-sm space-y-1">
                  <li>• Welcome message delivery</li>
                  <li>• Calendar integration setup</li>
                  <li>• System notifications</li>
                  <li>• Data synchronization</li>
                </ul>
                <Badge variant="outline" className="mt-2">System Automated</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customization Options */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Customization & Management Options
        </h2>
        
        <div className="space-y-4">
          <p>
            Both trainers and clients have various options to customize and manage the onboarding experience.
          </p>
          
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">For Trainers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Before Assignment</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Configure package Ways of Working</li>
                      <li>• Create and publish templates</li>
                      <li>• Build activity library with defaults</li>
                      <li>• Set up conditional logic rules</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">After Assignment</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Edit individual step details</li>
                      <li>• Mark steps complete for clients</li>
                      <li>• Add trainer notes and feedback</li>
                      <li>• Adjust timing and requirements</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">For Clients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-2">Progress Management</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Complete steps at their own pace</li>
                      <li>• Skip optional steps when appropriate</li>
                      <li>• Upload required files and documents</li>
                      <li>• Add personal notes and questions</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Communication</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Add notes to specific steps</li>
                      <li>• Ask questions through step comments</li>
                      <li>• View trainer feedback and guidance</li>
                      <li>• Track overall progress visually</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Common Issues & Solutions</h2>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950">
                  <h5 className="font-medium text-sm">No onboarding steps created for client</h5>
                  <p className="text-xs text-muted-foreground mt-1">
                    <strong>Cause:</strong> Package has no onboarding items configured in Ways of Working.
                    <br />
                    <strong>Solution:</strong> Configure package-specific onboarding items in trainer's Ways of Working setup.
                  </p>
                </div>
                
                <div className="p-3 border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                  <h5 className="font-medium text-sm">Templates not applying to onboarding steps</h5>
                  <p className="text-xs text-muted-foreground mt-1">
                    <strong>Cause:</strong> Template names don't match onboarding item names exactly.
                    <br />
                    <strong>Solution:</strong> Ensure template step names exactly match the text in package onboarding items.
                  </p>
                </div>
                
                <div className="p-3 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950">
                  <h5 className="font-medium text-sm">Client can't see their onboarding journey</h5>
                  <p className="text-xs text-muted-foreground mt-1">
                    <strong>Cause:</strong> Client engagement stage hasn't updated to 'active_client'.
                    <br />
                    <strong>Solution:</strong> Check coach selection status and ensure it's marked as completed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Best Practices */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Best Practices</h2>
        
        <div className="grid gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Template Preparation</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Set up your templates and activities before clients start the onboarding process.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Create comprehensive activity library with appropriate defaults</li>
                <li>• Build templates that match your package onboarding item names</li>
                <li>• Publish templates to make them available for assignment</li>
                <li>• Test the flow with a sample client before going live</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Client Experience</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Design onboarding steps that provide clear value and guidance to clients.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Use clear, action-oriented step names</li>
                <li>• Provide detailed instructions for each step</li>
                <li>• Set realistic due dates and SLA expectations</li>
                <li>• Include helpful guidance and context in step descriptions</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-2">Ongoing Management</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Actively monitor and support clients through their onboarding journey.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Regularly check the Client Onboarding Tracker</li>
                <li>• Respond promptly to client notes and questions</li>
                <li>• Mark trainer-completion steps promptly</li>
                <li>• Use analytics to optimize the onboarding process</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Conclusion */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Summary</h2>
        <div className="bg-muted/50 rounded-lg p-6">
          <p className="text-lg mb-4">
            Template assignment is an automated process that creates personalized onboarding journeys for each client 
            based on their selected package and the trainer's configuration.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Key Points for Trainers:</h4>
              <ul className="space-y-1">
                <li>• Templates are automatically assigned via package selection</li>
                <li>• View and manage all client progress in the dashboard</li>
                <li>• Can customize steps after assignment</li>
                <li>• Multiple completion methods available</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Points for Clients:</h4>
              <ul className="space-y-1">
                <li>• See complete onboarding journey with progress tracking</li>
                <li>• Interactive steps with clear instructions</li>
                <li>• Can complete eligible steps independently</li>
                <li>• Communicate with trainer through step notes</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}