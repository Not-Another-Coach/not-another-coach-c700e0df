import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Code, Server, Mail, Users, Trash, Calendar, FileText } from 'lucide-react';

interface APIDocumentationProps {
  searchTerm: string;
  onElementClick: (elementText: string) => void;
}

const apis = [
  {
    name: 'bulk-create-users',
    category: 'User Management',
    icon: <Users className="h-5 w-5" />,
    method: 'POST',
    purpose: 'Bulk creation of user accounts with complete profile data for clients and trainers',
    description: 'Creates multiple users in batch with authentication accounts and full profile data. Supports both client and trainer user types with type-specific fields.',
    usedIn: [
      'Admin Dashboard - Bulk User Upload tab',
      'BulkUserUpload component',
      'UserManagement component'
    ],
    authentication: 'Service Role Required',
    parameters: {
      users: 'Array<BulkUserData> - Array of user objects with email, password, user_type, and profile data'
    },
    response: {
      success: 'boolean',
      summary: 'Object with total, successful, and failed counts',
      results: 'Array of creation results per user'
    },
    features: [
      'Creates auth users with admin privileges',
      'Sets up complete profile data based on user type',
      'Handles client-specific survey data',
      'Handles trainer-specific profile data',
      'Bulk processing with error handling',
      'Email confirmation bypass for bulk creation'
    ]
  },
  {
    name: 'cleanup-test-users',
    category: 'User Management',
    icon: <Trash className="h-5 w-5" />,
    method: 'POST',
    purpose: 'Cleanup and management of test user accounts in development environments',
    description: 'Provides administrative functions to delete test users by email addresses. Designed for development and testing environments.',
    usedIn: [
      'Admin Dashboard - Bulk Upload tab',
      'TestUserCleanup component',
      'Development environment management'
    ],
    authentication: 'Service Role Required',
    parameters: {
      action: '"delete" | "update" - Action to perform',
      emails: 'string[] - Array of email addresses to process'
    },
    response: {
      success: 'boolean',
      action: 'string - Action performed',
      summary: 'Object with total, deleted, and error counts',
      errors: 'string[] - Array of error messages'
    },
    features: [
      'Case-insensitive email matching',
      'Cascade deletion through auth system',
      'Bulk delete operations',
      'Error tracking and reporting',
      'Admin-only access control'
    ]
  },
  {
    name: 'send-discovery-call-email',
    category: 'Communication',
    icon: <Mail className="h-5 w-5" />,
    method: 'POST',
    purpose: 'Sends templated emails for discovery call workflow notifications',
    description: 'Handles all email communications related to discovery calls including confirmations, reminders, and trainer notifications using React Email templates.',
    usedIn: [
      'Discovery call booking system',
      'DiscoveryCallBookingModal component',
      'Automated reminder system',
      'Trainer notification workflow'
    ],
    authentication: 'Requires RESEND_API_KEY',
    parameters: {
      type: '"confirmation" | "reminder" | "trainer_notification"',
      discoveryCallId: 'string - UUID of the discovery call',
      timeUntil: 'string - Optional, for reminders (e.g., "in 24 hours")',
      notificationType: 'string - Optional, for trainer notifications'
    },
    response: {
      success: 'boolean',
      emailId: 'string - Resend email ID',
      type: 'string - Email type sent',
      recipient: 'string - Email address of recipient'
    },
    features: [
      'React Email template rendering',
      'Multiple email types support',
      'Dynamic content with call details',
      'Trainer prep notes inclusion',
      'Client and trainer email lookup',
      'Rich HTML email formatting'
    ]
  },
  {
    name: 'process-discovery-call-reminders',
    category: 'Automation',
    icon: <Calendar className="h-5 w-5" />,
    method: 'POST',
    purpose: 'Automated processing of discovery call reminders on a scheduled basis',
    description: 'Cron-triggered function that finds upcoming discovery calls and sends appropriate reminder emails at 24-hour and 1-hour intervals.',
    usedIn: [
      'Automated background processing',
      'Scheduled via pg_cron',
      'Discovery call reminder system',
      'Client engagement workflow'
    ],
    authentication: 'Service Role (Cron Job)',
    parameters: {
      'No parameters': 'Triggered automatically by cron scheduler'
    },
    response: {
      success: 'boolean',
      processed: 'number - Total calls processed',
      reminders24h: 'number - 24-hour reminders sent',
      reminders1h: 'number - 1-hour reminders sent',
      timestamp: 'string - Processing timestamp'
    },
    features: [
      'Automated discovery call detection',
      'Dual reminder timing (24h and 1h)',
      'Prevents duplicate reminder sending',
      'Integrates with email sending system',
      'Error handling and logging',
      'Batch processing efficiency'
    ]
  }
];

