import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireTelegramUser, unauthorized, UnauthorizedError } from "@/lib/require-telegram-user";
import type { RsvpStatus } from "@/lib/types";

const VALID_STATUSES: RsvpStatus[] = ["going", "not_going", "maybe"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let user;
  try {
    user = requireTelegramUser(req);
  } catch (err) {
    if (err instanceof UnauthorizedError) return unauthorized(err.message);
    throw err;
  }

  const { id } = await params;
  const { status } = await req.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "status noto'g'ri" }, { status: 400 });
  }

  // Bota bir marta ko'ringan foydalanuvchi bo'lishi kerak (webhook orqali kelmagan bo'lsa ham,
  // Mini App /api/me chaqirilganda users jadvaliga yozilgan bo'ladi).
  await supabaseAdmin.from("users").upsert(
    {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      photo_url: user.photo_url,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  const { error } = await supabaseAdmin.from("rsvps").upsert(
    {
      match_id: id,
      user_id: user.id,
      status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "match_id,user_id" },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
