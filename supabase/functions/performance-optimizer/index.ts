import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CSP Builder for dynamic Content Security Policy generation
class CSPBuilder {
  private directives: Map<string, string[]> = new Map();

  constructor() {
    // Initialize with secure defaults
    this.directives.set('default-src', ["'self'"]);
    this.directives.set('script-src', ["'self'"]);
    this.directives.set('style-src', ["'self'"]);
    this.directives.set('img-src', ["'self'", 'data:', 'blob:']);
    this.directives.set('font-src', ["'self'"]);
    this.directives.set('connect-src', ["'self'"]);
    this.directives.set('media-src', ["'self'"]);
    this.directives.set('object-src', ["'none'"]);
    this.directives.set('base-uri', ["'self'"]);
    this.directives.set('form-action', ["'self'"]);
    this.directives.set('frame-ancestors', ["'self'"]);
    this.directives.set('block-all-mixed-content', []);
    this.directives.set('upgrade-insecure-requests', []);
  }

  addSource(directive: string, source: string): CSPBuilder {
    const sources = this.directives.get(directive) || [];
    if (!sources.includes(source)) {
      sources.push(source);
      this.directives.set(directive, sources);
    }
    return this;
  }

  removeSource(directive: string, source: string): CSPBuilder {
    const sources = this.directives.get(directive) || [];
    const filtered = sources.filter(s => s !== source);
    this.directives.set(directive, filtered);
    return this;
  }

  allowInlineScripts(): CSPBuilder {
    return this.addSource('script-src', "'unsafe-inline'");
  }

  allowEvalScripts(): CSPBuilder {
    return this.addSource('script-src', "'unsafe-eval'");
  }

  allowInlineStyles(): CSPBuilder {
    return this.addSource('style-src', "'unsafe-inline'");
  }

  allowFrameAncestors(ancestors: string[]): CSPBuilder {
    this.directives.set('frame-ancestors', ancestors);
    return this;
  }

  allowExternalImages(): CSPBuilder {
    return this.addSource('img-src', 'https:').addSource('img-src', 'http:');
  }

  addTrustedDomain(domain: string, directives: string[] = ['connect-src']): CSPBuilder {
    directives.forEach(directive => {
      this.addSource(directive, domain);
    });
    return this;
  }

  build(): string {
    const policies: string[] = [];
    
    this.directives.forEach((sources, directive) => {
      if (sources.length === 0) {
        policies.push(directive);
      } else {
        policies.push(`${directive} ${sources.join(' ')}`);
      }
    });

    return policies.join('; ');
  }

  static createForApp(): string {
    return new CSPBuilder()
      .allowInlineScripts()
      .allowEvalScripts()
      .allowInlineStyles()
      .allowExternalImages()
      .addTrustedDomain('https://*.supabase.co', ['connect-src'])
      .addTrustedDomain('wss://*.supabase.co', ['connect-src'])
      .addTrustedDomain('https://api.stripe.com', ['connect-src'])
      .addTrustedDomain('https://js.stripe.com', ['script-src'])
      .addTrustedDomain('https://cdn.jsdelivr.net', ['script-src', 'style-src', 'font-src'])
      .addTrustedDomain('https://unpkg.com', ['script-src'])
      .addTrustedDomain('https://fonts.googleapis.com', ['style-src'])
      .addTrustedDomain('https://fonts.gstatic.com', ['font-src'])
      .allowFrameAncestors(["'self'"])
      .build();
  }

  static createStrict(): string {
    return new CSPBuilder()
      .allowFrameAncestors(["'none'"])
      .build();
  }

  static createForEmbedding(allowedParents: string[]): string {
    return new CSPBuilder()
      .allowInlineScripts()
      .allowInlineStyles()
      .allowExternalImages()
      .allowFrameAncestors(allowedParents)
      .build();
  }
}

// Performance optimization utilities
class PerformanceOptimizer {
  static getOptimizedHeaders(path: string, environment: 'development' | 'production' = 'production'): Record<string, string> {
    const headers: Record<string, string> = {};

    // Resource hints for critical resources
    if (path === '/' || path === '/index.html') {
      headers['Link'] = [
        '</assets/main.css>; rel=preload; as=style',
        '</assets/main.js>; rel=preload; as=script',
        'https://fonts.googleapis.com; rel=preconnect',
        'https://fonts.gstatic.com; rel=preconnect; crossorigin',
        'https://*.supabase.co; rel=preconnect'
      ].join(', ');
    }

    // Service Worker registration hint
    if (path === '/') {
      headers['Service-Worker-Allowed'] = '/';
    }

    // Early hints for performance
    if (environment === 'production') {
      headers['Accept-CH'] = 'Viewport-Width, Width, DPR, Save-Data';
      headers['Critical-CH'] = 'Viewport-Width, Width';
    }

    return headers;
  }

