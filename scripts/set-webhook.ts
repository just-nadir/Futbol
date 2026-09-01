/**
 * Bir martalik skript: Telegram botning webhook manzilini o'rnatadi.
 * Ishga tushirish: npx tsx scripts/set-webhook.ts
 * .env.local dagi TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET va NEXT_PUBLIC_APP_URL o'qiladi.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!token || !secret || !appUrl) {
    console.error(
      "TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET va NEXT_PUBLIC_APP_URL .env.local da bo'lishi kerak",
    );
    process.exit(1);
  }

  const webhookUrl = `${appUrl}/api/telegram/webhook`;
  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl, secret_token: secret }),
  });
  const data = await res.json();
  console.log(data);

  if (!data.ok) {
    process.exit(1);
  }
  console.log(`Webhook o'rnatildi: ${webhookUrl}`);
}

main();
