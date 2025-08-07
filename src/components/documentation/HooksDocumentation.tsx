import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Database, User, Settings, MessageCircle, Calendar } from 'lucide-react';

interface HooksDocumentationProps {
  searchTerm: string;
  onElementClick: (elementText: string) => void;
}

const hooks = [
  {
    category: 'Authentication & User Management',
    icon: <User className="h-4 w-4" />,
    items: [
      {
        name: 'useAuth',
        file: 'useAuth.tsx',
        description: 'Manages user authentication state and session',
        returns: ['user', 'loading', 'signIn', 'signOut', 'signUp'],
        usage: 'Authentication flows, protected routes, user session management'
      },
      {
        name: 'useProfile',
        file: 'useProfile.tsx',
        description: 'Handles user profile data and updates',
        returns: ['profile', 'loading', 'updateProfile', 'refreshProfile'],
        usage: 'Profile management, user data display, profile updates'
      },
      {
        name: 'useUserRoles',
        file: 'useUserRoles.tsx',
        description: 'Manages user roles and permissions',
        returns: ['roles', 'hasRole', 'loading'],
        usage: 'Role-based access control, permission checks'
      }
    ]
  },
  {
    category: 'Trainer Discovery & Matching',
    icon: <Settings className="h-4 w-4" />,
    items: [
      {
        name: 'useTrainerMatching',
        file: 'useTrainerMatching.tsx',
        description: 'Core trainer matching algorithm and filtering',
        returns: ['matchedTrainers', 'loading', 'refreshMatches', 'filters'],
        usage: 'Discovery page, trainer recommendations, matching logic'
      },
      {
        name: 'useEnhancedTrainerMatching',
        file: 'useEnhancedTrainerMatching.tsx',
        description: 'Advanced matching with engagement tracking',
        returns: ['trainers', 'loading', 'likeTrainer', 'saveTrainer', 'shortlistTrainer'],
        usage: 'Enhanced discovery experience, engagement tracking'
      },
      {
        name: 'useRealTrainers',
        file: 'useRealTrainers.tsx',
        description: 'Fetches real trainer data from database',
        returns: ['trainers', 'loading', 'error', 'refreshTrainers'],
        usage: 'Trainer listing, profile display, trainer data management'
      },
      {
        name: 'useSavedTrainers',
        file: 'useSavedTrainers.tsx',
        description: 'Manages client\'s saved trainer list',
        returns: ['savedTrainers', 'loading', 'saveTrainer', 'removeSavedTrainer'],
        usage: 'Saved trainers page, bookmark functionality'
      },
      {
        name: 'useShortlistedTrainers',
        file: 'useShortlistedTrainers.tsx',
        description: 'Manages client\'s shortlisted trainers',
        returns: ['shortlistedTrainers', 'loading', 'addToShortlist', 'removeFromShortlist'],
        usage: 'Shortlist page, trainer comparison, selection process'
      }
    ]
  },
  {
    category: 'Discovery Calls & Booking',
    icon: <Calendar className="h-4 w-4" />,
    items: [
      {
        name: 'useDiscoveryCallBooking',
        file: 'useDiscoveryCallBooking.tsx',
        description: 'Handles discovery call scheduling and management',
        returns: ['availableSlots', 'bookCall', 'cancelCall', 'rescheduleCall', 'loading'],
        usage: 'Discovery call booking, calendar integration, call management'
      },
      {
        name: 'useDiscoveryCallData',
        file: 'useDiscoveryCallData.tsx',
        description: 'Fetches discovery call data and status',
        returns: ['calls', 'loading', 'refreshCalls', 'getCallStatus'],
        usage: 'Call history, status tracking, call data display'
      },
      {
        name: 'useDiscoveryCallFeedback',
        file: 'useDiscoveryCallFeedback.tsx',
        description: 'Manages post-call feedback collection',
        returns: ['submitFeedback', 'feedback', 'loading', 'hasFeedback'],
        usage: 'Feedback forms, feedback display, feedback management'
      },
      {
        name: 'useDiscoveryCallNotes',
        file: 'useDiscoveryCallNotes.tsx',
        description: 'Trainer notes for discovery calls',
        returns: ['notes', 'saveNotes', 'loading', 'deleteNotes'],
        usage: 'Trainer note-taking, call preparation, client insights'
      },
      {
        name: 'useDiscoveryCallNotifications',
        file: 'useDiscoveryCallNotifications.tsx',
        description: 'Manages call notifications and reminders',
        returns: ['notifications', 'markAsRead', 'loading'],
        usage: 'Notification display, reminder management'
      },
      {
        name: 'useDiscoveryCallSettings',
        file: 'useDiscoveryCallSettings.tsx',
        description: 'Trainer discovery call configuration',
        returns: ['settings', 'updateSettings', 'loading'],
        usage: 'Trainer setup, availability configuration'
      }
    ]
  },
  {
    category: 'Communication & Messaging',
    icon: <MessageCircle className="h-4 w-4" />,
    items: [
      {
        name: 'useConversations',
        file: 'useConversations.tsx',
        description: 'Manages conversations between clients and trainers',
        returns: ['conversations', 'loading', 'createConversation', 'markAsRead'],
        usage: 'Messaging interface, conversation management'
      },
      {
        name: 'useWaitlist',
        file: 'useWaitlist.tsx',
        description: 'Waitlist management for coaches and clients',
        returns: ['waitlistEntries', 'joinWaitlist', 'leaveWaitlist', 'updateStatus', 'loading'],
        usage: 'Waitlist functionality, availability management'
      }
    ]
  },
  {
    category: 'Coach Management & Analytics',
    icon: <Database className="h-4 w-4" />,
    items: [
      {
        name: 'useCoachAnalytics',
        file: 'useCoachAnalytics.tsx',
        description: 'Trainer performance and engagement analytics',
        returns: ['analytics', 'loading', 'refreshAnalytics'],
        usage: 'Trainer dashboard, performance metrics, insights'
      },
      {
        name: 'useCoachSelection',
        file: 'useCoachSelection.tsx',
        description: 'Coach selection process and requests',
        returns: ['requests', 'createRequest', 'respondToRequest', 'loading'],
        usage: 'Coach selection workflow, request management'
      },
      {
        name: 'useTrainerEngagement',
        file: 'useTrainerEngagement.tsx',
        description: 'Tracks client-trainer engagement stages',
        returns: ['engagements', 'updateStage', 'loading'],
        usage: 'Engagement tracking, stage progression'
      }
    ]
  },
  {
    category: 'Journey & Progress Tracking',
    icon: <Settings className="h-4 w-4" />,
    items: [
      {
        name: 'useJourneyProgress',
        file: 'useJourneyProgress.tsx',
        description: 'Tracks user journey progression',
        returns: ['progress', 'updateProgress', 'loading'],
        usage: 'Journey tracking, progress indicators'
      },
      {
        name: 'useClientJourneyProgress',
        file: 'useClientJourneyProgress.tsx',
        description: 'Client-specific journey tracking',
        returns: ['clientProgress', 'updateClientProgress', 'loading'],
        usage: 'Client onboarding, progress visualization'
      },
      {
        name: 'useEngagementStage',
        file: 'useEngagementStage.tsx',
        description: 'Manages engagement stages between clients and trainers',
        returns: ['stage', 'updateStage', 'canTransition', 'loading'],
        usage: 'Stage management, workflow control'
      }
    ]
  },
  {
    category: 'Utility & UI Hooks',
    icon: <Code className="h-4 w-4" />,
    items: [
      {
        name: 'useFormValidation',
        file: 'useFormValidation.tsx',
        description: 'Form validation utilities',
        returns: ['validate', 'errors', 'isValid'],
        usage: 'Form validation, error handling'
      },
      {
        name: 'useContentVisibility',
        file: 'useContentVisibility.tsx',
        description: 'Controls content visibility based on engagement',
        returns: ['isVisible', 'checkVisibility', 'loading'],
        usage: 'Tiered profile visibility, content gating'
      },
      {
        name: 'useVisibilityMatrix',
        file: 'useVisibilityMatrix.tsx',
        description: 'Advanced visibility control matrix',
        returns: ['visibilityMatrix', 'updateVisibility', 'loading'],
        usage: 'Complex visibility rules, content access control'
      },
      {
        name: 'useActivityAlerts',
        file: 'useActivityAlerts.tsx',
        description: 'Activity-based alert system',
        returns: ['alerts', 'markAsRead', 'loading'],
        usage: 'Activity notifications, alert management'
      }
    ]
  }
];

