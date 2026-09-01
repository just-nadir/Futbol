import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { validateInitData } from "@/lib/telegram-auth";
import type { RsvpStatus, TelegramUser } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data: match, error: matchError } = await supabaseAdmin
    .from("matches")
    .select("*")
    .eq("id", id)
    .single();
  if (matchError) return NextResponse.json({ error: matchError.message }, { status: 404 });

  const { data: rsvps, error: rsvpError } = await supabaseAdmin
    .from("rsvps")
    .select("user_id, status, created_at, users(id, first_name, last_name, username, photo_url)")
    .eq("match_id", id)
    .order("created_at", { ascending: true });
  if (rsvpError) return NextResponse.json({ error: rsvpError.message }, { status: 500 });

  type Row = { status: RsvpStatus; users: TelegramUser | null };
  const going = (rsvps as unknown as Row[]).filter((r) => r.status === "going" && r.users);
  const maybe = (rsvps as unknown as Row[]).filter((r) => r.status === "maybe" && r.users);

  const withStatus = (rows: Row[]) => rows.map((r) => ({ ...r.users!, status: r.status }));

  const confirmed = withStatus(going.slice(0, match.max_spots));
  const waitlist = withStatus(going.slice(match.max_spots));

  let myStatus: RsvpStatus | null = null;
  const initData = req.headers.get("x-telegram-init-data");
  if (initData) {
    try {
      const me = validateInitData(initData);
      const mine = (rsvps as unknown as Row[]).find(
        (r) => r.users?.id === me.id,
      );
      myStatus = mine?.status ?? null;
    } catch {
      // no-op: myStatus stays null if initData is missing/invalid
    }
  }

  return NextResponse.json({
    ...match,
    confirmed,
    waitlist,
    maybe: withStatus(maybe),
    myStatus,
  });
}
