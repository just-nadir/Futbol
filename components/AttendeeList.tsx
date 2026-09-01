import { MemberAvatar } from "./MemberAvatar";
import type { RsvpStatus, TelegramUser } from "@/lib/types";

type Attendee = TelegramUser & { status: RsvpStatus };

function Row({ user }: { user: Attendee }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <MemberAvatar user={user} size={36} />
      <span className="text-sm text-neutral-200">
        {user.first_name} {user.last_name ?? ""}
      </span>
    </div>
  );
}

export function AttendeeList({
  confirmed,
  waitlist,
  maxSpots,
}: {
  confirmed: Attendee[];
  waitlist: Attendee[];
  maxSpots: number;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-neutral-400">
          Boradiganlar ({confirmed.length}/{maxSpots})
        </h3>
        {confirmed.length === 0 ? (
          <p className="text-sm text-neutral-500">Hali hech kim ro&apos;yxatdan o&apos;tmagan.</p>
        ) : (
          confirmed.map((u) => <Row key={u.id} user={u} />)
        )}
      </div>

      {waitlist.length > 0 && (
        <div>
          <h3 className="mb-1 text-sm font-semibold text-amber-500">
            Kutish ro&apos;yxati ({waitlist.length})
          </h3>
          {waitlist.map((u) => (
            <Row key={u.id} user={u} />
          ))}
        </div>
      )}
    </div>
  );
}
