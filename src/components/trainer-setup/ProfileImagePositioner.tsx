import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Move, RotateCcw, Check } from 'lucide-react';

interface ProfileImagePositionerProps {
  imageUrl: string;
  onPositionChange: (position: { x: number; y: number; scale: number }) => void;
  position?: { x: number; y: number; scale: number };
}

export const ProfileImagePositioner = ({ 
  imageUrl, 
  onPositionChange, 
  position = { x: 50, y: 50, scale: 1 } 
}: ProfileImagePositionerProps) => {
  const [currentPosition, setCurrentPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPosition = {
      ...currentPosition,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };

    setCurrentPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleScaleChange = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(3, currentPosition.scale + delta));
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

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging]);

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
              className="w-48 h-48 mx-auto rounded-full border-4 border-muted overflow-hidden bg-muted cursor-crosshair relative"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Profile preview"
                className="absolute pointer-events-none select-none"
                style={{
                  width: `${currentPosition.scale * 100}%`,
                  height: `${currentPosition.scale * 100}%`,
                  left: `${currentPosition.x - (currentPosition.scale * 50)}%`,
                  top: `${currentPosition.y - (currentPosition.scale * 50)}%`,
                  transform: 'translate(-50%, -50%)',
                  objectFit: 'cover'
                }}
              />
              
              {/* Center crosshair */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-4 h-4 border-2 border-white rounded-full bg-primary/50"></div>
              </div>
            </div>
            
            <p className="text-xs text-center text-muted-foreground mt-2">
              Drag to reposition • Scroll to zoom
            </p>
          </div>

          {/* Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Adjustments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Zoom</span>
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleScaleChange(-0.1)}
                    disabled={currentPosition.scale <= 0.5}
                  >
                    -
                  </Button>
                  <span className="px-3 py-1 text-xs bg-muted rounded min-w-12 text-center">
                    {Math.round(currentPosition.scale * 100)}%
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleScaleChange(0.1)}
                    disabled={currentPosition.scale >= 3}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleReset} className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Position
              </Button>
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