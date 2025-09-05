import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollableBreadcrumbProps {
  children: React.ReactNode;
  className?: string;
  currentStep?: number;
}

export const ScrollableBreadcrumb: React.FC<ScrollableBreadcrumbProps> = ({
  children,
  className,
  currentStep,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const checkScrollState = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    setShowControls(scrollWidth > clientWidth);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 200;
    const newScrollLeft = 
      direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  // Auto-scroll to current step
  useEffect(() => {
    if (!scrollContainerRef.current || !currentStep) return;

    const currentStepElement = scrollContainerRef.current.querySelector(`[data-step="${currentStep}"]`) as HTMLElement;
    if (!currentStepElement) return;

    const containerRect = scrollContainerRef.current.getBoundingClientRect();
    const elementRect = currentStepElement.getBoundingClientRect();
    
    // Check if element is fully visible
    const isVisible = 
      elementRect.left >= containerRect.left && 
      elementRect.right <= containerRect.right;

    if (!isVisible) {
      // Calculate scroll position to center the current step
      const elementLeft = currentStepElement.offsetLeft;
      const elementWidth = currentStepElement.offsetWidth;
      const containerWidth = scrollContainerRef.current.clientWidth;
      
      const targetScroll = elementLeft - (containerWidth / 2) + (elementWidth / 2);
      
      scrollContainerRef.current.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  }, [currentStep]);

  useEffect(() => {
    checkScrollState();
    
    const handleScroll = () => checkScrollState();
    const handleResize = () => {
      checkScrollState();
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return (
    <div className={cn("relative", className)}>
      {showControls && (
        <>
          {canScrollLeft && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm shadow-sm pointer-events-auto"
              onClick={() => scroll('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          
          {canScrollRight && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm shadow-sm pointer-events-auto"
              onClick={() => scroll('right')}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
      
      <div
        ref={scrollContainerRef}
        className={cn(
          "overflow-x-auto scrollbar-hide pb-2 relative z-0",
          showControls && "px-8"
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};