import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Lock, User, Users, Settings } from 'lucide-react';

interface PageDocumentationProps {
  searchTerm: string;
}

const pages = [
  {
    category: 'Core Pages',
    items: [
      {
        name: 'Home',
        route: '/',
        description: 'Landing page with hero section and main navigation',
        access: 'Public',
        features: ['Hero section', 'Role switching', 'Authentication links'],
        components: ['HeroSection', 'SimpleHeroSection', 'RoleSwitcher']
      },
      {
        name: 'Authentication',
        route: '/auth',
        description: 'Login and registration for clients and trainers',
        access: 'Public',
        features: ['Login/Register', 'Password reset', 'Role selection'],
        components: ['Auth form', 'Password validation']
      },
      {
        name: 'Not Found',
        route: '/404',
        description: 'Error page for invalid routes',
        access: 'Public',
        features: ['Error messaging', 'Navigation back to home'],
        components: ['NotFound']
      }
    ]
  },
  {
    category: 'Client Journey',
    items: [
      {
        name: 'Client Survey',
        route: '/survey',
        description: 'Multi-step form for client preferences and goals',
        access: 'Client only',
        features: ['Goals selection', 'Budget preferences', 'Scheduling preferences', 'Location preferences'],
        components: ['GoalsSection', 'BudgetSection', 'SchedulingSection', 'AvailabilitySection']
      },
      {
        name: 'Discovery',
        route: '/discovery',
        description: 'Browse and discover trainers based on preferences',
        access: 'Client only',
        features: ['Trainer cards', 'Filtering', 'Swiping interface', 'Like/Save actions'],
        components: ['TrainerCard', 'SwipeableCard', 'FilterSection', 'VisualSwipeSection']
      },
      {
        name: 'Client Dashboard',
        route: '/client/dashboard',
        description: 'Main hub for client activities and progress',
        access: 'Client only',
        features: ['Survey widget', 'Upcoming sessions', 'Messages', 'News alerts', 'Activity feed'],
        components: ['ClientSurveyWidget', 'UpcomingSessionsWidget', 'MessagesSection', 'LiveActivityFeed']
      },
      {
        name: 'Client Journey',
        route: '/client/journey',
        description: 'Step-by-step client onboarding process',
        access: 'Client only',
        features: ['Progress tracking', 'Journey breadcrumb', 'Step completion'],
        components: ['ClientJourneyBreadcrumb', 'ProgressBreadcrumb', 'StepCompletionIcon']
      }
    ]
  },
  {
    category: 'Trainer Management',
    items: [
      {
        name: 'Trainer Dashboard',
        route: '/trainer/dashboard',
        description: 'Main hub for trainer activities and client management',
        access: 'Trainer only',
        features: ['Analytics dashboard', 'Active clients', 'Prospects', 'Availability settings', 'Waitlist management'],
        components: ['CoachAnalyticsDashboard', 'ActiveClientsSection', 'ProspectsSection', 'AvailabilitySettings']
      },
      {
        name: 'Trainer Profile Setup',
        route: '/trainer/setup',
        description: 'Multi-step profile configuration for trainers',
        access: 'Trainer only',
        features: ['Basic info', 'Qualifications', 'Rates', 'Availability', 'Visibility settings'],
        components: ['BasicInfoSection', 'QualificationsSection', 'RatesSection', 'AvailabilityGrid']
      },
      {
        name: 'Trainer Profile',
        route: '/trainer/:id',
        description: 'Public trainer profile with tiered visibility',
        access: 'Based on engagement stage',
        features: ['Tiered content blocks', 'Pricing unlock', 'Discovery call booking', 'Coach selection'],
        components: ['TieredTrainerProfile', 'HeroBlock', 'MiniBioBlock', 'PricingLockMessage']
      }
    ]
  },
  {
    category: 'Functional Pages',
    items: [
      {
        name: 'My Trainers',
        route: '/my-trainers',
        description: 'Client\'s shortlisted trainers and engagement tracking',
        access: 'Client only',
        features: ['Shortlisted trainers', 'Discovery call management', 'Coach selection', 'Engagement tracking'],
        components: ['TrainerCard', 'DiscoveryCallBookingModal', 'ChooseCoachButton', 'ClientRescheduleModal']
      },
      {
        name: 'Saved Trainers',
        route: '/saved',
        description: 'Client\'s saved trainer profiles',
        access: 'Client only',
        features: ['Saved trainers list', 'Move to shortlist', 'Remove from saved'],
        components: ['TrainerCard', 'SavedTrainers management']
      },
      {
        name: 'Shortlist',
        route: '/shortlist',
        description: 'Client\'s shortlisted trainers for comparison',
        access: 'Client only',
        features: ['Trainer comparison', 'Side-by-side view', 'Discovery call booking'],
        components: ['ComparisonView', 'TrainerCard']
      },
      {
        name: 'Messaging',
        route: '/messaging',
        description: 'Real-time messaging between clients and trainers',
        access: 'Authenticated users',
        features: ['Conversation list', 'Real-time chat', 'Message restrictions'],
        components: ['MessagingPopup', 'Conversation management']
      },
      {
        name: 'Admin Dashboard',
        route: '/admin/dashboard',
        description: 'Administrative interface for user and system management',
        access: 'Admin only',
        features: ['User management', 'Bulk operations', 'Feedback questions', 'Test user cleanup'],
        components: ['UserManagement', 'BulkUserUpload', 'FeedbackQuestionBuilder', 'TestUserCleanup']
      }
    ]
  }
];

export const PagesDocumentation: React.FC<PageDocumentationProps> = ({ searchTerm }) => {
  const filteredPages = pages.map(category => ({
    ...category,
    items: category.items.filter(page => 
      page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(category => category.items.length > 0);

  const getAccessIcon = (access: string) => {
    if (access === 'Public') return null;
    if (access === 'Admin only') return <Settings className="h-3 w-3" />;
    if (access.includes('Client')) return <User className="h-3 w-3" />;
    if (access.includes('Trainer')) return <Users className="h-3 w-3" />;
    return <Lock className="h-3 w-3" />;
  };

  const getAccessColor = (access: string) => {
    if (access === 'Public') return 'secondary';
    if (access === 'Admin only') return 'destructive';
    if (access.includes('Client')) return 'default';
    if (access.includes('Trainer')) return 'outline';
    return 'secondary';
  };

  return (
    <div className="space-y-8">
      {filteredPages.map((category) => (
        <div key={category.category}>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {category.category}
          </h2>
          <div className="grid gap-4">
            {category.items.map((page) => (
              <Card key={page.route} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{page.name}</CardTitle>
                      <Badge variant={getAccessColor(page.access)} className="flex items-center gap-1">
                        {getAccessIcon(page.access)}
                        {page.access}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {page.route}
                    </Badge>
                  </div>
                  <CardDescription>{page.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-2">Key Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {page.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-2">Main Components</h4>
                      <div className="flex flex-wrap gap-2">
                        {page.components.map((component) => (
                          <Badge key={component} variant="outline" className="text-xs font-mono">
                            {component}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};