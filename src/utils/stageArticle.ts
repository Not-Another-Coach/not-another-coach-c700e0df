import { supabase } from '@/integrations/supabase/client';
import type { KBContentType } from '@/hooks/useKnowledgeBase';

interface StageArticleParams {
  title: string;
  content: string;
  excerpt?: string;
  contentType?: KBContentType;
  metadata?: Record<string, any>;
}

/**
 * Utility function to quickly create staged articles
 * Usage: await stageArticle({ title: "My Article", content: "Content here..." });
 */
export const stageArticle = async ({
  title,
  content,
  excerpt,
  contentType = 'business_rule',
  metadata = {}
}: StageArticleParams) => {
  // Generate slug from title
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  const article = {
    title,
    slug,
    content,
    excerpt,
    content_type: contentType,
    status: 'staging' as const,
    featured: false,
    metadata: {
      ...metadata,
      staged_at: new Date().toISOString(),
      requires_review: true
    }
  };

  const { data, error } = await supabase
    .from('kb_articles')
    .insert(article)
    .select()
    .single();
  
  if (error) {
    console.error('Failed to stage article:', error);
    throw error;
  }
  
  console.log(`Article "${title}" staged successfully for review`);
  return data;
};

/**
 * Common staging templates for quick use
 */
export const stagingTemplates = {
  featureDoc: (featureName: string, description: string) => stageArticle({
    title: `Feature: ${featureName}`,
    content: `# Feature: ${featureName}

## Overview
${description}

## User Story
As a [user type], I want [goal] so that [benefit].

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Implementation Notes
[Technical details]

## Related Components
[List affected files/components]
    `,
    excerpt: description,
    contentType: 'feature' as const,
    metadata: { type: 'feature_documentation' }
  }),

  bugFix: (issueDescription: string, solution: string) => stageArticle({
    title: `Bug Fix: ${issueDescription}`,
    content: `# Bug Fix: ${issueDescription}

## Problem Statement
${issueDescription}

## Solution Implemented
${solution}

## Files Changed
- [List files and changes]

## Testing Done
- [ ] Manual testing completed
- [ ] Automated tests updated
- [ ] Regression testing passed
    `,
    excerpt: `Fix for: ${issueDescription}`,
    contentType: 'business_rule' as const,
    metadata: { type: 'bug_fix_documentation' }
  }),

  businessRule: (ruleName: string, description: string) => stageArticle({
    title: `Business Rule: ${ruleName}`,
    content: `# Business Rule: ${ruleName}

## Description
${description}

## When This Applies
[Conditions and triggers]

## Implementation
[How this is enforced in the system]

## Edge Cases
[Special considerations]

## Related Features
[Connected functionality]
    `,
    excerpt: description,
    contentType: 'business_rule' as const,
    metadata: { type: 'business_rule_documentation' }
  })
};

// Example usage:
// await stageArticle({ 
//   title: "Coach Decline Process Updates", 
//   content: "Updated process for handling coach declines..." 
// });
//
// await stagingTemplates.featureDoc("User Profile Edit", "Allows users to edit their profile information");
// await stagingTemplates.bugFix("Login redirect issue", "Fixed redirect loop on login page");
// await stagingTemplates.businessRule("Password Requirements", "Users must have strong passwords");