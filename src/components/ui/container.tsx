import * as React from "react"
import { cn } from "@/lib/utils"

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType
  size?: "sm" | "md" | "lg" | "xl" | "landing" | "full"
}

const sizeClasses = {
  sm: "max-w-4xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-[1280px]",
  landing: "landing-container",
  full: "max-w-[1600px]",
} as const

export function Container({ as: Tag = "div", size = "xl", className, children, ...props }: ContainerProps) {
  // The landing container owns its own inline padding (clamp 24px–48px),
  // so the fixed utility padding must not be applied alongside it.
  const padding = size === "landing" ? "" : "px-5 lg:px-8"
  return (
    <Tag className={cn("mx-auto w-full", padding, sizeClasses[size], className)} {...props}>
      {children}
    </Tag>
  )
}
