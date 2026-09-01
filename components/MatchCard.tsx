import Link from "next/link";
import type { Match } from "@/lib/types";

export function MatchCard({ match, goingCount }: { match: Match; goingCount: number }) {
  const date = new Date(match.starts_at);
  const dateLabel = date.toLocaleDateString("uz-UZ", { weekday: "long", day: "numeric", month: "long" });
  const timeLabel = date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });

  return (
    <Link
      href={`/match/${match.id}`}
      className="block rounded-2xl bg-neutral-900 p-4 ring-1 ring-neutral-800 transition-colors hover:bg-neutral-800"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold capitalize text-white">{dateLabel}</p>
          <p className="text-sm text-neutral-400">
            {timeLabel} · {match.location}
          </p>
        </div>
        <div className="rounded-full bg-emerald-900/50 px-3 py-1 text-sm font-medium text-emerald-400">
          {goingCount}/{match.max_spots}
        </div>
      </div>
    </Link>
  );
}
