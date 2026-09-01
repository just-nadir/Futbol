import { MemberAvatar } from "./MemberAvatar";
import type { TelegramUser } from "@/lib/types";

/**
 * Chetdan (darvoza) markazga tomon qator o'lchamlari: toq sonlarda yagona
 * "darvozabon" qatoridan boshlanadi, qolgani 2 talik qatorlarga bo'linadi —
 * 5x5 futzal tarkibiga o'xshash ko'rinish beradi (masalan 5 kishi -> 1-2-2).
 */
function edgeToCenterSizes(n: number): number[] {
  const sizes: number[] = [];
  let remaining = n;
  if (remaining % 2 === 1) {
    sizes.push(1);
    remaining -= 1;
  }
  while (remaining > 0) {
    const take = Math.min(2, remaining);
    sizes.push(take);
    remaining -= take;
  }
  return sizes;
}

function chunkRows(players: TelegramUser[]): TelegramUser[][] {
  const sizes = edgeToCenterSizes(players.length);
  const rows: TelegramUser[][] = [];
  let i = 0;
  for (const size of sizes) {
    rows.push(players.slice(i, i + size));
    i += size;
  }
  return rows;
}

/** chunkRows chet(darvoza)dan markazga tartibda qaytaradi; kerak bo'lsa aksincha buramiz. */
function orderRows(players: TelegramUser[], edgeFirst: boolean): TelegramUser[][] {
  const rows = chunkRows(players);
  return edgeFirst ? rows : [...rows].reverse();
}

function PlayerChip({ user, ring }: { user: TelegramUser; ring: string }) {
  return (
    <div className="flex w-16 flex-col items-center gap-1">
      <div className={`rounded-full ${ring} p-0.5`}>
        <MemberAvatar user={user} size={44} />
      </div>
      <span className="max-w-16 truncate text-center text-[11px] font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        {user.first_name}
      </span>
    </div>
  );
}

function TeamHalf({
  players,
  edgeFirst,
  ring,
}: {
  players: TelegramUser[];
  edgeFirst: boolean;
  ring: string;
}) {
  const rows = orderRows(players, edgeFirst);
  // Markaziy chiziqqa tegib turgan tomonga qo'shimcha bo'shliq beriladi.
  const centerPad = edgeFirst ? "pb-5" : "pt-5";
  return (
    <div className={`flex flex-1 flex-col justify-around gap-3 py-3 ${centerPad}`}>
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-3">
          {row.map((u) => (
            <PlayerChip key={u.id} user={u} ring={ring} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PitchLineup({
  teamA,
  teamB,
  labelA = "A jamoa",
  labelB = "B jamoa",
}: {
  teamA: TelegramUser[];
  teamB: TelegramUser[];
  labelA?: string;
  labelB?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-neutral-800">
      <div className="flex justify-between bg-neutral-900 px-4 py-2 text-xs font-semibold">
        <span className="text-amber-400">{labelB}</span>
        <span className="text-emerald-400">{labelA}</span>
      </div>

      <div
        className="relative flex flex-col"
        style={{
          background:
            "repeating-linear-gradient(0deg, #1e6b34 0px, #1e6b34 36px, #237a3c 36px, #237a3c 72px)",
        }}
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 140"
          preserveAspectRatio="none"
        >
          <rect x="2" y="2" width="96" height="136" fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="0.6" />
          <line x1="2" y1="70" x2="98" y2="70" stroke="white" strokeOpacity="0.55" strokeWidth="0.6" />
          <circle cx="50" cy="70" r="12" fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="0.6" />
          <rect x="25" y="2" width="50" height="16" fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="0.6" />
          <rect x="25" y="122" width="50" height="16" fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="0.6" />
        </svg>

        <TeamHalf players={teamB} edgeFirst={true} ring="ring-2 ring-amber-400" />
        <TeamHalf players={teamA} edgeFirst={false} ring="ring-2 ring-emerald-400" />
      </div>
    </div>
  );
}
