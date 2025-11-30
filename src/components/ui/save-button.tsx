import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SaveButtonState = "idle" | "saving" | "saved" | "error";

interface SaveButtonProps extends Omit<ButtonProps, "onClick"> {
  onSave: () => Promise<void>;
  idleText?: string;
  savingText?: string;
  savedText?: string;
  state?: SaveButtonState;
  onStateChange?: (state: SaveButtonState) => void;
}

export const SaveButton = React.forwardRef<HTMLButtonElement, SaveButtonProps>(
  (
    {
      onSave,
      idleText = "Save",
      savingText = "Saving...",
      savedText = "Saved",
      state: controlledState,
      onStateChange,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [internalState, setInternalState] = React.useState<SaveButtonState>("idle");
    const isControlled = controlledState !== undefined;
    const state = isControlled ? controlledState : internalState;

    const updateState = React.useCallback(
      (newState: SaveButtonState) => {
        if (!isControlled) {
          setInternalState(newState);
        }
        onStateChange?.(newState);
      },
      [isControlled, onStateChange]
    );

    const handleClick = async () => {
      if (state === "saving") return;

      updateState("saving");

      try {
        await onSave();
        updateState("saved");

        // Auto-revert to idle after 2 seconds
        setTimeout(() => {
          updateState("idle");
        }, 2000);
      } catch (error) {
        updateState("error");
        // Auto-revert to idle after 3 seconds on error
        setTimeout(() => {
          updateState("idle");
        }, 3000);
      }
    };

    const buttonText = {
      idle: idleText,
      saving: savingText,
      saved: savedText,
      error: "Failed",
    }[state];

    const isDisabled = disabled || state === "saving";

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        disabled={isDisabled}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          state === "saved" && "bg-green-600 hover:bg-green-600",
          state === "error" && "bg-destructive hover:bg-destructive",
          className
        )}
        {...props}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={state}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            {state === "saving" && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {state === "saved" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Check className="h-4 w-4" />
              </motion.div>
            )}
            {buttonText}
          </motion.span>
        </AnimatePresence>
      </Button>
    );
  }
);

SaveButton.displayName = "SaveButton";
