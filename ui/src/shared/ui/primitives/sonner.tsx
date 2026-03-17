"use client"

import type { CSSProperties } from "react"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { AlertCircle, CheckCircle2, Info, LoaderCircle, XCircle } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CheckCircle2 strokeWidth={1.5} />
        ),
        info: (
          <Info strokeWidth={1.5} />
        ),
        warning: (
          <AlertCircle strokeWidth={1.5} />
        ),
        error: (
          <XCircle strokeWidth={1.5} />
        ),
        loading: (
          <LoaderCircle strokeWidth={1.5} className="animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
