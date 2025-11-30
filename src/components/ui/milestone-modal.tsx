import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MilestoneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  showConfetti?: boolean;
  className?: string;
}

export function MilestoneModal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  showConfetti = true,
  className,
}: MilestoneModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-md overflow-hidden",
          showConfetti && "relative",
          className
        )}
      >
        {showConfetti && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: `hsl(${Math.random() * 360}, 70%, 60%)`,
                  left: `${Math.random() * 100}%`,
                  top: `-10%`,
                }}
                animate={{
                  y: ["0vh", "110vh"],
                  x: [0, (Math.random() - 0.5) * 100],
                  rotate: [0, Math.random() * 360],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>
        )}

        <DialogHeader className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            }}
            className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
          >
            {icon || <Sparkles className="h-8 w-8 text-primary" />}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
            {description && (
              <DialogDescription className="mt-2 text-base">
                {description}
              </DialogDescription>
            )}
          </motion.div>
        </DialogHeader>

        {(primaryAction || secondaryAction) && (
          <DialogFooter className="flex-col sm:flex-col gap-2 mt-6">
            {primaryAction && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full"
              >
                <Button
                  onClick={primaryAction.onClick}
                  className="w-full"
                  size="lg"
                >
                  {primaryAction.label}
                </Button>
              </motion.div>
            )}
            {secondaryAction && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full"
              >
                <Button
                  onClick={secondaryAction.onClick}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {secondaryAction.label}
                </Button>
              </motion.div>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
