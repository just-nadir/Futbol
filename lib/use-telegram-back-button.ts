"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Telegram'ning o'z ekranidagi (chapdagi) tabiiy "orqaga" tugmasini ko'rsatadi.
 * Bosilganda `href`ga o'tadi. Sahifadan chiqilganda tugma yashiriladi.
 */
export function useTelegramBackButton(href: string) {
  const router = useRouter();

  useEffect(() => {
    const backButton = window.Telegram?.WebApp?.BackButton;
    if (!backButton) return;

    const handleClick = () => router.push(href);
    backButton.onClick(handleClick);
    backButton.show();

    return () => {
      backButton.offClick(handleClick);
      backButton.hide();
    };
  }, [href, router]);
}
