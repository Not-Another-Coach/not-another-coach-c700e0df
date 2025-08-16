import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Activity } from 'lucide-react';

interface MemoryStats {
  usedJSMemory: number;
  totalJSMemory: number;
  jsMemoryLimit: number;
  performanceEntries: number;
}

export function MemoryMonitor() {
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const updateMemoryStats = () => {
      // @ts-ignore - Chrome specific API
      if (performance.memory) {
        // @ts-ignore
        const memory = performance.memory;
        const stats = {
          usedJSMemory: Math.round(memory.usedJSMemory / 1024 / 1024), // MB
          totalJSMemory: Math.round(memory.totalJSMemory / 1024 / 1024), // MB
          jsMemoryLimit: Math.round(memory.jsMemoryLimit / 1024 / 1024), // MB
          performanceEntries: performance.getEntries().length
        };
        
        setMemoryStats(stats);
        
        // Show warning if memory usage is high
        const memoryUsagePercent = (stats.usedJSMemory / stats.jsMemoryLimit) * 100;
        setShowWarning(memoryUsagePercent > 70);
      }
    };

    // Update immediately and then every 5 seconds
    updateMemoryStats();
    const interval = setInterval(updateMemoryStats, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!memoryStats) return null;

  const memoryUsagePercent = (memoryStats.usedJSMemory / memoryStats.jsMemoryLimit) * 100;

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
      
      <Card className="w-80 bg-background/95 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Memory Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>JS Memory:</span>
            <span>{memoryStats.usedJSMemory}MB / {memoryStats.totalJSMemory}MB</span>
          </div>
          <div className="flex justify-between">
            <span>Memory Limit:</span>
            <span>{memoryStats.jsMemoryLimit}MB</span>
          </div>
          <div className="flex justify-between">
            <span>Usage:</span>
            <span className={memoryUsagePercent > 70 ? 'text-destructive font-semibold' : ''}>
              {memoryUsagePercent.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Performance Entries:</span>
            <span>{memoryStats.performanceEntries}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-2">
            <div 
              className={`h-1.5 rounded-full transition-all ${
                memoryUsagePercent > 70 ? 'bg-destructive' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(memoryUsagePercent, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}