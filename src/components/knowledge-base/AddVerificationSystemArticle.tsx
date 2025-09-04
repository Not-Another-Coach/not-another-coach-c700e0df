import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCreateKBArticle, type KBArticleStatus, type KBContentType } from '@/hooks/useKnowledgeBase';
import { FileText, Shield, CheckCircle2 } from 'lucide-react';

export const AddVerificationSystemArticle = () => {
  const { toast } = useToast();
  const createArticle = useCreateKBArticle();

  const handleAddArticle = async () => {
    try {
      const articleData = {
        title: 'Enhanced Trainer Verification System',
        slug: 'enhanced-trainer-verification-system',
        excerpt: 'Complete guide to the granular trainer verification workflow with document management and automated notifications',
        content: `# Enhanced Trainer Verification System

## Overview
The Enhanced Trainer Verification System provides a comprehensive workflow for verifying trainer credentials through granular checks, document management, and automated status updates with email notifications.

## System Architecture

### Core Components

#### 1. Verification Data Structure
- **Table**: \`trainer_verification_checks\`
- **Purpose**: Granular tracking of individual verification requirements
- **Check Types**:
  - ID Verification
  - Qualification Verification
  - Insurance Verification
  - Background Check
  - Professional References

#### 2. Document Management
- **Storage**: Supabase Storage with secure access policies
- **Features**:
  - File upload validation
  - Document expiry tracking
  - Automatic cleanup of expired documents

#### 3. Status Management
- **Statuses**: pending, under_review, approved, rejected
- **Automation**: Automatic overall status calculation
- **Triggers**: Database triggers for status updates

## Key Features

### Granular Verification Checks
Each trainer undergoes multiple verification steps:

\`\`\`sql
-- Example verification check record
{
  "id": "uuid",
  "trainer_id": "uuid", 
  "check_type": "id_verification",
  "status": "pending",
  "document_url": "storage_url",
  "submitted_at": "timestamp",
  "reviewed_at": null,
  "expires_at": "timestamp",
  "admin_notes": null,
  "rejection_reason": null
}
\`\`\`

### Admin Management Interface

#### EnhancedVerificationManagement
- **Location**: \`src/components/admin/EnhancedVerificationManagement.tsx\`
- **Features**:
  - Pending reviews dashboard
  - Trainer profile overview
  - Document preview and review
  - Bulk approval actions
  - Analytics and reporting

#### Key Admin Functions
1. **Review Workflow**: Step-by-step document verification
2. **Status Updates**: Approve/reject individual checks
3. **Notes System**: Admin can add review notes and rejection reasons
4. **Audit Trail**: Complete history of all verification actions

### Automated Email Notifications

#### Trigger System
Database trigger automatically sends emails on status changes:

\`\`\`sql
CREATE TRIGGER verification_status_change_notification
  AFTER UPDATE ON trainer_verification_checks
  FOR EACH ROW
  EXECUTE FUNCTION notify_verification_status_change();
\`\`\`

#### Email Types
1. **Status Update**: When individual checks are approved/rejected
2. **Completion**: When overall verification is complete
3. **Expiry Reminders**: Before documents expire
4. **Admin Notifications**: For new submissions requiring review

### Status Indicators & UI Components

#### VerificationStatusIndicator
- **Location**: \`src/components/ui/verification-status-indicator.tsx\`
- **Purpose**: Visual status representation with icons and colors
- **Variants**: Different sizes and display options

#### VerificationBadge
- **Location**: \`src/components/ui/verification-badge.tsx\`
- **Purpose**: Simple verified/unverified badge display
- **Integration**: Used throughout trainer profiles and cards

#### VerificationBadgeIntegration
- **Location**: \`src/components/trainer-cards/VerificationBadgeIntegration.tsx\`
- **Purpose**: Seamless integration with trainer card components

## Implementation Details

### Verification Workflow

#### 1. Trainer Submission
\`\`\`typescript
const submitVerificationRequest = async (documents: File[]) => {
  // Upload documents to secure storage
  // Create verification check records
  // Trigger admin notification
};
\`\`\`

#### 2. Admin Review
\`\`\`typescript
const updateVerificationStatus = async (
  checkId: string, 
  status: 'approved' | 'rejected',
  adminNotes?: string,
  rejectionReason?: string
) => {
  // Update individual check status
  // Trigger overall status calculation
  // Send notification emails
};
\`\`\`

#### 3. Status Calculation
Automatic calculation of overall trainer verification status:
- **verified**: All checks approved
- **rejected**: Any check rejected
- **under_review**: Checks pending or in review
- **pending**: Initial state

### Database Schema

#### trainer_verification_checks
\`\`\`sql
CREATE TABLE trainer_verification_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid REFERENCES trainers(id),
  check_type text NOT NULL,
  status text DEFAULT 'pending',
  document_url text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  expires_at timestamptz,
  admin_notes text,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
\`\`\`

#### Key Indexes
- \`idx_verification_trainer_id\`: Fast trainer lookups
- \`idx_verification_status\`: Admin dashboard filtering
- \`idx_verification_expires\`: Expiry processing

### Security & Compliance

#### Document Security
- Row Level Security (RLS) policies
- Encrypted storage URLs
- Time-limited access tokens
- Automatic expiry handling

#### Data Privacy
- GDPR compliant data handling
- Secure document deletion
- Audit trail maintenance
- Admin access logging

### Performance Optimizations

#### Database Optimizations
- Efficient indexes for common queries
- Materialized views for analytics
- Automatic cleanup of expired data

#### UI Optimizations
- Lazy loading of document previews
- Optimistic UI updates
- Batch operations for bulk actions

## Usage Examples

### Trainer Verification Hook
\`\`\`typescript
const { 
  verificationRequest, 
  submitVerificationRequest,
  loading 
} = useTrainerVerification();

// Submit verification documents
await submitVerificationRequest([idDocument, qualificationCert]);
\`\`\`

### Admin Management
\`\`\`typescript
const {
  allRequests,
  updateVerificationStatus,
  trainerProfiles
} = useTrainerVerification();

// Approve a verification check
await updateVerificationStatus(
  checkId, 
  'approved',
  'Documents verified successfully'
);
\`\`\`

### Status Display
\`\`\`tsx
<VerificationStatusIndicator
  status={trainer.verification_status}
  size="md"
  showText={true}
/>
\`\`\`

## Analytics & Reporting

### Verification Analytics
- **Location**: \`src/components/admin/VerificationAnalytics.tsx\`
- **Metrics**:
  - Completion rates by check type
  - Average processing time
  - Approval/rejection ratios
  - Document expiry trends

### Audit Logging
Complete audit trail of all verification actions:
- Admin review decisions
- Status changes
- Document uploads/deletions
- Email notifications sent

## Configuration & Customization

### Check Types Configuration
Easily add new verification check types:
\`\`\`typescript
export const VERIFICATION_CHECK_TYPES = {
  id_verification: 'ID Verification',
  qualification_verification: 'Qualification Verification',
  insurance_verification: 'Insurance Verification',
  background_check: 'Background Check',
  professional_references: 'Professional References'
};
\`\`\`

### Email Templates
Customizable email templates for different notification types:
- Status update notifications
- Expiry reminders
- Admin alerts

### Document Requirements
Configurable document requirements per check type:
- Accepted file formats
- Maximum file sizes
- Expiry periods
- Required fields

## Troubleshooting

### Common Issues
1. **Email notifications not sending**: Check RESEND_API_KEY configuration
2. **Document upload failing**: Verify storage policies and file size limits
3. **Status not updating**: Check database triggers and RLS policies

### Debug Tools
- Admin verification dashboard
- Database query logs
- Email delivery logs
- Storage access logs

## Future Enhancements

### Planned Features
1. **Automated Document Parsing**: OCR for document verification
2. **Risk Scoring**: ML-based risk assessment
3. **Third-party Integrations**: Direct API verification services
4. **Mobile App Support**: Native mobile verification workflows`,
        content_type: 'feature' as KBContentType,
        status: 'published' as KBArticleStatus,
        featured: true,
        tags: ['verification', 'admin', 'security', 'document-management', 'email-notifications', 'trainer-onboarding']
      };

      await createArticle.mutateAsync(articleData);
      toast({
        title: 'Success',
        description: 'Enhanced Trainer Verification System article added to knowledge base',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add article to knowledge base',
        variant: 'destructive',
      });
      console.error('Error adding article:', error);
    }
  };

  return (
    <Button onClick={handleAddArticle} className="flex items-center gap-2">
      <Shield className="h-4 w-4" />
      <CheckCircle2 className="h-4 w-4" />
      <FileText className="h-4 w-4" />
      Add Verification System Article
    </Button>
  );
};