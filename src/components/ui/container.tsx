import * as React from "react"
import { cn } from "@/lib/utils"

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

const sizeClasses = {
  sm: "max-w-4xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-[1280px]",
  full: "max-w-[1600px]",
} as const

export function Container({ as: Tag = "div", size = "xl", className, children, ...props }: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full px-5 lg:px-8", sizeClasses[size], className)} {...props}>
      {children}
    </Tag>
  )
}
