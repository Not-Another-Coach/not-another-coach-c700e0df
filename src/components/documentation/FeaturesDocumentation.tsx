import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, Users, MessageCircle, Calendar, BarChart, 
  Shield, Search, Layers, Settings, Bell, Clock, 
  UserCheck, Filter, Eye, Workflow
} from 'lucide-react';

interface FeaturesDocumentationProps {
  searchTerm: string;
  onElementClick: (elementText: string) => void;
}

const features = [
  {
    category: 'Core Matching & Discovery',
    icon: <Target className="h-4 w-4" />,
    items: [
      {
        name: 'Trainer Matching Algorithm',
        description: 'Intelligent matching system based on client preferences and trainer capabilities',
        components: ['useTrainerMatching', 'useEnhancedTrainerMatching', 'FilterSection'],
        workflow: [
          'Client completes survey with preferences',
          'Algorithm scores trainers based on compatibility',
          'Results filtered by location, budget, and availability',
          'Trainers displayed in ranked order'
        ],
        features: ['Preference scoring', 'Location filtering', 'Budget compatibility', 'Availability matching']
      },
      {
        name: 'Swipe Discovery Interface',
        description: 'Tinder-like interface for discovering and liking trainers',
        components: ['SwipeableCard', 'VisualSwipeSection', 'TrainerCard'],
        workflow: [
          'Trainers presented in card format',
          'Swipe right to like, left to pass',
          'Like actions create engagement records',
          'Liked trainers move to shortlist'
        ],
        features: ['Gesture controls', 'Like/pass actions', 'Engagement tracking', 'Smooth animations']
      },
      {
        name: 'Advanced Filtering',
        description: 'Multi-criteria filtering for trainer discovery',
        components: ['FilterSection', 'useTrainerList'],
        workflow: [
          'Filters applied to trainer pool',
          'Real-time results updating',
          'Filter persistence across sessions',
          'Reset and clear functionality'
        ],
        features: ['Location filters', 'Price range', 'Specialization', 'Availability', 'Rating filters']
      }
    ]
  },
  {
    category: 'Engagement & Journey Management',
    icon: <Workflow className="h-4 w-4" />,
    items: [
      {
        name: 'Engagement Stages System',
        description: 'Progressive relationship stages from discovery to active client',
        components: ['useEngagementStage', 'ProgressBreadcrumb', 'MatchProgressIndicator'],
        workflow: [
          'browsing → User discovering trainers',
          'liked → User liked trainer profile',
          'shortlisted → Trainer added to shortlist',
          'matched → Mutual interest established',
          'discovery_completed → Discovery call finished',
          'active_client → Paying client relationship'
        ],
        features: ['Stage progression', 'Visibility control', 'Access gating', 'Progress tracking']
      },
      {
        name: 'Client Journey Tracking',
        description: 'Comprehensive tracking of client onboarding and progress',
        components: ['useClientJourneyProgress', 'ClientJourneyBreadcrumb', 'StepCompletionIcon'],
        workflow: [
          'Survey completion tracking',
          'Preference setting progress',
          'Discovery phase monitoring',
          'Selection process tracking'
        ],
        features: ['Progress visualization', 'Step completion', 'Journey analytics', 'Personalized guidance']
      },
      {
        name: 'Tiered Profile Visibility',
        description: 'Content access based on client-trainer engagement level',
        components: ['TieredTrainerProfile', 'useContentVisibility', 'PricingLockMessage'],
        workflow: [
          'Basic info visible to all users',
          'Additional content unlocked with engagement',
          'Full pricing visible after shortlisting',
          'Premium content for active clients'
        ],
        features: ['Progressive disclosure', 'Engagement-based access', 'Content gating', 'Unlock messaging']
      }
    ]
  },
  {
    category: 'Discovery Call System',
    icon: <Calendar className="h-4 w-4" />,
    items: [
      {
        name: 'Discovery Call Booking',
        description: 'End-to-end discovery call scheduling and management',
        components: ['DiscoveryCallBookingModal', 'useDiscoveryCallBooking', 'BookDiscoveryCallButton'],
        workflow: [
          'Client selects available time slot',
          'Booking confirmation sent to both parties',
          'Calendar integration and reminders',
          'Pre-call preparation and notes'
        ],
        features: ['Calendar integration', 'Email confirmations', 'Reminder system', 'Reschedule options']
      },
      {
        name: 'Dynamic Feedback System',
        description: 'Configurable post-call feedback collection',
        components: ['DynamicDiscoveryCallFeedbackForm', 'FeedbackQuestionBuilder', 'useFeedbackQuestions'],
        workflow: [
          'Admin configures feedback questions',
          'Questions dynamically presented to clients',
          'Responses collected and stored',
          'Feedback shared with trainers (optional)'
        ],
        features: ['Dynamic questions', 'Multiple question types', 'Privacy controls', 'Analytics integration']
      },
      {
        name: 'Call Notes & Preparation',
        description: 'Trainer note-taking and call preparation system',
        components: ['DiscoveryCallNotesTaker', 'useDiscoveryCallNotes'],
        workflow: [
          'Pre-call client research and prep',
          'Live note-taking during calls',
          'Post-call insights and follow-up',
          'Notes linked to client engagement'
        ],
        features: ['Pre-call notes', 'Live note-taking', 'Client insights', 'Follow-up tracking']
      }
    ]
  },
  {
    category: 'Coach Selection & Payment',
    icon: <UserCheck className="h-4 w-4" />,
    items: [
      {
        name: 'Coach Selection Workflow',
        description: 'Formal process for clients to select and engage trainers',
        components: ['ChooseCoachButton', 'ChooseCoachModal', 'CoachSelectionRequests'],
        workflow: [
          'Client selects package and submits request',
          'Trainer receives and responds to request',
          'Accept, decline, or suggest alternatives',
          'Payment processing upon acceptance'
        ],
        features: ['Package selection', 'Request management', 'Response options', 'Alternative suggestions']
      },
      {
        name: 'Payment Integration',
        description: 'Secure payment processing for coaching packages',
        components: ['PaymentForm', 'Payment processing'],
        workflow: [
          'Coach selection triggers payment flow',
          'Secure payment form presentation',
          'Payment processing and confirmation',
          'Engagement stage advancement'
        ],
        features: ['Secure processing', 'Multiple payment methods', 'Confirmation system', 'Receipt generation']
      }
    ]
  },
  {
    category: 'Communication & Messaging',
    icon: <MessageCircle className="h-4 w-4" />,
    items: [
      {
        name: 'Real-time Messaging',
        description: 'Secure messaging between clients and trainers',
        components: ['MessagingPopup', 'useConversations', 'FloatingMessageButton'],
        workflow: [
          'Conversation creation after engagement',
          'Real-time message delivery',
          'Read receipt tracking',
          'Message history and search'
        ],
        features: ['Real-time delivery', 'Read receipts', 'Message restrictions', 'Conversation management']
      },
      {
        name: 'Activity Alerts',
        description: 'Notification system for important events and updates',
        components: ['useActivityAlerts', 'LiveActivityFeed', 'SessionNotification'],
        workflow: [
          'System generates activity alerts',
          'Users receive relevant notifications',
          'Alert interaction tracking',
          'Priority-based delivery'
        ],
        features: ['Real-time alerts', 'Priority system', 'Interaction tracking', 'Customizable preferences']
      }
    ]
  },
  {
    category: 'Waitlist & Availability',
    icon: <Clock className="h-4 w-4" />,
    items: [
      {
        name: 'Waitlist Management',
        description: 'Comprehensive waitlist system for unavailable coaches',
        components: ['WaitlistManagement', 'useWaitlist', 'WaitlistJoinButton'],
        workflow: [
          'Client joins waitlist for full coaches',
          'Coach manages waitlist entries',
          'Automated follow-up scheduling',
          'Space availability notifications'
        ],
        features: ['Automated management', 'Status tracking', 'Follow-up system', 'Priority ordering']
      },
      {
        name: 'Availability Settings',
        description: 'Coach availability and capacity management',
        components: ['AvailabilitySettings', 'AvailabilityGrid', 'AvailabilityStructured'],
        workflow: [
          'Coach sets availability status',
          'Calendar integration for bookings',
          'Automatic waitlist enrollment',
          'Capacity limit enforcement'
        ],
        features: ['Status management', 'Calendar sync', 'Capacity limits', 'Automated responses']
      }
    ]
  },
  {
    category: 'Analytics & Insights',
    icon: <BarChart className="h-4 w-4" />,
    items: [
      {
        name: 'Coach Analytics Dashboard',
        description: 'Comprehensive performance metrics for trainers',
        components: ['CoachAnalyticsDashboard', 'useCoachAnalytics'],
        workflow: [
          'Data collection from user interactions',
          'Metric calculation and aggregation',
          'Visual dashboard presentation',
          'Trend analysis and insights'
        ],
        features: ['Performance metrics', 'Engagement analytics', 'Conversion tracking', 'Visual dashboards']
      },
      {
        name: 'User Journey Analytics',
        description: 'Track user progression and behavior patterns',
        components: ['useJourneyProgress', 'user_journey_tracking table'],
        workflow: [
          'Journey step completion tracking',
          'User behavior analysis',
          'Drop-off point identification',
          'Optimization recommendations'
        ],
        features: ['Journey mapping', 'Behavior tracking', 'Drop-off analysis', 'Performance insights']
      }
    ]
  },
  {
    category: 'Admin & Management',
    icon: <Shield className="h-4 w-4" />,
    items: [
      {
        name: 'User Management System',
        description: 'Administrative tools for user account management',
        components: ['UserManagement', 'BulkUserUpload', 'TestUserCleanup'],
        workflow: [
          'User account creation and management',
          'Bulk operations for efficiency',
          'Account status and role management',
          'Audit trail maintenance'
        ],
        features: ['Bulk operations', 'Role management', 'Account controls', 'Audit logging']
      },
      {
        name: 'System Configuration',
        description: 'Dynamic configuration of system features and content',
        components: ['FeedbackQuestionBuilder', 'Alert management'],
        workflow: [
          'Admin configures system features',
          'Dynamic content and question setup',
          'Feature flag management',
          'System-wide alert distribution'
        ],
        features: ['Dynamic configuration', 'Feature flags', 'Content management', 'System alerts']
      }
    ]
  }
];

