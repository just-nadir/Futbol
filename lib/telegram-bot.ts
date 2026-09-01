const API_BASE = "https://api.telegram.org";

function botToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return token;
}

async function callTelegram(method: string, body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/bot${botToken()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Telegram API ${method} failed: ${data.description ?? res.statusText}`);
  }
  return data.result;
}

function appUrl() {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) throw new Error("NEXT_PUBLIC_APP_URL is not set");
  return url;
}

/** Sends a text message, optionally with a "Open Futbol App" web_app button. */
export async function sendMessage(
  chatId: string | number,
  text: string,
  options?: { withAppButton?: boolean; matchPath?: string },
) {
  const replyMarkup = options?.withAppButton
    ? {
        inline_keyboard: [
          [
            {
              text: "⚽ Futbol ilovasini ochish",
              web_app: { url: `${appUrl()}${options.matchPath ?? ""}` },
            },
          ],
        ],
      }
    : undefined;

  return callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    reply_markup: replyMarkup,
    parse_mode: "HTML",
  });
}

export async function setWebhook(webhookUrl: string, secretToken: string) {
  return callTelegram("setWebhook", { url: webhookUrl, secret_token: secretToken });
}

export async function getWebhookInfo() {
  const res = await fetch(`${API_BASE}/bot${botToken()}/getWebhookInfo`);
  return res.json();
}
