"use client";

import { useState } from "react";
import { MemberAvatar } from "./MemberAvatar";
import type { TelegramUser } from "@/lib/types";

type Teams = { team_a: number[]; team_b: number[] } | null;

function TeamList({ label, ids, roster }: { label: string; ids: number[]; roster: TelegramUser[] }) {
  const members = ids
    .map((id) => roster.find((u) => u.id === id))
    .filter((u): u is TelegramUser => Boolean(u));

  return (
    <div className="flex-1 rounded-xl bg-neutral-800 p-3">
      <p className="mb-2 text-sm font-semibold text-neutral-300">{label}</p>
      <div className="space-y-2">
        {members.map((u) => (
          <div key={u.id} className="flex items-center gap-2">
            <MemberAvatar user={u} size={28} />
            <span className="text-sm text-neutral-200">{u.first_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TeamSplitButton({
  matchId,
  initData,
  initialTeams,
  roster,
  disabled,
}: {
  matchId: string;
  initData: string;
  initialTeams: Teams;
  roster: TelegramUser[];
  disabled?: boolean;
}) {
  const [teams, setTeams] = useState<Teams>(initialTeams);
  const [loading, setLoading] = useState(false);

  async function split() {
    setLoading(true);
    try {
      const res = await fetch(`/api/matches/${matchId}/teams`, {
        method: "POST",
        headers: { "X-Telegram-Init-Data": initData },
      });
      const data = await res.json();
      if (res.ok) setTeams(data.teams);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={split}
        disabled={disabled || loading}
        className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? "Bo'linmoqda..." : teams ? "🔀 Qayta bo'lish" : "🔀 Jamoalarga bo'lish"}
      </button>

      {teams && (
        <div className="mt-3 flex gap-3">
          <TeamList label="A jamoa" ids={teams.team_a} roster={roster} />
          <TeamList label="B jamoa" ids={teams.team_b} roster={roster} />
        </div>
      )}
    </div>
  );
}