export const HooksDocumentation: React.FC<HooksDocumentationProps> = ({ searchTerm, onElementClick }) => {
  const filteredHooks = hooks.map(category => ({
    ...category,
    items: category.items.filter(hook => 
      hook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hook.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hook.usage.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="space-y-8">
      {filteredHooks.map((category) => (
        <div key={category.category}>
          <div className="flex items-center gap-2 mb-4">
            {category.icon}
            <h2 className="text-2xl font-semibold text-foreground">
              {category.category}
            </h2>
          </div>
          <div className="grid gap-4">
            {category.items.map((hook) => (
              <Card key={hook.name} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle 
                      className="text-xl font-mono cursor-pointer hover:text-primary transition-colors"
                      onClick={() => onElementClick(hook.name)}
                    >
                      {hook.name}
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className="font-mono text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => onElementClick(hook.file)}
                    >
                      {hook.file}
                    </Badge>
                  </div>
                  <CardDescription>{hook.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-2">Returns</h4>
                      <div className="flex flex-wrap gap-2">
                        {hook.returns.map((returnValue) => (
                          <Badge 
                            key={returnValue} 
                            variant="secondary" 
                            className="text-xs font-mono cursor-pointer hover:bg-secondary/80 transition-colors"
                            onClick={() => onElementClick(returnValue)}
                          >
                            {returnValue}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-2">Common Usage</h4>
                      <p className="text-sm text-muted-foreground">{hook.usage}</p>
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