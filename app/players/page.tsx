"use client";

import { useEffect, useState } from "react";
import { useTelegram } from "@/lib/use-telegram";
import { PlayerCard } from "@/components/PlayerCard";
import type { TelegramUser } from "@/lib/types";

export default function PlayersPage() {
  const telegram = useTelegram();
  const [players, setPlayers] = useState<TelegramUser[] | null>(null);

  useEffect(() => {
    fetch("/api/players")
      .then((res) => res.json())
      .then((data) => setPlayers(data.players ?? []));
  }, []);

  if (telegram.status === "loading") {
    return <div className="p-6 text-center text-neutral-400">Yuklanmoqda...</div>;
  }
  if (telegram.status === "error") {
    return <div className="p-6 text-center text-neutral-400">{telegram.message}</div>;
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-4">
      <h1 className="text-xl font-bold text-white">👥 O&apos;yinchilar</h1>

      {players === null ? (
        <p className="text-sm text-neutral-500">Yuklanmoqda...</p>
      ) : players.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Hali hech kim ilovani ochmagan — a&apos;zolar botni /start qilganda shu yerda paydo bo&apos;ladi.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {players.map((p) => (
            <PlayerCard key={p.id} user={p} />
          ))}
        </div>
      )}
    </main>
  );
}
