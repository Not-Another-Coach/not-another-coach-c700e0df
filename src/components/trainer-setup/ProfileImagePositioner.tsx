import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Move, RotateCcw, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface ProfileImagePositionerProps {
  imageUrl: string;
  onPositionChange: (position: { x: number; y: number; scale: number }) => void;
  position?: { x: number; y: number; scale: number };
  previewSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const ProfileImagePositioner = ({ 
  imageUrl, 
  onPositionChange, 
  position = { x: 50, y: 50, scale: 1 },
  previewSize = '2xl'
}: ProfileImagePositionerProps) => {
  const [currentPosition, setCurrentPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, imgX: 0, imgY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Map sizes to pixel values for consistent container sizing
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32'
  };
  
  // Use a larger preview container (3x the actual size) for better precision
  const previewContainerSize = previewSize === 'sm' ? 'w-24 h-24' :
                              previewSize === 'md' ? 'w-36 h-36' :
                              previewSize === 'lg' ? 'w-48 h-48' :
                              previewSize === 'xl' ? 'w-72 h-72' :
                              'w-96 h-96';

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      imgX: currentPosition.x,
      imgY: currentPosition.y
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // Convert pixel movement to percentage based on container size
    const percentX = (deltaX / rect.width) * 100;
    const percentY = (deltaY / rect.height) * 100;

    const newPosition = {
      ...currentPosition,
      x: Math.max(-50, Math.min(150, dragStart.imgX + percentX)),
      y: Math.max(-50, Math.min(150, dragStart.imgY + percentY))
    };

    setCurrentPosition(newPosition);
  }, [isDragging, dragStart, currentPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(5, currentPosition.scale + delta));
    setCurrentPosition(prev => ({ ...prev, scale: newScale }));
  };

  const handleScaleChange = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(5, currentPosition.scale + delta));
    setCurrentPosition(prev => ({ ...prev, scale: newScale }));
  };

  const handleReset = () => {
    const resetPosition = { x: 50, y: 50, scale: 1 };
    setCurrentPosition(resetPosition);
  };

  const handleSave = () => {
    onPositionChange(currentPosition);
    setIsOpen(false);
  };

  // Global mouse event handlers
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Update current position when prop changes
  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Move className="h-4 w-4 mr-2" />
          Position Image
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Position Your Profile Photo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview Container */}
          <div className="relative">
            <div 
              ref={containerRef}
              className={`${previewContainerSize} mx-auto rounded-full border-4 border-primary/20 overflow-hidden bg-muted relative select-none`}
              onMouseDown={handleMouseDown}
              onWheel={handleWheel}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Profile preview"
                className="absolute pointer-events-none select-none"
                style={{
                  width: `${currentPosition.scale * 100}%`,
                  height: `${currentPosition.scale * 100}%`,
                  left: `${currentPosition.x}%`,
                  top: `${currentPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  objectFit: 'cover',
                  imageRendering: 'auto'
                }}
                draggable={false}
              />
              
              {/* Grid overlay for better positioning */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="w-full h-full grid grid-cols-3 grid-rows-3 border border-white/30">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-white/30"></div>
                  ))}
                </div>
              </div>
              
              {/* Center crosshair */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-2 h-2 bg-white rounded-full shadow-lg border border-primary"></div>
              </div>
            </div>
            
            <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-4">
              <span>Drag to reposition</span>
              <span>•</span>
              <span>Scroll to zoom</span>
            </p>
          </div>

          {/* Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Zoom Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Zoom Level</span>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleScaleChange(-0.2)}
                    disabled={currentPosition.scale <= 0.5}
                    className="p-2"
                  >
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                  <span className="px-3 py-1 text-sm bg-muted rounded min-w-16 text-center font-mono">
                    {Math.round(currentPosition.scale * 100)}%
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleScaleChange(0.2)}
                    disabled={currentPosition.scale >= 5}
                    className="p-2"
                  >
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={handleReset} className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPosition(prev => ({ ...prev, x: 50, y: 50 }))}
                  className="flex-1"
                >
                  Center
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              Save Position
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};