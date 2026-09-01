/**
 * Bir martalik skript: botning shaxsiy chatlardagi "Menu Button"ini o'rnatadi
 * (xabar yozish maydoni yonidagi doimiy tugma, Mini App'ni ochadi).
 * Ishga tushirish: npx tsx scripts/set-menu-button.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { setMenuButton } from "../lib/telegram-bot";

setMenuButton("⚽ Futbol")
  .then((result) => console.log("Menu button o'rnatildi:", result))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