export const FeaturesDocumentation: React.FC<FeaturesDocumentationProps> = ({ searchTerm, onElementClick }) => {
  const filteredFeatures = features.map(category => ({
    ...category,
    items: category.items.filter(feature => 
      feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.features.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="space-y-8">
      {filteredFeatures.map((category) => (
        <div key={category.category}>
          <div className="flex items-center gap-2 mb-4">
            {category.icon}
            <h2 className="text-2xl font-semibold text-foreground">
              {category.category}
            </h2>
          </div>
          <div className="grid gap-6">
            {category.items.map((feature) => (
              <Card key={feature.name} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle 
                    className="text-xl cursor-pointer hover:text-primary transition-colors"
                    onClick={() => onElementClick(feature.name)}
                  >
                    {feature.name}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-2">Key Components</h4>
                      <div className="flex flex-wrap gap-2">
                        {feature.components.map((component) => (
                          <Badge 
                            key={component} 
                            variant="outline" 
                            className="text-xs font-mono cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => onElementClick(component)}
                          >
                            {component}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-2">Workflow</h4>
                      <div className="space-y-2">
                        {feature.workflow.map((step, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <Badge variant="secondary" className="text-xs min-w-6 h-6 flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <span className="text-muted-foreground">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-2">Key Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {feature.features.map((f) => (
                          <Badge 
                            key={f} 
                            variant="secondary" 
                            className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors"
                            onClick={() => onElementClick(f)}
                          >
                            {f}
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