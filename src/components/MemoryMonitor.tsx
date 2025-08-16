import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Activity, ChevronDown, ChevronUp } from 'lucide-react';

interface MemoryStats {
  usedJSMemory: number;
  totalJSMemory: number;
  jsMemoryLimit: number;
  performanceEntries: number;
  supportedMemoryAPI: boolean;
}

export function MemoryMonitor() {
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const updateMemoryStats = () => {
      const stats: MemoryStats = {
        usedJSMemory: 0,
        totalJSMemory: 0,
        jsMemoryLimit: 0,
        performanceEntries: performance.getEntries().length,
        supportedMemoryAPI: false
      };

      // Check if memory API is available (Chrome only)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        stats.usedJSMemory = Math.round(memory.usedJSMemory / 1024 / 1024); // MB
        stats.totalJSMemory = Math.round(memory.totalJSMemory / 1024 / 1024); // MB
        stats.jsMemoryLimit = Math.round(memory.jsMemoryLimit / 1024 / 1024); // MB
        stats.supportedMemoryAPI = true;
      } else {
        // Fallback: estimate memory usage from other metrics
        const entries = performance.getEntries();
        const resourceCount = entries.filter(e => e.entryType === 'resource').length;
        const navigationEntries = entries.filter(e => e.entryType === 'navigation');
        
        // Rough estimation based on resource count and navigation timing
        stats.usedJSMemory = Math.round(resourceCount * 0.5 + 50); // Rough estimate
        stats.totalJSMemory = Math.round(stats.usedJSMemory * 1.2);
        stats.jsMemoryLimit = 2048; // Default limit assumption
        stats.supportedMemoryAPI = false;
      }
      
      setMemoryStats(stats);
      
      // Show warning if memory usage is high
      const memoryUsagePercent = stats.jsMemoryLimit > 0 ? (stats.usedJSMemory / stats.jsMemoryLimit) * 100 : 0;
      setShowWarning(memoryUsagePercent > 70);
    };

    // Update immediately and then every 3 seconds
    updateMemoryStats();
    const interval = setInterval(updateMemoryStats, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!memoryStats) return null;

  const memoryUsagePercent = memoryStats.jsMemoryLimit > 0 ? 
    (memoryStats.usedJSMemory / memoryStats.jsMemoryLimit) * 100 : 0;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="bg-background/95 backdrop-blur border-2">
          <CardContent className="p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              <span className="text-xs font-mono">
                {memoryStats.usedJSMemory}MB ({memoryUsagePercent.toFixed(1)}%)
              </span>
              <ChevronUp className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {showWarning && (
        <Alert className="w-80 bg-destructive/10 border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            High memory usage detected ({memoryUsagePercent.toFixed(1)}%)
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="w-80 bg-background/95 backdrop-blur border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Memory Monitor
              {!memoryStats.supportedMemoryAPI && (
                <span className="text-xs text-muted-foreground">(Estimated)</span>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="h-6 w-6 p-0"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="flex justify-between">
            <span>JS Memory:</span>
            <span className="font-mono">{memoryStats.usedJSMemory}MB / {memoryStats.totalJSMemory}MB</span>
          </div>
          <div className="flex justify-between">
            <span>Memory Limit:</span>
            <span className="font-mono">{memoryStats.jsMemoryLimit}MB</span>
          </div>
          <div className="flex justify-between">
            <span>Usage:</span>
            <span className={`font-mono ${memoryUsagePercent > 70 ? 'text-destructive font-semibold' : ''}`}>
              {memoryUsagePercent.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Performance Entries:</span>
            <span className="font-mono">{memoryStats.performanceEntries}</span>
          </div>
          <div className="flex justify-between">
            <span>API Support:</span>
            <span className={`font-mono text-xs ${memoryStats.supportedMemoryAPI ? 'text-green-600' : 'text-yellow-600'}`}>
              {memoryStats.supportedMemoryAPI ? 'Native' : 'Fallback'}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                memoryUsagePercent > 70 ? 'bg-destructive' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(memoryUsagePercent, 100)}%` }}
            />
          </div>
          <div className="text-center text-muted-foreground text-xs pt-1">
            Updates every 3 seconds
          </div>
        </CardContent>
      </Card>
    </div>
  );
}