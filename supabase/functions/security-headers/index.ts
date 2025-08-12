import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Security headers configuration
const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Referrer policy for privacy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // HSTS for HTTPS enforcement (1 year)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Permissions policy to control browser features
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
    "media-src 'self' data: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "block-all-mixed-content",
    "upgrade-insecure-requests"
  ].join('; ')
};

// Caching policies for different asset types
const CACHE_POLICIES = {
  // Static assets - long cache with immutable
  'js': 'public, max-age=31536000, immutable',
  'css': 'public, max-age=31536000, immutable',
  'woff': 'public, max-age=31536000, immutable',
  'woff2': 'public, max-age=31536000, immutable',
  'ttf': 'public, max-age=31536000, immutable',
  'otf': 'public, max-age=31536000, immutable',
  'ico': 'public, max-age=31536000, immutable',
  
  // Images - long cache but not immutable (might be updated)
  'jpg': 'public, max-age=86400',
  'jpeg': 'public, max-age=86400',
  'png': 'public, max-age=86400',
  'gif': 'public, max-age=86400',
  'webp': 'public, max-age=86400',
  'avif': 'public, max-age=86400',
  'svg': 'public, max-age=86400',
  
  // Documents - medium cache
  'pdf': 'public, max-age=3600',
  'doc': 'public, max-age=3600',
  'docx': 'public, max-age=3600',
  
  // HTML - no cache or short cache for dynamic content
  'html': 'no-cache',
  'htm': 'no-cache',
  
  // API responses - no cache by default
  'json': 'no-cache, no-store, must-revalidate',
  'xml': 'no-cache, no-store, must-revalidate'
};

// MIME type validation
const ALLOWED_MIME_TYPES = {
  // Images
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/gif': ['gif'],
  'image/webp': ['webp'],
  'image/avif': ['avif'],
  'image/svg+xml': ['svg'],
  
  // Documents
  'application/pdf': ['pdf'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'text/plain': ['txt'],
  
  // Archives
  'application/zip': ['zip'],
  'application/x-rar-compressed': ['rar'],
  
  // Video
  'video/mp4': ['mp4'],
  'video/webm': ['webm'],
  'video/quicktime': ['mov'],
  
  // Audio
  'audio/mpeg': ['mp3'],
  'audio/wav': ['wav'],
  'audio/ogg': ['ogg'],
  
  // Web assets
  'text/css': ['css'],
  'application/javascript': ['js'],
  'text/javascript': ['js'],
  'application/json': ['json'],
  'text/html': ['html', 'htm'],
  'application/xml': ['xml'],
  'text/xml': ['xml'],
  
  // Fonts
  'font/woff': ['woff'],
  'font/woff2': ['woff2'],
  'font/ttf': ['ttf'],
  'font/otf': ['otf'],
  'application/font-woff': ['woff'],
  'application/font-woff2': ['woff2']
};

class SecurityHeadersMiddleware {
  static getFileExtension(url: string): string {
    const pathname = new URL(url).pathname;
    const lastDot = pathname.lastIndexOf('.');
    return lastDot > -1 ? pathname.substring(lastDot + 1).toLowerCase() : '';
  }

  static getMimeType(extension: string): string {
    const mimeMap: Record<string, string> = {
      'html': 'text/html',
      'htm': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'xml': 'application/xml',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'avif': 'image/avif',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'zip': 'application/zip',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mov': 'video/quicktime',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'woff': 'font/woff',
      'woff2': 'font/woff2',
      'ttf': 'font/ttf',
      'otf': 'font/otf',
      'ico': 'image/x-icon'
    };
    
    return mimeMap[extension] || 'application/octet-stream';
  }

  static validateMimeType(mimeType: string, filename: string): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (!extension) return false;

    const allowedExtensions = ALLOWED_MIME_TYPES[mimeType];
    if (!allowedExtensions) return false;

    return allowedExtensions.includes(extension);
  }

  static getCachePolicy(url: string): string {
    const extension = this.getFileExtension(url);
    return CACHE_POLICIES[extension] || 'no-cache';
  }

  static addSecurityHeaders(response: Response, url: string): Response {
    const headers = new Headers(response.headers);
    
    // Add all security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      headers.set(key, value);
    });

    // Add caching policy based on file type
    const cachePolicy = this.getCachePolicy(url);
    headers.set('Cache-Control', cachePolicy);

    // Ensure correct MIME type
    const extension = this.getFileExtension(url);
    if (extension && !headers.get('Content-Type')) {
      const mimeType = this.getMimeType(extension);
      headers.set('Content-Type', mimeType);
    }

    // Add CORS headers for API endpoints
    if (url.includes('/api/') || url.includes('/functions/')) {
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  static createSecurityReport(): any {
    return {
      timestamp: new Date().toISOString(),
      security_headers: Object.keys(SECURITY_HEADERS),
      cache_policies: Object.keys(CACHE_POLICIES).length,
      allowed_mime_types: Object.keys(ALLOWED_MIME_TYPES).length,
      csp_directives: SECURITY_HEADERS['Content-Security-Policy'].split('; ').length,
      hsts_enabled: SECURITY_HEADERS['Strict-Transport-Security'].includes('max-age'),
      frame_protection: SECURITY_HEADERS['X-Frame-Options'] === 'DENY',
      content_type_protection: SECURITY_HEADERS['X-Content-Type-Options'] === 'nosniff'
    };
  }
}

