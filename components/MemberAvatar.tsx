import type { TelegramUser } from "@/lib/types";

function initials(user: TelegramUser) {
  const a = user.first_name?.[0] ?? "";
  const b = user.last_name?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

export function MemberAvatar({
  user,
  size = 40,
}: {
  user: TelegramUser;
  size?: number;
}) {
  const style = { width: size, height: size };

  if (user.photo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.photo_url}
        alt={user.first_name}
        style={style}
        className="rounded-full object-cover ring-2 ring-neutral-800"
      />
    );
  }

  return (
    <div
      style={style}
      className="flex items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white ring-2 ring-neutral-800"
    >
      {initials(user)}
    </div>
  );
}
