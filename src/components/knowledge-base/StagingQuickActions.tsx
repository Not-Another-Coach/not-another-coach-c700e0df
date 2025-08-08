import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Send, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStagedArticleCreator } from '@/hooks/useStagedArticles';

interface QuickStageButtonProps {
  title: string;
  content: string;
  description: string;
  buttonText: string;
  contentType?: 'feature' | 'api' | 'component' | 'hook' | 'database' | 'business_rule' | 'integration';
}

export const QuickStageButton: React.FC<QuickStageButtonProps> = ({
  title,
  content,
  description,
  buttonText,
  contentType = 'business_rule'
}) => {
  const { createStagedArticle } = useStagedArticleCreator();

  const handleCreate = async () => {
    await createStagedArticle({
      title,
      content,
      excerpt: description,
      contentType,
      metadata: {
        created_via: 'quick_stage_button',
        auto_generated: true
      }
    });
  };

  return (
    <Card className="transition-colors hover:bg-muted/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          {title}
        </CardTitle>
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleCreate} variant="outline" size="sm" className="w-full">
          <Send className="h-3 w-3 mr-2" />
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export const StagingQuickActions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Quick Staging Actions
        </CardTitle>
        <CardDescription>
          Create common article templates that will be staged for your review.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickStageButton
            title="Feature Documentation"
            content={`# Feature Name

## Overview
Brief description of the feature and its purpose.

## User Story
As a [user type], I want [goal] so that [benefit].

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Implementation Details
Technical implementation notes.

## UI/UX Notes
Design and user experience considerations.

## Testing Requirements
- Unit tests needed
- Integration tests needed
- User acceptance testing

## Related Components
List of affected components and files.
            `}
            description="Template for documenting new features"
            buttonText="Create Feature Doc"
            contentType="feature"
          />

          <QuickStageButton
            title="Bug Fix Documentation"
            content={`# Bug Fix: [Issue Description]

## Problem Statement
Clear description of the bug and its impact.

## Root Cause Analysis
What caused the issue?

## Solution Implemented
Detailed explanation of the fix.

## Files Changed
- File 1: Description of changes
- File 2: Description of changes

## Testing Done
- [ ] Manual testing
- [ ] Automated tests updated
- [ ] Regression testing

## Prevention
How to prevent similar issues in the future.
            `}
            description="Template for documenting bug fixes"
            buttonText="Create Bug Fix Doc"
            contentType="business_rule"
          />

          <QuickStageButton
            title="API Documentation"
            content={`# API Endpoint: [Endpoint Name]

## Endpoint Details
- **Method**: GET/POST/PUT/DELETE
- **URL**: \`/api/v1/endpoint\`
- **Authentication**: Required/Optional

## Request Format
\`\`\`json
{
  "parameter1": "value1",
  "parameter2": "value2"
}
\`\`\`

## Response Format
\`\`\`json
{
  "status": "success",
  "data": {
    // response data
  }
}
\`\`\`

## Error Codes
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## Usage Examples
Code examples showing how to use this endpoint.
            `}
            description="Template for API endpoint documentation"
            buttonText="Create API Doc"
            contentType="api"
          />
        </div>
      </CardContent>
    </Card>
  );
};