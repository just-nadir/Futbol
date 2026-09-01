import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { resolveDisplay } from "@/lib/display-user";
import type { AdminUserRow } from "@/lib/types";

/** Barcha a'zolarning (kim ilovani hech bo'lmasa bir marta ochgan) ro'yxati, "O'yinchilar" sahifasi uchun. */
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, first_name, last_name, username, photo_url, custom_name, custom_photo_url")
    .order("first_name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const players = (data as AdminUserRow[]).map(resolveDisplay);
  return NextResponse.json({ players });
}
