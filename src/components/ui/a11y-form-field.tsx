import * as React from "react";
import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";

interface A11yFormFieldProps {
  id: string; // required for label association
  name: string; // required for form submission
  label: string;
  hint?: string;
  children: (fieldProps: { id: string; name: string; "aria-describedby"?: string }) => React.ReactNode;
}

export const A11yFormField: React.FC<A11yFormFieldProps> = ({ id, name, label, hint, children }) => {
  const describedById = hint ? `${id}-hint` : undefined;

  return (
    <FormItem>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <FormControl>
        {/* Enforce id/name and link to description when provided */}
        {children({ id, name, ...(describedById ? { "aria-describedby": describedById } : {}) })}
      </FormControl>
      {hint && (
        <FormDescription id={describedById}>{hint}</FormDescription>
      )}
      <FormMessage />
    </FormItem>
  );
};

export default A11yFormField;
