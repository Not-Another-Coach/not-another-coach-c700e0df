import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface IconButtonProps extends Omit<ButtonProps, "children"> {
  label: string; // Accessible name (required)
  icon: React.ReactNode;
  showLabelVisually?: boolean; // default false
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, icon, showLabelVisually = false, variant = "ghost", size = "icon", className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        aria-label={label}
        title={label}
        variant={variant}
        size={size}
        className={className}
        {...props}
      >
        {icon}
        {showLabelVisually && (
          <span className="ml-2 text-sm">{label}</span>
        )}
      </Button>
    );
  }
);
IconButton.displayName = "IconButton";

export default IconButton;
