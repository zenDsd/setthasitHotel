import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none shadow-sm cursor-pointer"
    
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-blue-500/20",
      destructive: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-red-500/20",
      outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 shadow-none",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 shadow-none",
      ghost: "hover:bg-slate-100 hover:text-slate-900 shadow-none",
      link: "text-blue-600 underline-offset-4 hover:underline shadow-none",
      success: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-500/20",
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3 text-xs",
      lg: "h-11 rounded-xl px-6 text-base font-semibold",
      icon: "h-10 w-10 p-0",
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

