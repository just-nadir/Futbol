import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "./supabase";
import { resolveDisplay } from "./display-user";
import type { TelegramUser } from "./types";

const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60;

/**
 * Validates Telegram Mini App `initData` per Telegram's documented algorithm:
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateInitData(initData: string): TelegramUser {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  if (!receivedHash) throw new Error("initData: missing hash");
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  const receivedBuf = Buffer.from(receivedHash, "hex");
  const computedBuf = Buffer.from(computedHash, "hex");
  if (
    receivedBuf.length !== computedBuf.length ||
    !timingSafeEqual(receivedBuf, computedBuf)
  ) {
    throw new Error("initData: invalid hash");
  }

  const authDate = Number(params.get("auth_date") ?? "0");
  if (!authDate || Date.now() / 1000 - authDate > MAX_AUTH_AGE_SECONDS) {
    throw new Error("initData: expired");
  }

  const userRaw = params.get("user");
  if (!userRaw) throw new Error("initData: missing user");
  const user = JSON.parse(userRaw);

  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name ?? null,
    username: user.username ?? null,
    photo_url: user.photo_url ?? null,
  };
}

/**
 * Validates initData, Telegram'dan kelgan asl ma'lumotni `users` jadvaliga yozadi
 * (admin panelda kiritilgan custom_name/custom_photo_url'ga tegmaydi), va
 * ko'rsatish uchun tayyor (custom qiymatlar ustun qo'yilgan) foydalanuvchini qaytaradi.
 */
export async function validateAndUpsertUser(initData: string): Promise<TelegramUser> {
  const user = validateInitData(initData);

  const { data, error } = await supabaseAdmin
    .from("users")
    .upsert(
      {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select("id, first_name, last_name, username, photo_url, custom_name, custom_photo_url")
    .single();
  if (error) throw error;

  return resolveDisplay(data);
}