const categories = [
  {
    name: 'User Management',
    icon: <Users className="h-4 w-4" />,
    color: 'bg-blue-500/10 text-blue-700 border-blue-200',
    description: 'APIs for creating, managing, and cleaning up user accounts'
  },
  {
    name: 'Communication',
    icon: <Mail className="h-4 w-4" />,
    color: 'bg-green-500/10 text-green-700 border-green-200',
    description: 'Email and notification systems'
  },
  {
    name: 'Automation',
    icon: <Server className="h-4 w-4" />,
    color: 'bg-purple-500/10 text-purple-700 border-purple-200',
    description: 'Scheduled and automated background processes'
  }
];

export const APIDocumentation: React.FC<APIDocumentationProps> = ({ searchTerm, onElementClick }) => {
  const filteredAPIs = apis.filter(api => 
    api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 border-green-200';
      case 'POST': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PUT': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryInfo = (categoryName: string) => {
    return categories.find(cat => cat.name === categoryName) || categories[0];
  };

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Edge Functions (APIs)</h2>
        <p className="text-muted-foreground mb-6">
          Supabase Edge Functions that provide backend functionality for the application. 
          These serverless functions handle authentication, data processing, email communications, and automated tasks.
        </p>
        
        {/* Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {categories.map((category) => (
            <Card key={category.name} className={`border ${category.color}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {category.icon}
                  <h3 className="font-semibold">{category.name}</h3>
                </div>
                <p className="text-sm opacity-80">{category.description}</p>
                <Badge variant="outline" className="mt-2">
                  {apis.filter(api => api.category === category.name).length} APIs
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* API List */}
      <div className="space-y-6">
        {filteredAPIs.map((api) => {
          const categoryInfo = getCategoryInfo(api.category);
          
          return (
            <Card key={api.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${categoryInfo.color}`}>
                      {api.icon}
                    </div>
                    <div>
                      <CardTitle 
                        className="text-xl font-mono cursor-pointer hover:text-primary transition-colors"
                        onClick={() => onElementClick(api.name)}
                      >
                        {api.name}
                      </CardTitle>
                      <CardDescription className="mt-1">{api.purpose}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getMethodColor(api.method)}>
                      {api.method}
                    </Badge>
                    <Badge variant="outline" className={categoryInfo.color}>
                      {api.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Description */}
                <div>
                  <h4 className="font-medium text-sm text-foreground mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{api.description}</p>
                </div>

                {/* Authentication */}
                <div>
                  <h4 className="font-medium text-sm text-foreground mb-2">Authentication</h4>
                  <Badge variant="secondary" className="text-xs">
                    {api.authentication}
                  </Badge>
                </div>

                {/* Parameters */}
                <div>
                  <h4 className="font-medium text-sm text-foreground mb-2">Parameters</h4>
                  <div className="bg-muted rounded-lg p-3">
                    {Object.entries(api.parameters).map(([key, value]) => (
                      <div key={key} className="text-sm font-mono">
                        <span className="text-primary font-semibold">{key}:</span>{' '}
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response */}
                <div>
                  <h4 className="font-medium text-sm text-foreground mb-2">Response Format</h4>
                  <div className="bg-muted rounded-lg p-3">
                    {Object.entries(api.response).map(([key, value]) => (
                      <div key={key} className="text-sm font-mono">
                        <span className="text-primary font-semibold">{key}:</span>{' '}
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-medium text-sm text-foreground mb-2">Key Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {api.features.map((feature) => (
                      <Badge 
                        key={feature} 
                        variant="outline" 
                        className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => onElementClick(feature)}
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Used In */}
                <div>
                  <h4 className="font-medium text-sm text-foreground mb-2">Used In</h4>
                  <div className="space-y-1">
                    {api.usedIn.map((usage, index) => (
                      <div key={index} className="text-sm text-muted-foreground flex items-center gap-1">
                        <Code className="h-3 w-3" />
                        {usage}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(`https://supabase.com/dashboard/project/ogpiovfxjxcclptfybrk/functions/${api.name}/logs`, '_blank')}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    View Logs
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`https://supabase.com/dashboard/project/ogpiovfxjxcclptfybrk/functions`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Supabase Functions
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAPIs.length === 0 && (
        <div className="text-center py-12">
          <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No APIs found matching your search.</p>
        </div>
      )}

      {/* Footer Information */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Server className="h-4 w-4" />
            Edge Functions Information
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• All edge functions are deployed automatically when code changes are made</p>
            <p>• Functions run on Supabase's global edge network for low latency</p>
            <p>• CORS is enabled for all functions to allow web application access</p>
            <p>• Service role functions require elevated permissions for admin operations</p>
            <p>• Email functions require RESEND_API_KEY to be configured in secrets</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};