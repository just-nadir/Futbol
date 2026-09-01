import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdmin, forbidden, ForbiddenError } from "@/lib/require-admin";
import { UnauthorizedError, unauthorized } from "@/lib/require-telegram-user";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file majburiy" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Faqat rasm fayllari qabul qilinadi" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Rasm hajmi 5 MB dan katta bo'lmasligi kerak" }, { status: 400 });
  }

  const ext = file.type.split("/")[1];
  const path = `${id}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from("avatars")
    .upload(path, buffer, { contentType: file.type, upsert: true });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: publicUrlData } = supabaseAdmin.storage.from("avatars").getPublicUrl(path);

  const { error: updateError } = await supabaseAdmin
    .from("users")
    .update({ custom_photo_url: publicUrlData.publicUrl, updated_at: new Date().toISOString() })
    .eq("id", Number(id));
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ custom_photo_url: publicUrlData.publicUrl });
}

/** custom_photo_url'ni tozalaydi — profil qaytadan Telegram'dagi asl rasmni ko'rsatadi. */
export async function DELETE(
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
  const { error } = await supabaseAdmin
    .from("users")
    .update({ custom_photo_url: null, updated_at: new Date().toISOString() })
    .eq("id", Number(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
