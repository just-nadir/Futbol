"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTelegram } from "@/lib/use-telegram";
import { MatchCard } from "@/components/MatchCard";
import { MemberAvatar } from "@/components/MemberAvatar";
import type { Match } from "@/lib/types";

export default function Home() {
  const telegram = useTelegram();
  const [matches, setMatches] = useState<Match[] | null>(null);

  useEffect(() => {
    fetch("/api/matches")
      .then((res) => res.json())
      .then((data) => setMatches(data.matches ?? []));
  }, []);

  if (telegram.status === "loading") {
    return <Centered>Yuklanmoqda...</Centered>;
  }
  if (telegram.status === "error") {
    return <Centered>{telegram.message}</Centered>;
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-4">
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <MemberAvatar user={telegram.user} size={44} />
          <div>
            <p className="text-sm text-neutral-400">Salom,</p>
            <p className="font-semibold text-white">{telegram.user.first_name}</p>
          </div>
        </div>
        <Link
          href="/admin"
          className="rounded-full bg-neutral-900 p-2.5 text-neutral-400 ring-1 ring-neutral-800 hover:text-white"
          title="Admin panel"
        >
          ⚙️
        </Link>
      </header>

      <div className="flex gap-3">
        <Link
          href="/new-match"
          className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-center font-semibold text-white transition-colors hover:bg-emerald-500"
        >
          + Yangi o&apos;yin
        </Link>
        <Link
          href="/players"
          className="flex-1 rounded-2xl bg-neutral-900 px-4 py-3 text-center font-semibold text-white ring-1 ring-neutral-800 transition-colors hover:bg-neutral-800"
        >
          👥 O&apos;yinchilar
        </Link>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-neutral-400">Kelayotgan o&apos;yinlar</h2>
        {matches === null ? (
          <p className="text-sm text-neutral-500">Yuklanmoqda...</p>
        ) : matches.length === 0 ? (
          <p className="text-sm text-neutral-500">Hozircha rejalashtirilgan o&apos;yin yo&apos;q.</p>
        ) : (
          matches.map((m) => (
            <MatchCard key={m.id} match={m} goingCount={m.goingCount ?? 0} />
          ))
        )}
      </section>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6 text-center text-neutral-400">
      {children}
    </div>
  );
}
