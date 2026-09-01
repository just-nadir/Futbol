"use client";

import { useEffect, useState } from "react";
import type { TelegramUser } from "./types";

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        ready: () => void;
        expand: () => void;
        colorScheme: "light" | "dark";
      };
    };
  }
}

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; user: TelegramUser; initData: string };

/**
 * Telegram Mini App ichida ochilganda initData'ni oladi, /api/me orqali
 * serverda tekshirtiradi va foydalanuvchi ma'lumotini qaytaradi.
 */
export function useTelegram(): State {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time mount check, not a render loop
      setState({
        status: "error",
        message: "Bu ilova faqat Telegram ichida ochilganda ishlaydi.",
      });
      return;
    }
    webApp.ready();
    webApp.expand();

    const initData = webApp.initData;
    if (!initData) {
      setState({ status: "error", message: "Telegram initData topilmadi." });
      return;
    }

    fetch("/api/me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Xatolik yuz berdi");
        setState({ status: "ready", user: data.user, initData });
      })
      .catch((err) => setState({ status: "error", message: err.message }));
  }, []);

  return state;
}
