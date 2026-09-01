import { NextRequest, NextResponse } from "next/server";
import { validateInitData } from "./telegram-auth";
import type { TelegramUser } from "./types";

/**
 * Reads the `X-Telegram-Init-Data` header from an API request, validates it,
 * and returns the authenticated Telegram user. Every API route except the
 * bot webhook and the cron endpoint should call this first.
 */
export function requireTelegramUser(req: NextRequest): TelegramUser {
  const initData = req.headers.get("x-telegram-init-data");
  if (!initData) throw new UnauthorizedError("Missing X-Telegram-Init-Data header");
  try {
    return validateInitData(initData);
  } catch (err) {
    throw new UnauthorizedError(err instanceof Error ? err.message : "Invalid initData");
  }
}

export class UnauthorizedError extends Error {}

export function unauthorized(message: string) {
  return NextResponse.json({ error: message }, { status: 401 });
}
