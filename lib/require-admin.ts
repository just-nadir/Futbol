import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { requireTelegramUser } from "./require-telegram-user";
import type { TelegramUser } from "./types";

function adminIds(): number[] {
  return (process.env.ADMIN_TELEGRAM_IDS ?? "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export class ForbiddenError extends Error {}

/** requireTelegramUser bilan bir xil, lekin faqat ADMIN_TELEGRAM_IDS ro'yxatidagilarga ruxsat beradi. */
export function requireAdmin(req: NextRequest): TelegramUser {
  const user = requireTelegramUser(req);
  if (!adminIds().includes(user.id)) {
    throw new ForbiddenError("Sizda admin huquqi yo'q");
  }
  return user;
}

export function forbidden(message: string) {
  return NextResponse.json({ error: message }, { status: 403 });
}
