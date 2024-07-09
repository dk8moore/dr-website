import * as React from "react"
import { cn } from "@/lib/utils"

/** From shadcn.ui but edited to provide additional functionalities: shake on demand, error*/
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
  isShaking?: boolean;
  onAnimationEnd?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, isError, isShaking, onAnimationEnd, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isError && "border-[hsl(var(--error))]",
          isShaking && "animate-shake",
          className
        )}
        ref={ref}
        onAnimationEnd={onAnimationEnd}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }