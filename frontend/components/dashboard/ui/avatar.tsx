import * as React from "react";
import { cn } from "@/components/dashboard/lib/utils";

export function Avatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />
  );
}

export function AvatarImage({ className, src, alt }: { className?: string; src: string; alt?: string }) {
  return (
    <img
      className={cn("aspect-square h-full w-full", className)}
      src={src}
      alt={alt}
    />
  );
}

export function AvatarFallback({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-xs font-medium">
      {children}
    </span>
  );
}
