import * as React from "react";
import { Select as SelectPrimitive, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Label } from "./label";
import { cn } from "../../lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  "data-testid"?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  defaultValue,
  onValueChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  error,
  required = false,
  "data-testid": dataTestId,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={cn("text-sm font-medium", error && "text-destructive")}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <SelectPrimitive value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger 
          data-testid={dataTestId}
          className={cn(error && "border-destructive focus:ring-destructive")}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectPrimitive>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};
