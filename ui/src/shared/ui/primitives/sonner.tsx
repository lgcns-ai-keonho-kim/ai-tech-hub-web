"use client"

import type { CSSProperties } from "react"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle"
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2"
import Info from "lucide-react/dist/esm/icons/info"
import LoaderCircle from "lucide-react/dist/esm/icons/loader-circle"
import XCircle from "lucide-react/dist/esm/icons/x-circle"

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
