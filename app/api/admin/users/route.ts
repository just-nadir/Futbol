import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin, forbidden, ForbiddenError } from "@/lib/require-admin";
import { UnauthorizedError, unauthorized } from "@/lib/require-telegram-user";

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);
  } catch (err) {
    if (err instanceof UnauthorizedError) return unauthorized(err.message);
    if (err instanceof ForbiddenError) return forbidden(err.message);
    throw err;
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, first_name, last_name, username, photo_url, custom_name, custom_photo_url")
    .order("first_name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}
