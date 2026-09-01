import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireTelegramUser, unauthorized, UnauthorizedError } from "@/lib/require-telegram-user";
import { sendMessage } from "@/lib/telegram-bot";

export async function GET() {
  const { data: matches, error } = await supabaseAdmin
    .from("matches")
    .select("*")
    .order("starts_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (matches.length === 0) return NextResponse.json({ matches: [] });

  const { data: rsvps } = await supabaseAdmin
    .from("rsvps")
    .select("match_id")
    .eq("status", "going")
    .in("match_id", matches.map((m) => m.id));

  const goingCounts = new Map<string, number>();
  for (const r of rsvps ?? []) {
    goingCounts.set(r.match_id, (goingCounts.get(r.match_id) ?? 0) + 1);
  }

  return NextResponse.json({
    matches: matches.map((m) => ({ ...m, goingCount: goingCounts.get(m.id) ?? 0 })),
  });
}

export async function POST(req: NextRequest) {
  let user;
  try {
    user = requireTelegramUser(req);
  } catch (err) {
    if (err instanceof UnauthorizedError) return unauthorized(err.message);
    throw err;
  }

  const body = await req.json();
  const { starts_at, location, max_spots, min_players } = body;

  if (!starts_at || !location || !max_spots) {
    return NextResponse.json(
      { error: "starts_at, location, max_spots majburiy" },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("matches")
    .insert({
      starts_at,
      location,
      max_spots,
      min_players: min_players ?? 8,
      created_by: user.id,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const chatId = process.env.TELEGRAM_GROUP_CHAT_ID;
  if (chatId) {
    const when = new Date(starts_at).toLocaleString("uz-UZ", {
      dateStyle: "full",
      timeStyle: "short",
    });
    try {
      await sendMessage(
        chatId,
        `⚽ Yangi o'yin!\n\n📅 ${when}\n📍 ${location}\n👥 Max ${max_spots} kishi\n\n${user.first_name} tomonidan yaratildi.`,
        { withAppButton: true, matchPath: `/match/${data.id}` },
      );
    } catch (e) {
      console.error("Failed to notify group", e);
    }
  }

  return NextResponse.json({ match: data }, { status: 201 });
}
