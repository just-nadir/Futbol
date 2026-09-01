/**
 * Admin panelda qo'lda kiritilgan ism/rasm bo'lsa, uni Telegram'dan kelgan
 * asl ism/rasmdan ustun qo'yadi. Barcha foydalanuvchiga ko'rinadigan joylarda
 * (ilova ichida) shu funksiyadan o'tgan natija ishlatilishi kerak.
 */
export function resolveDisplay<
  T extends {
    first_name: string;
    photo_url: string | null;
    custom_name?: string | null;
    custom_photo_url?: string | null;
  },
>(user: T): T {
  return {
    ...user,
    first_name: user.custom_name || user.first_name,
    photo_url: user.custom_photo_url || user.photo_url,
  };
}