class FileUploadValidator {
  static async validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 50MB limit' };
    }

    // Check MIME type
    if (!SecurityHeadersMiddleware.validateMimeType(file.type, file.name)) {
      return { 
        valid: false, 
        error: `Invalid file type. MIME type ${file.type} does not match file extension.` 
      };
    }

    // Check for dangerous file extensions
    const dangerousExtensions = [
      'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 'php', 'asp', 'aspx'
    ];
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension && dangerousExtensions.includes(extension)) {
      return { valid: false, error: 'File type not allowed for security reasons' };
    }

    // Additional validation for images
    if (file.type.startsWith('image/')) {
      try {
        // Create a bitmap to validate image structure
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: file.type });
        
        // This would trigger an error if the file is not a valid image
        const imageBitmap = await createImageBitmap(blob);
        imageBitmap.close(); // Clean up
        
      } catch (error) {
        return { valid: false, error: 'Invalid image file structure' };
      }
    }

    return { valid: true };
  }
}

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        ...SECURITY_HEADERS
      }
    });
  }

  try {
    // Handle security report endpoint
    if (url.pathname === '/security-report') {
      const report = SecurityHeadersMiddleware.createSecurityReport();
      return SecurityHeadersMiddleware.addSecurityHeaders(
        new Response(JSON.stringify(report, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        }),
        req.url
      );
    }

    // Handle file upload validation
    if (url.pathname === '/validate-upload' && req.method === 'POST') {
      try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
          return SecurityHeadersMiddleware.addSecurityHeaders(
            new Response(JSON.stringify({ error: 'No file provided' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            }),
            req.url
          );
        }

        const validation = await FileUploadValidator.validateFile(file);
        
        return SecurityHeadersMiddleware.addSecurityHeaders(
          new Response(JSON.stringify(validation), {
            status: validation.valid ? 200 : 400,
            headers: { 'Content-Type': 'application/json' }
          }),
          req.url
        );

      } catch (error) {
        return SecurityHeadersMiddleware.addSecurityHeaders(
          new Response(JSON.stringify({ 
            valid: false, 
            error: 'File validation failed: ' + error.message 
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }),
          req.url
        );
      }
    }

    // Handle MIME type validation endpoint
    if (url.pathname === '/validate-mime' && req.method === 'POST') {
      const { mimeType, filename } = await req.json();
      
      const isValid = SecurityHeadersMiddleware.validateMimeType(mimeType, filename);
      
      return SecurityHeadersMiddleware.addSecurityHeaders(
        new Response(JSON.stringify({ 
          valid: isValid,
          mimeType,
          filename,
          message: isValid ? 'MIME type is valid' : 'MIME type does not match file extension'
        }), {
          headers: { 'Content-Type': 'application/json' }
        }),
        req.url
      );
    }

    // Handle cache policy check
    if (url.pathname === '/cache-policy') {
      const targetUrl = url.searchParams.get('url');
      if (!targetUrl) {
        return SecurityHeadersMiddleware.addSecurityHeaders(
          new Response(JSON.stringify({ error: 'URL parameter required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }),
          req.url
        );
      }

      const extension = SecurityHeadersMiddleware.getFileExtension(targetUrl);
      const cachePolicy = SecurityHeadersMiddleware.getCachePolicy(targetUrl);
      const mimeType = SecurityHeadersMiddleware.getMimeType(extension);

      return SecurityHeadersMiddleware.addSecurityHeaders(
        new Response(JSON.stringify({
          url: targetUrl,
          extension,
          cachePolicy,
          mimeType
        }), {
          headers: { 'Content-Type': 'application/json' }
        }),
        req.url
      );
    }

    // Default response with security headers applied
    const defaultResponse = new Response(JSON.stringify({
      message: 'Security Headers Middleware Active',
      endpoints: {
        '/security-report': 'GET - View security configuration',
        '/validate-upload': 'POST - Validate file uploads',
        '/validate-mime': 'POST - Validate MIME types',
        '/cache-policy?url=<url>': 'GET - Check cache policy for URL'
      },
      security_features: {
        'security_headers': 'All requests include comprehensive security headers',
        'csp': 'Content Security Policy with frame-ancestors protection',
        'caching': 'Optimized caching policies for different asset types',
        'mime_validation': 'File upload MIME type validation',
        'file_size_limits': '50MB file size limit',
        'dangerous_file_protection': 'Blocks dangerous file extensions'
      }
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });

    return SecurityHeadersMiddleware.addSecurityHeaders(defaultResponse, req.url);

  } catch (error) {
    console.error('Security middleware error:', error);
    
    const errorResponse = new Response(JSON.stringify({ 
      error: 'Security middleware error: ' + error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });

    return SecurityHeadersMiddleware.addSecurityHeaders(errorResponse, req.url);
  }
};

serve(handler);