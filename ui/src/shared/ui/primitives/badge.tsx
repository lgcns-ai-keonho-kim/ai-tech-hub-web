/**
 * 목적: 공통 badge 프리미티브를 제공한다.
 * 설명: 상태, 강조, attention 표시처럼 짧은 메타 정보를 일관된 시각 규칙으로 렌더링한다.
 * 적용 패턴: 프리미티브 컴포넌트 패턴
 * 참조: ui/src/shared/ui/primitives/button.tsx, ui/src/widgets/app-shell/ui/sidebar-frame.tsx
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/shared/lib/cn";

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border border-transparent px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-invalid:border-destructive aria-invalid:ring-destructive [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-accent",
        destructive:
          "border-destructive bg-background text-destructive [a]:hover:bg-destructive/10",
        attention:
          "bg-destructive text-destructive-foreground [a]:hover:bg-destructive/90",
        outline:
          "border-border bg-background text-foreground [a]:hover:bg-accent [a]:hover:text-foreground",
        ghost:
          "hover:bg-accent hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
