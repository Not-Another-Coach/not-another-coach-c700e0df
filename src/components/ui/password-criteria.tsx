import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordCriteriaProps {
  password: string
  className?: string
}

const PasswordCriteria = ({ password, className }: PasswordCriteriaProps) => {
  const criteria = [
    {
      label: "At least 6 characters",
      met: password.length >= 6
    },
    {
      label: "Contains uppercase letter",
      met: /[A-Z]/.test(password)
    },
    {
      label: "Contains lowercase letter", 
      met: /[a-z]/.test(password)
    },
    {
      label: "Contains number",
      met: /\d/.test(password)
    }
  ]

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-muted-foreground">Password requirements:</p>
      <ul className="space-y-1">
        {criteria.map((criterion, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            {criterion.met ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={cn(
              criterion.met ? "text-green-600" : "text-muted-foreground"
            )}>
              {criterion.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export { PasswordCriteria }