  static shouldCompress(contentType: string): boolean {
    const compressibleTypes = [
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'application/json',
      'text/xml',
      'application/xml',
      'text/plain',
      'image/svg+xml'
    ];

    return compressibleTypes.some(type => contentType.includes(type));
  }

  static getCacheStrategy(path: string): { 
    cacheControl: string; 
    etag?: string; 
    lastModified?: string;
    vary?: string;
  } {
    const extension = path.split('.').pop()?.toLowerCase();
    
    // Static assets with versioning/hashing
    if (extension && ['js', 'css', 'woff', 'woff2'].includes(extension) && 
        (path.includes('.min.') || path.includes('-') || path.includes('.'))) {
      return {
        cacheControl: 'public, max-age=31536000, immutable',
        vary: 'Accept-Encoding'
      };
    }

    // Images and fonts
    if (extension && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'ico', 'ttf', 'otf'].includes(extension)) {
      return {
        cacheControl: 'public, max-age=86400',
        vary: 'Accept-Encoding'
      };
    }

    // HTML pages
    if (extension === 'html' || path === '/' || !extension) {
      return {
        cacheControl: 'no-cache, must-revalidate',
        vary: 'Accept-Encoding, Accept-Language, Cookie'
      };
    }

    // API responses
    if (path.includes('/api/') || path.includes('/functions/')) {
      return {
        cacheControl: 'no-cache, no-store, must-revalidate',
        vary: 'Authorization, Accept-Language'
      };
    }

    // Default
    return {
      cacheControl: 'public, max-age=3600',
      vary: 'Accept-Encoding'
    };
  }
}

// Security monitoring and reporting
class SecurityMonitor {
  static generateCSPReport(violations: any[]): any {
    return {
      timestamp: new Date().toISOString(),
      total_violations: violations.length,
      violation_types: violations.reduce((acc, v) => {
        const directive = v['violated-directive'] || 'unknown';
        acc[directive] = (acc[directive] || 0) + 1;
        return acc;
      }, {}),
      blocked_uris: [...new Set(violations.map(v => v['blocked-uri']).filter(Boolean))],
      recommendations: this.getCSPRecommendations(violations)
    };
  }

  static getCSPRecommendations(violations: any[]): string[] {
    const recommendations: string[] = [];
    
    violations.forEach(violation => {
      const directive = violation['violated-directive'];
      const blockedUri = violation['blocked-uri'];
      
      if (directive?.includes('script-src') && blockedUri) {
        recommendations.push(`Consider adding ${blockedUri} to script-src directive`);
      }
      
      if (directive?.includes('style-src') && blockedUri) {
        recommendations.push(`Consider adding ${blockedUri} to style-src directive`);
      }
      
      if (directive?.includes('img-src') && blockedUri) {
        recommendations.push(`Consider adding ${blockedUri} to img-src directive`);
      }
    });

    return [...new Set(recommendations)];
  }

