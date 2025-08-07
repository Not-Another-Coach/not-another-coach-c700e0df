import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Users, MessageCircle, Calendar, BarChart, Shield, Settings, FileText } from 'lucide-react';

interface DatabaseDocumentationProps {
  searchTerm: string;
}

const tables = [
  {
    category: 'Core User Management',
    icon: <Users className="h-4 w-4" />,
    items: [
      {
        name: 'profiles',
        description: 'Main user profile data for clients, trainers, and admins',
        keyColumns: ['id', 'user_type', 'first_name', 'last_name', 'bio', 'location', 'specializations'],
        relationships: ['Connected to auth.users via id', 'Referenced by most other tables'],
        purpose: 'Central user data storage with role-based fields'
      },
      {
        name: 'user_roles',
        description: 'User role assignments for granular permissions',
        keyColumns: ['user_id', 'role'],
        relationships: ['References profiles.id'],
        purpose: 'Role-based access control and permission management'
      },
      {
        name: 'login_history',
        description: 'Track user login attempts and sessions',
        keyColumns: ['user_id', 'login_at', 'success', 'ip_address'],
        relationships: ['References profiles.id'],
        purpose: 'Security monitoring and user activity tracking'
      }
    ]
  },
  {
    category: 'Engagement & Matching',
    icon: <Settings className="h-4 w-4" />,
    items: [
      {
        name: 'client_trainer_engagement',
        description: 'Tracks relationship stages between clients and trainers',
        keyColumns: ['client_id', 'trainer_id', 'stage', 'liked_at', 'matched_at', 'notes'],
        relationships: ['References profiles.id for both client and trainer'],
        purpose: 'Core engagement tracking through discovery to active client stages'
      },
      {
        name: 'coach_selection_requests',
        description: 'Client requests to work with specific trainers',
        keyColumns: ['client_id', 'trainer_id', 'package_id', 'status', 'client_message'],
        relationships: ['References profiles.id and trainer packages'],
        purpose: 'Formal coach selection and approval workflow'
      },
      {
        name: 'trainer_visibility_settings',
        description: 'Controls what content is visible at different engagement stages',
        keyColumns: ['trainer_id', 'content_type', 'engagement_stage', 'visibility_state'],
        relationships: ['References profiles.id'],
        purpose: 'Tiered profile visibility and content access control'
      }
    ]
  },
  {
    category: 'Discovery Call System',
    icon: <Calendar className="h-4 w-4" />,
    items: [
      {
        name: 'discovery_calls',
        description: 'Scheduled discovery calls between clients and trainers',
        keyColumns: ['client_id', 'trainer_id', 'scheduled_for', 'status', 'duration_minutes'],
        relationships: ['References profiles.id for both parties'],
        purpose: 'Discovery call scheduling and management'
      },
      {
        name: 'discovery_call_feedback',
        description: 'Client feedback after discovery calls',
        keyColumns: ['discovery_call_id', 'client_id', 'trainer_id', 'professionalism', 'share_with_coach'],
        relationships: ['References discovery_calls and profiles'],
        purpose: 'Collect and manage post-call feedback from clients'
      },
      {
        name: 'discovery_call_feedback_questions',
        description: 'Dynamic feedback question configuration',
        keyColumns: ['question_text', 'question_type', 'audience', 'is_mandatory', 'visible_to_pt'],
        relationships: ['Referenced by feedback responses'],
        purpose: 'Configurable feedback question system'
      },
      {
        name: 'discovery_call_feedback_responses',
        description: 'Individual responses to feedback questions',
        keyColumns: ['question_id', 'discovery_call_id', 'response_value', 'response_data'],
        relationships: ['References questions and calls'],
        purpose: 'Store structured feedback responses'
      },
      {
        name: 'discovery_call_notes',
        description: 'Trainer notes for discovery calls',
        keyColumns: ['trainer_id', 'client_id', 'discovery_call_id', 'note_content'],
        relationships: ['References profiles and discovery calls'],
        purpose: 'Trainer note-taking and client insights'
      },
      {
        name: 'discovery_call_notifications',
        description: 'Email notifications for discovery calls',
        keyColumns: ['discovery_call_id', 'notification_type', 'recipient_email', 'sent_at'],
        relationships: ['References discovery_calls'],
        purpose: 'Automated notification system for calls'
      }
    ]
  },
  {
    category: 'Communication',
    icon: <MessageCircle className="h-4 w-4" />,
    items: [
      {
        name: 'conversations',
        description: 'Chat conversations between clients and trainers',
        keyColumns: ['client_id', 'trainer_id', 'last_message_at', 'client_last_read_at'],
        relationships: ['References profiles.id for both parties'],
        purpose: 'Conversation management and read status tracking'
      },
      {
        name: 'messages',
        description: 'Individual messages within conversations',
        keyColumns: ['conversation_id', 'sender_id', 'content', 'message_type', 'read_at'],
        relationships: ['References conversations and profiles'],
        purpose: 'Message storage with read receipts and typing indicators'
      }
    ]
  },
  {
    category: 'Waitlist & Availability',
    icon: <FileText className="h-4 w-4" />,
    items: [
      {
        name: 'coach_waitlists',
        description: 'Client waitlists for unavailable coaches',
        keyColumns: ['coach_id', 'client_id', 'status', 'joined_at', 'estimated_start_date'],
        relationships: ['References profiles.id for both parties'],
        purpose: 'Waitlist management when coaches are at capacity'
      },
      {
        name: 'coach_availability_settings',
        description: 'Coach availability status and preferences',
        keyColumns: ['coach_id', 'availability_status', 'next_available_date', 'waitlist_message'],
        relationships: ['References profiles.id'],
        purpose: 'Coach capacity and availability management'
      },
      {
        name: 'trainer_availability_settings',
        description: 'Detailed trainer scheduling and discovery call availability',
        keyColumns: ['trainer_id', 'availability_schedule', 'offers_discovery_call', 'prep_notes'],
        relationships: ['References profiles.id'],
        purpose: 'Granular availability and booking configuration'
      },
      {
        name: 'waitlist_interactions',
        description: 'Interactions and follow-ups for waitlisted clients',
        keyColumns: ['waitlist_id', 'interaction_type', 'scheduled_for', 'completed_at'],
        relationships: ['References coach_waitlists'],
        purpose: 'Automated and manual waitlist follow-up system'
      }
    ]
  },
  {
    category: 'Analytics & Tracking',
    icon: <BarChart className="h-4 w-4" />,
    items: [
      {
        name: 'coach_analytics',
        description: 'Trainer performance metrics and engagement data',
        keyColumns: ['trainer_id', 'total_views', 'total_likes', 'conversion_rate', 'match_tier_stats'],
        relationships: ['References profiles.id'],
        purpose: 'Performance tracking and analytics for trainers'
      },
      {
        name: 'user_journey_tracking',
        description: 'Track user progression through the application',
        keyColumns: ['user_id', 'stage', 'step_name', 'completed_at', 'metadata'],
        relationships: ['References profiles.id'],
        purpose: 'Journey analytics and user behavior tracking'
      }
    ]
  },
  {
    category: 'Configuration & Admin',
    icon: <Shield className="h-4 w-4" />,
    items: [
      {
        name: 'alerts',
        description: 'System-wide alerts and notifications',
        keyColumns: ['alert_type', 'title', 'content', 'target_audience', 'is_active'],
        relationships: ['May reference user_alert_interactions'],
        purpose: 'System notifications and announcement management'
      },
      {
        name: 'user_alert_interactions',
        description: 'User interactions with alerts (read, dismissed)',
        keyColumns: ['user_id', 'alert_id', 'interaction_type'],
        relationships: ['References profiles.id and alerts.id'],
        purpose: 'Track user engagement with system alerts'
      },
      {
        name: 'admin_actions_log',
        description: 'Audit trail for administrative actions',
        keyColumns: ['admin_id', 'target_user_id', 'action_type', 'reason', 'action_details'],
        relationships: ['References profiles.id'],
        purpose: 'Administrative action logging and audit trail'
      },
      {
        name: 'package_ways_of_working',
        description: 'Trainer package delivery methodology',
        keyColumns: ['trainer_id', 'package_id', 'onboarding_items', 'ongoing_structure_items'],
        relationships: ['References profiles.id'],
        purpose: 'Package-specific delivery and methodology configuration'
      }
    ]
  }
];

export const DatabaseDocumentation: React.FC<DatabaseDocumentationProps> = ({ searchTerm }) => {
  const filteredTables = tables.map(category => ({
    ...category,
    items: category.items.filter(table => 
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="space-y-8">
      {filteredTables.map((category) => (
        <div key={category.category}>
          <div className="flex items-center gap-2 mb-4">
            {category.icon}
            <h2 className="text-2xl font-semibold text-foreground">
              {category.category}
            </h2>
          </div>
          <div className="grid gap-4">
            {category.items.map((table) => (
              <Card key={table.name} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-mono">{table.name}</CardTitle>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      Table
                    </Badge>
                  </div>
                  <CardDescription>{table.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-2">Key Columns</h4>
                      <div className="flex flex-wrap gap-2">
                        {table.keyColumns.map((column) => (
                          <Badge key={column} variant="secondary" className="text-xs font-mono">
                            {column}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-2">Relationships</h4>
                      <div className="space-y-1">
                        {table.relationships.map((relationship, index) => (
                          <p key={index} className="text-xs text-muted-foreground font-mono">
                            {relationship}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-2">Purpose</h4>
                      <p className="text-sm text-muted-foreground">{table.purpose}</p>
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