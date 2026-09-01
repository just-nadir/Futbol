"use client";

import { useState } from "react";
import { PitchLineup } from "./PitchLineup";
import type { TelegramUser } from "@/lib/types";

type Teams = { team_a: number[]; team_b: number[] } | null;

function toMembers(ids: number[], roster: TelegramUser[]): TelegramUser[] {
  return ids
    .map((id) => roster.find((u) => u.id === id))
    .filter((u): u is TelegramUser => Boolean(u));
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
        <div className="mt-3">
          <PitchLineup teamA={toMembers(teams.team_a, roster)} teamB={toMembers(teams.team_b, roster)} />
        </div>
      )}
    </div>
  );
}
