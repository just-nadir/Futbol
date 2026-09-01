"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTelegram } from "@/lib/use-telegram";
import { apiFetch } from "@/lib/api-client";
import { RSVPButtons } from "@/components/RSVPButtons";
import { AttendeeList } from "@/components/AttendeeList";
import { TeamSplitButton } from "@/components/TeamSplitButton";
import type { MatchWithAttendees, RsvpStatus } from "@/lib/types";

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const telegram = useTelegram();
  const [match, setMatch] = useState<MatchWithAttendees | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const load = useCallback(async () => {
    const headers: HeadersInit =
      telegram.status === "ready" ? { "X-Telegram-Init-Data": telegram.initData } : {};
    const res = await fetch(`/api/matches/${id}`, { headers });
    const data = await res.json();
    setMatch(data);
  }, [id, telegram]);

  useEffect(() => {
    if (telegram.status === "loading") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch, setState happens after await
    load();
  }, [telegram.status, load]);

  if (telegram.status === "loading" || !match) {
    return <div className="p-6 text-center text-neutral-400">Yuklanmoqda...</div>;
  }
  if (telegram.status === "error") {
    return <div className="p-6 text-center text-neutral-400">{telegram.message}</div>;
  }

  async function handleRsvp(status: RsvpStatus) {
    if (telegram.status !== "ready") return;
    setRsvpLoading(true);
    try {
      await apiFetch(`/api/matches/${id}/rsvp`, telegram.initData, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      await load();
    } finally {
      setRsvpLoading(false);
    }
  }

  const date = new Date(match.starts_at);
  const dateLabel = date.toLocaleDateString("uz-UZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeLabel = date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-4">
      <div className="rounded-2xl bg-neutral-900 p-4 ring-1 ring-neutral-800">
        <p className="text-lg font-bold capitalize text-white">{dateLabel}</p>
        <p className="text-neutral-400">
          {timeLabel} · {match.location}
        </p>
      </div>

      <RSVPButtons current={match.myStatus} onChange={handleRsvp} disabled={rsvpLoading} />

      <AttendeeList confirmed={match.confirmed} waitlist={match.waitlist} maxSpots={match.max_spots} />

      {match.confirmed.length >= 2 && (
        <TeamSplitButton
          matchId={match.id}
          initData={telegram.initData}
          initialTeams={match.teams}
          roster={match.confirmed}
        />
      )}
    </main>
  );
}
