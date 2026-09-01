import { initials } from "./MemberAvatar";
import type { TelegramUser } from "@/lib/types";

export function PlayerCard({ user }: { user: TelegramUser }) {
  const fullName = `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`;

  return (
    <div className="overflow-hidden rounded-2xl bg-neutral-900 ring-1 ring-neutral-800">
      <div className="relative aspect-[3/4] w-full bg-neutral-800">
        {user.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photo_url} alt={fullName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-800 to-emerald-950 text-4xl font-bold text-white">
            {initials(user)}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-10">
          <p className="truncate text-sm font-bold text-white">{fullName}</p>
          {user.username && (
            <p className="truncate text-xs text-neutral-300">@{user.username}</p>
          )}
        </div>
      </div>
    </div>
  );
}
