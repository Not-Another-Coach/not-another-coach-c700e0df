import { supabase } from '@/integrations/supabase/client';

export const createInstagramGoalSettingArticle = async () => {
  const articleContent = `
# Instagram Integration and Goal Setting Features

## Overview

The platform now includes comprehensive Instagram integration capabilities and enhanced goal setting features for trainers and clients. These features are designed to improve engagement, provide social proof, and enable better client progress tracking.

## Instagram Integration

### Features
- **OAuth Authentication**: Secure connection to Instagram accounts using official Instagram Basic Display API
- **Media Synchronization**: Automatic retrieval of trainer's Instagram posts and media
- **Handle Revelation**: Privacy-controlled sharing of Instagram handles with clients after discovery calls
- **Profile Enhancement**: Integration of Instagram content into trainer profiles for better social proof

### Technical Implementation
- **OAuth Edge Function**: \`instagram-oauth\` function handles authentication flow
- **Media Retrieval**: \`instagram-media\` function fetches posts and media
- **Token Management**: Automatic refresh token handling for sustained connections
- **Privacy Controls**: Trainers can configure when their Instagram handle is revealed to clients

### Components
- **InstagramIntegration**: Main connection interface for trainers
- **InstagramRevealSettings**: Privacy control settings
- **RevealedInstagramHandles**: Client view of revealed handles
- **InstagramMediaPicker**: Media selection for profile enhancement

### Database Schema
\`\`\`sql
-- Instagram connections table
instagram_connections (
  id uuid PRIMARY KEY,
  trainer_id uuid REFERENCES profiles(id),
  instagram_user_id text,
  username text,
  access_token text (encrypted),
  refresh_token text (encrypted),
  reveal_handle_post_discovery boolean DEFAULT false,
  is_active boolean DEFAULT true
)

-- Handle revelation tracking
instagram_handle_revelations (
  id uuid PRIMARY KEY,
  trainer_id uuid,
  client_id uuid,
  connection_id uuid,
  discovery_call_id uuid,
  revealed_at timestamp DEFAULT now()
)
\`\`\`

## Goal Setting System

### Features
- **Client Goal Definition**: Structured goal input during client survey
- **Trainer Goal Assignment**: Trainers can assign specific goals to clients
- **Progress Tracking**: Goal-based progress monitoring and analytics
- **Critical Task Management**: Goal-linked task system for accountability

### Components
- **GoalsSection**: Goal management interface
- **ClientSurvey Goal Steps**: Goal collection during onboarding
- **Goal-Client Linking**: Association system between goals and clients

### Database Schema
\`\`\`sql
-- Goals table
goals (
  id uuid PRIMARY KEY,
  trainer_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  description text,
  category text,
  is_active boolean DEFAULT true
)

-- Goal-client associations
goal_client_links (
  id uuid PRIMARY KEY,
  goal_id uuid REFERENCES goals(id),
  client_id uuid REFERENCES profiles(id),
  assigned_at timestamp DEFAULT now()
)

-- Critical tasks linked to goals
critical_tasks (
  id uuid PRIMARY KEY,
  trainer_id uuid,
  goal_id uuid REFERENCES goals(id),
  title text NOT NULL,
  description text,
  status ct_status DEFAULT 'to_do',
  due_date date,
  completed_at timestamp
)
\`\`\`

## Integration Workflow

### Instagram Connection Flow
1. **Trainer Authentication**: Trainer initiates Instagram connection
2. **OAuth Redirect**: User redirected to Instagram authorization
3. **Token Exchange**: Authorization code exchanged for access tokens
4. **Profile Sync**: Instagram profile data synchronized
5. **Media Access**: Trainer posts become available for profile enhancement

### Goal Setting Workflow
1. **Client Survey**: Initial goal collection during client onboarding
2. **Trainer Review**: Trainers review and refine client goals
3. **Goal Assignment**: Specific goals assigned to clients
4. **Task Creation**: Critical tasks created and linked to goals
5. **Progress Tracking**: Regular monitoring and updates

## Privacy and Security

### Instagram Integration
- **Encrypted Storage**: All tokens stored with encryption
- **Configurable Sharing**: Trainers control when handles are revealed
- **Automatic Expiry**: Handles revealed only after discovery call completion
- **Revocation Support**: Easy disconnection and token revocation

### Goal Data
- **Access Control**: Goals only visible to assigned trainer and client
- **Data Retention**: Goal data follows standard retention policies
- **Privacy Compliance**: Full GDPR compliance for goal and progress data

## Usage Guidelines

### For Trainers
1. **Instagram Setup**: Connect Instagram account in profile settings
2. **Privacy Configuration**: Set handle revelation preferences
3. **Media Selection**: Choose appropriate posts for profile display
4. **Goal Management**: Create and assign goals to clients
5. **Progress Monitoring**: Regular review of client goal progress

### For Clients
1. **Goal Input**: Provide clear, specific goals during survey
2. **Instagram Access**: View trainer's Instagram after discovery calls (if enabled)
3. **Progress Updates**: Regular updates on goal achievement
4. **Task Completion**: Complete critical tasks linked to goals

## Best Practices

### Instagram Integration
- Use high-quality, professional content
- Maintain consistent posting schedule
- Ensure content aligns with professional brand
- Regularly review and update media selection

### Goal Setting
- Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
- Regular goal review and adjustment
- Link goals to specific, actionable tasks
- Celebrate milestone achievements

## Troubleshooting

### Common Instagram Issues
- **Connection Failed**: Check Instagram app configuration and secrets
- **Token Expired**: Automatic refresh should handle this, manual reconnection if needed
- **Media Not Loading**: Verify Instagram permissions and account status

### Goal Setting Issues
- **Goals Not Saving**: Check database permissions and validation
- **Tasks Not Linking**: Verify goal-task relationship configuration
- **Progress Not Updating**: Check critical task completion triggers

## Future Enhancements

### Planned Features
- **Instagram Stories Integration**: Access to trainer story highlights
- **Advanced Goal Analytics**: Detailed progress reporting and insights
- **Goal Templates**: Pre-built goal structures for common fitness objectives
- **Social Sharing**: Client progress sharing capabilities (with permission)

## Technical Support

For technical issues or feature requests, please refer to the system documentation or contact the development team. All Instagram API usage follows Meta's guidelines and terms of service.
`;

  const slug = 'instagram-integration-goal-setting';
  
  const article = {
    title: 'Instagram Integration and Goal Setting Features',
    slug,
    content: articleContent.trim(),
    excerpt: 'Comprehensive guide to Instagram integration capabilities and enhanced goal setting features for trainers and clients.',
    content_type: 'feature' as const,
    status: 'published' as const,
    featured: true,
    view_count: 0,
    metadata: {
      version: '1.0',
      last_updated: new Date().toISOString(),
      technical_level: 'intermediate',
      components: [
        'InstagramIntegration',
        'InstagramRevealSettings', 
        'RevealedInstagramHandles',
        'GoalsSection',
        'ClientSurvey'
      ],
      edge_functions: [
        'instagram-oauth',
        'instagram-media',
        'instagram-refresh-token'
      ],
      database_tables: [
        'instagram_connections',
        'instagram_handle_revelations',
        'goals',
        'goal_client_links',
        'critical_tasks'
      ]
    }
  };

  const { data, error } = await supabase
    .from('kb_articles')
    .insert(article)
    .select()
    .single();

  if (error) {
    console.error('Error creating article:', error);
    throw error;
  }

  return data;
};