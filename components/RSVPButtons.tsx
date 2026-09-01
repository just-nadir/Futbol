"use client";

import type { RsvpStatus } from "@/lib/types";

const OPTIONS: { status: RsvpStatus; label: string }[] = [
  { status: "going", label: "✅ Boraman" },
  { status: "not_going", label: "❌ Bormayman" },
  { status: "maybe", label: "🤔 Hali bilmayman" },
];

export function RSVPButtons({
  current,
  onChange,
  disabled,
}: {
  current: RsvpStatus | null;
  onChange: (status: RsvpStatus) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.status}
          disabled={disabled}
          onClick={() => onChange(opt.status)}
          className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
            current === opt.status
              ? "bg-emerald-600 text-white"
              : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
