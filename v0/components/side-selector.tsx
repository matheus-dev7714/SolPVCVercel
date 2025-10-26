"use client"

import { Button } from "@/components/ui/button"

interface SideSelectorProps {
  value: "over" | "under"
  onChange: (value: "over" | "under") => void
  disabled?: boolean
}

export function SideSelector({ value, onChange, disabled }: SideSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--color-panel)] rounded-lg border border-[var(--color-border)]">
      <Button
        variant={value === "over" ? "default" : "ghost"}
        className={`${
          value === "over"
            ? "bg-[var(--color-neon-green)] text-[var(--color-background)] neon-glow"
            : "text-[var(--color-text)] hover:bg-[var(--color-neon-green)]/10 hover:text-[var(--color-neon-green)]"
        } transition-all duration-200`}
        onClick={() => onChange("over")}
        disabled={disabled}
      >
        Over
      </Button>
      <Button
        variant={value === "under" ? "default" : "ghost"}
        className={`${
          value === "under"
            ? "bg-[var(--color-neon-purple)] text-white neon-glow"
            : "text-[var(--color-text)] hover:bg-[var(--color-neon-purple)]/10 hover:text-[var(--color-neon-purple)]"
        } transition-all duration-200`}
        onClick={() => onChange("under")}
        disabled={disabled}
      >
        Under
      </Button>
    </div>
  )
}
