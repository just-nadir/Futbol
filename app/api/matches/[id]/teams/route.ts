import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireTelegramUser, unauthorized, UnauthorizedError } from "@/lib/require-telegram-user";

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireTelegramUser(req);
  } catch (err) {
    if (err instanceof UnauthorizedError) return unauthorized(err.message);
    throw err;
  }

  const { id } = await params;

  const { data: match, error: matchError } = await supabaseAdmin
    .from("matches")
    .select("max_spots")
    .eq("id", id)
    .single();
  if (matchError) return NextResponse.json({ error: matchError.message }, { status: 404 });

  const { data: rsvps, error: rsvpError } = await supabaseAdmin
    .from("rsvps")
    .select("user_id, created_at")
    .eq("match_id", id)
    .eq("status", "going")
    .order("created_at", { ascending: true });
  if (rsvpError) return NextResponse.json({ error: rsvpError.message }, { status: 500 });

  const confirmedIds = rsvps.slice(0, match.max_spots).map((r) => r.user_id);
  const shuffled = shuffle(confirmedIds);
  const mid = Math.ceil(shuffled.length / 2);

  const teams = {
    team_a: shuffled.slice(0, mid),
    team_b: shuffled.slice(mid),
    generated_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabaseAdmin
    .from("matches")
    .update({ teams })
    .eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ teams });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("matches")
    .select("teams")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ teams: data.teams });
}
