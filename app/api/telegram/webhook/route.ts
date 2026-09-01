import { NextRequest, NextResponse } from "next/server";
import { sendMessage } from "@/lib/telegram-bot";

/** Telegram bot webhook. Faqat /start buyrug'ini qayta ishlaydi, qolganini e'tiborsiz qoldiradi. */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const update = await req.json();
  const message = update.message;
  const text: string | undefined = message?.text;

  if (message && text?.startsWith("/start")) {
    await sendMessage(
      message.chat.id,
      "Salom! ⚽ Futbol o'yinlarini shu yerdan boshqarish mumkin.",
      { withAppButton: true },
    );
  }

  // Telegram javobni tezda kutadi, muvaffaqiyatsiz bo'lsa qayta yuborishga urinadi.
  return NextResponse.json({ ok: true });
}
