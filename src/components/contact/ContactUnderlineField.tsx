"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";

const ease = [0.22, 1, 0.36, 1] as const;

type ContactUnderlineFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  as?: "input" | "textarea";
  rows?: number;
};

export function ContactUnderlineField({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  value,
  onChange,
  error,
  as = "input",
  rows = 5,
}: ContactUnderlineFieldProps) {
  const reduceMotion = useReducedMotion();
  const [focused, setFocused] = useState(false);

  const onFocus = useCallback(() => setFocused(true), []);
  const onBlur = useCallback(() => setFocused(false), []);

  const lineActive = Boolean(focused || error);

  const fieldClass = cn(
    "peer w-full border-0 bg-transparent px-0 pb-2.5 pt-5 font-sans text-base text-primary outline-none ring-0",
    "placeholder:text-transparent focus:ring-0",
    as === "textarea" && "min-h-[148px] resize-y leading-relaxed",
  );

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-0 origin-left font-display transition-all duration-300 ease-out",
          value || focused
            ? "top-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/55"
            : "top-4 text-base font-normal normal-case tracking-normal text-primary/40",
        )}
      >
        {label}
      </label>

      {as === "textarea" ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder=" "
          className={fieldClass}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder=" "
          className={fieldClass}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      )}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-border" />
      <motion.div
        aria-hidden
        className={cn(
          "pointer-events-none absolute bottom-0 left-0 h-[2px] w-full origin-left",
          error ? "bg-red-600/80" : "bg-primary",
        )}
        initial={false}
        animate={{
          scaleX: error ? 1 : lineActive ? 1 : 0,
        }}
        transition={
          reduceMotion
            ? { duration: 0.01 }
            : { duration: 0.5, ease }
        }
      />

      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-600/90">
          {error}
        </p>
      ) : null}
    </div>
  );
}