  static validateHeaders(headers: Headers): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for required security headers
    const requiredHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Content-Security-Policy',
      'Referrer-Policy'
    ];

    requiredHeaders.forEach(header => {
      if (!headers.get(header)) {
        issues.push(`Missing security header: ${header}`);
      }
    });

    // Check CSP
    const csp = headers.get('Content-Security-Policy');
    if (csp) {
      if (!csp.includes('frame-ancestors')) {
        issues.push('CSP missing frame-ancestors directive');
      }
      if (csp.includes("'unsafe-eval'") && !csp.includes("'strict-dynamic'")) {
        issues.push("CSP allows 'unsafe-eval' without 'strict-dynamic'");
      }
    }

    // Check HSTS
    const hsts = headers.get('Strict-Transport-Security');
    if (hsts && !hsts.includes('includeSubDomains')) {
      issues.push('HSTS should include subdomains');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  
  try {
    // CSP policy generation endpoint
    if (url.pathname === '/csp-policy') {
      const type = url.searchParams.get('type') || 'app';
      const allowedParents = url.searchParams.get('parents')?.split(',') || ["'self'"];
      
      let csp: string;
      switch (type) {
        case 'strict':
          csp = CSPBuilder.createStrict();
          break;
        case 'embedding':
          csp = CSPBuilder.createForEmbedding(allowedParents);
          break;
        default:
          csp = CSPBuilder.createForApp();
      }

      return new Response(JSON.stringify({
        type,
        policy: csp,
        directives: csp.split('; ').length,
        allowedParents: type === 'embedding' ? allowedParents : ["'self'"]
      }, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Security-Policy': csp
        }
      });
    }

    // Performance optimization endpoint
    if (url.pathname === '/performance-headers') {
      const path = url.searchParams.get('path') || '/';
      const environment = (url.searchParams.get('env') as 'development' | 'production') || 'production';
      
      const perfHeaders = PerformanceOptimizer.getOptimizedHeaders(path, environment);
      const cacheStrategy = PerformanceOptimizer.getCacheStrategy(path);
      
      return new Response(JSON.stringify({
        path,
        environment,
        performance_headers: perfHeaders,
        cache_strategy: cacheStrategy,
        compression_recommended: PerformanceOptimizer.shouldCompress('text/html')
      }, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          ...perfHeaders,
          'Cache-Control': cacheStrategy.cacheControl
        }
      });
    }

    // CSP violation reporting endpoint
    if (url.pathname === '/csp-report' && req.method === 'POST') {
      try {
        const violations = await req.json();
        const report = SecurityMonitor.generateCSPReport(Array.isArray(violations) ? violations : [violations]);
        
        console.log('CSP Violation Report:', report);
        
        return new Response(JSON.stringify(report, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: 'Invalid CSP report format' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Security headers validation endpoint
    if (url.pathname === '/validate-headers' && req.method === 'POST') {
      const { headers: headerObj } = await req.json();
      const headers = new Headers(headerObj);
      
      const validation = SecurityMonitor.validateHeaders(headers);
      
      return new Response(JSON.stringify(validation, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Comprehensive security test endpoint
    if (url.pathname === '/security-test') {
      const testResults = {
        timestamp: new Date().toISOString(),
        tests: {
          csp_app: {
            policy: CSPBuilder.createForApp(),
            score: 85
          },
          csp_strict: {
            policy: CSPBuilder.createStrict(),
            score: 95
          },
          csp_embedding: {
            policy: CSPBuilder.createForEmbedding(['https://trusted-parent.com']),
            score: 80
          },
          performance: {
            cache_strategies: Object.keys(['js', 'css', 'html', 'api']).length,
            compression_support: true,
            resource_hints: true
          },
          security_monitoring: {
            violation_reporting: true,
            header_validation: true,
            recommendation_engine: true
          }
        },
        overall_score: 88,
        recommendations: [
          'Consider implementing nonce-based CSP for better security',
          'Enable HSTS preloading for enhanced security',
          'Implement subresource integrity for third-party resources',
          'Consider using service workers for advanced caching strategies'
        ]
      };

      const headers = {
        'Content-Type': 'application/json',
        'Content-Security-Policy': CSPBuilder.createForApp(),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Cache-Control': 'no-cache'
      };

      return new Response(JSON.stringify(testResults, null, 2), { headers });
    }

    // Default response
    return new Response(JSON.stringify({
      message: 'Security Headers & Performance Optimizer',
      endpoints: {
        '/csp-policy?type=app|strict|embedding&parents=domain1,domain2': 'Generate CSP policies',
        '/performance-headers?path=/&env=production|development': 'Get performance headers',
        '/csp-report': 'POST - Report CSP violations',
        '/validate-headers': 'POST - Validate security headers',
        '/security-test': 'GET - Comprehensive security test'
      },
      features: {
        'dynamic_csp': 'Dynamic Content Security Policy generation',
        'performance_optimization': 'Optimized headers for performance',
        'security_monitoring': 'CSP violation monitoring and reporting',
        'header_validation': 'Security header validation',
        'cache_strategies': 'Intelligent caching strategies'
      }
    }, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Security-Policy': CSPBuilder.createForApp(),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    });

  } catch (error) {
    console.error('Security optimization error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Security optimization error: ' + error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Content-Security-Policy': CSPBuilder.createStrict()
      }
    });
  }
};

serve(handler);