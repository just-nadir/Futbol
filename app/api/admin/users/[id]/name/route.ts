import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin, forbidden, ForbiddenError } from "@/lib/require-admin";
import { UnauthorizedError, unauthorized } from "@/lib/require-telegram-user";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireAdmin(req);
  } catch (err) {
    if (err instanceof UnauthorizedError) return unauthorized(err.message);
    if (err instanceof ForbiddenError) return forbidden(err.message);
    throw err;
  }

  const { id } = await params;
  const { custom_name } = await req.json();

  const { error } = await supabaseAdmin
    .from("users")
    .update({ custom_name: custom_name || null, updated_at: new Date().toISOString() })
    .eq("id", Number(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
