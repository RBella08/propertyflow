import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground border-transparent',

        secondary: 'bg-secondary text-secondary-foreground border-transparent',

        outline: 'border-border bg-background text-foreground',

        destructive: 'bg-destructive text-destructive-foreground border-transparent',

        success: 'bg-success text-white border-transparent',

        warning: 'bg-warning text-black border-transparent',

        info: 'bg-info text-white border-transparent',

        ghost: 'bg-transparent text-foreground hover:bg-muted',

        link: 'border-none bg-transparent p-0 text-primary underline-offset-4 hover:underline',
      },
    },

    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'span';

    return <Comp ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />;
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
