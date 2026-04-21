import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[color:var(--accent-soft)] text-[color:var(--foreground)]",
        secondary: "border-transparent bg-[color:var(--card-strong)] text-[color:var(--foreground)]",
        destructive: "border-transparent bg-[color:var(--danger)] text-black",
        outline: "text-[color:var(--foreground)] border-[color:var(--card-border)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
