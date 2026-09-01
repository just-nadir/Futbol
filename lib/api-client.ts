/** Har bir so'rovga Telegram initData headerini qo'shib yuboradigan fetch wrapper. */
export async function apiFetch(
  url: string,
  initData: string,
  options: RequestInit = {},
) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": initData,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "So'rov muvaffaqiyatsiz");
  return data;
}
