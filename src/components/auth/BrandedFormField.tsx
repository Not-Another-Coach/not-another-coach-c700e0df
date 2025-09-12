import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandedFormFieldProps {
  id: string;
  name: string;
  type: 'email' | 'password' | 'text';
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
  error?: string;
}

export const BrandedFormField: React.FC<BrandedFormFieldProps> = ({
  id,
  name,
  type,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  className,
  error
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4 text-muted-foreground" />;
      case 'password':
        return <Lock className="h-4 w-4 text-muted-foreground" />;
      case 'text':
        return <User className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const baseInputClasses = cn(
    "pl-10 rounded-lg border-2 transition-all duration-200",
    "focus:border-primary focus:ring-2 focus:ring-primary/20",
    "hover:border-primary/50",
    isFocused && "border-primary shadow-primary/20 shadow-md",
    error && "border-error focus:border-error focus:ring-error/20",
    className
  );

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={id} 
        className={cn(
          "text-sm font-medium transition-colors",
          isFocused && "text-primary",
          error && "text-error"
        )}
      >
        {label}
      </Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          {getIcon()}
        </div>
        {type === 'password' ? (
          <PasswordInput
            id={id}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required={required}
            className={baseInputClasses}
          />
        ) : (
          <Input
            id={id}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required={required}
            className={baseInputClasses}
          />
        )}
      </div>
      {error && (
        <p className="text-sm text-error animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};