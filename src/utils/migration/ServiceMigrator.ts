/**
 * Service Migrator
 * 
 * Utility to help migrate components from direct Supabase calls to service layer.
 * Provides analysis and migration helpers.
 */

import { RequestLogger } from '@/services/monitoring/RequestLogger';
import { PerformanceTracker } from '@/services/monitoring/PerformanceTracker';

export interface MigrationReport {
  componentName: string;
  timestamp: number;
  directSupabaseCalls: number;
  migratedCalls: number;
  migrationProgress: number;
  recommendations: string[];
  potentialIssues: string[];
}

export class ServiceMigrator {
  /**
   * Analyze a component for direct Supabase usage
   * This is a helper for manual migration analysis
   */
  static analyzeComponent(componentCode: string, componentName: string): MigrationReport {
    const supabasePatterns = [
      /supabase\.from\(/g,
      /supabase\.auth\./g,
      /supabase\.storage\./g,
      /supabase\.rpc\(/g,
    ];

    let directCalls = 0;
    supabasePatterns.forEach(pattern => {
      const matches = componentCode.match(pattern);
      if (matches) {
        directCalls += matches.length;
      }
    });

    const servicePatterns = [
      /ProfileService\./g,
      /EngagementService\./g,
      /TrainerService\./g,
    ];

    let migratedCalls = 0;
    servicePatterns.forEach(pattern => {
      const matches = componentCode.match(pattern);
      if (matches) {
        migratedCalls += matches.length;
      }
    });

    const totalCalls = directCalls + migratedCalls;
    const migrationProgress = totalCalls > 0 ? (migratedCalls / totalCalls) * 100 : 100;

    const recommendations: string[] = [];
    const potentialIssues: string[] = [];

    if (directCalls > 0) {
      recommendations.push(`Found ${directCalls} direct Supabase calls that should be migrated to services`);
    }

    if (componentCode.includes('supabase.from(')) {
      recommendations.push('Consider using TrainerService or EngagementService for database queries');
    }

    if (componentCode.includes('supabase.auth.')) {
      recommendations.push('Consider using ProfileService for authentication operations');
    }

    if (componentCode.includes('supabase.storage.')) {
      recommendations.push('Consider using ProfileService.uploadProfilePhoto() for file uploads');
    }

    if (componentCode.includes('.catch(') && !componentCode.includes('ServiceError')) {
      potentialIssues.push('Error handling may not be using ServiceError - consider using service layer');
    }

    if (migrationProgress === 100 && migratedCalls > 0) {
      recommendations.push('✅ Component fully migrated to service layer!');
    }

    return {
      componentName,
      timestamp: Date.now(),
      directSupabaseCalls: directCalls,
      migratedCalls,
      migrationProgress,
      recommendations,
      potentialIssues,
    };
  }

  /**
   * Print migration report to console
   */
  static printReport(report: MigrationReport): void {
    console.group(`🔄 Migration Report: ${report.componentName}`);
    console.log(`Direct Supabase Calls: ${report.directSupabaseCalls}`);
    console.log(`Migrated to Services: ${report.migratedCalls}`);
    console.log(`Migration Progress: ${report.migrationProgress.toFixed(1)}%`);
    
    if (report.recommendations.length > 0) {
      console.log('\n📋 Recommendations:');
      report.recommendations.forEach(r => console.log(`  • ${r}`));
    }
    
    if (report.potentialIssues.length > 0) {
      console.warn('\n⚠️  Potential Issues:');
      report.potentialIssues.forEach(i => console.warn(`  • ${i}`));
    }
    
    console.groupEnd();
  }

  /**
   * Get migration priority for components
   * Higher priority = more direct Supabase calls
   */
  static getMigrationPriority(reports: MigrationReport[]): MigrationReport[] {
    return reports
      .filter(r => r.directSupabaseCalls > 0)
      .sort((a, b) => b.directSupabaseCalls - a.directSupabaseCalls);
  }

  /**
   * Generate migration checklist
   */
  static generateChecklist(componentName: string, directCalls: number): string[] {
    const checklist = [
      `[ ] Identify all ${directCalls} direct Supabase calls in ${componentName}`,
      '[ ] Determine which service should handle each call (ProfileService, EngagementService, TrainerService)',
      '[ ] Check if required service methods exist, create new ones if needed',
      '[ ] Replace direct calls with service layer calls',
      '[ ] Update error handling to use ServiceError',
      '[ ] Test component functionality after migration',
      '[ ] Remove unused Supabase imports',
      '[ ] Add service imports',
      '[ ] Verify performance with PerformanceTracker',
      '[ ] Update component tests if they exist',
    ];

    return checklist;
  }

  /**
   * Get performance comparison before/after migration
   */
  static getPerformanceComparison(componentName: string): {
    before: any;
    after: any;
    improvement: string;
  } {
    const baseline = PerformanceTracker.getBaseline();
    const report = PerformanceTracker.getReport();

    const beforeAvg = baseline.averageDuration;
    const afterAvg = report.averageDuration;
    const improvementPercent = beforeAvg > 0 ? ((beforeAvg - afterAvg) / beforeAvg) * 100 : 0;

    return {
      before: {
        averageDuration: beforeAvg,
        slowQueries: baseline.slowQueryCount,
      },
      after: {
        averageDuration: afterAvg,
        slowQueries: report.slowestOperations.length,
      },
      improvement: improvementPercent > 0 
        ? `${improvementPercent.toFixed(1)}% faster`
        : `${Math.abs(improvementPercent).toFixed(1)}% slower`,
    };
  }

  /**
   * Migration best practices
   */
  static getBestPractices(): string[] {
    return [
      '1. Migrate high-traffic components first (DashboardSummary, MessagingPopup)',
      '2. Create service methods for reusable operations',
      '3. Use RequestLogger to track before/after metrics',
      '4. Test error handling thoroughly',
      '5. Leverage PerformanceTracker to identify regressions',
      '6. Update error boundaries to handle ServiceError',
      '7. Use TypeScript types from service layer',
      '8. Keep services focused on single responsibility',
      '9. Document complex service methods',
      '10. Add integration tests for new service methods',
    ];
  }

  /**
   * Print best practices to console
   */
  static printBestPractices(): void {
    console.group('📚 Service Migration Best Practices');
    this.getBestPractices().forEach(practice => {
      console.log(practice);
    });
    console.groupEnd();
  }
}
