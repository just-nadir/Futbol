export type RsvpStatus = "going" | "not_going" | "maybe";

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name: string | null;
  username: string | null;
  photo_url: string | null;
};

export type Match = {
  id: string;
  starts_at: string;
  location: string;
  max_spots: number;
  min_players: number;
  created_by: number;
  teams: { team_a: number[]; team_b: number[]; generated_at: string } | null;
  reminder_sent_at: string | null;
  low_headcount_alert_sent_at: string | null;
  created_at: string;
  goingCount?: number;
};

export type Rsvp = {
  id: number;
  match_id: string;
  user_id: number;
  status: RsvpStatus;
  created_at: string;
  updated_at: string;
};

export type MatchWithAttendees = Match & {
  confirmed: (TelegramUser & { status: RsvpStatus })[];
  waitlist: (TelegramUser & { status: RsvpStatus })[];
  maybe: (TelegramUser & { status: RsvpStatus })[];
  myStatus: RsvpStatus | null;
};

/** Admin panelida ko'rinadigan qator: Telegram'dan kelgan asl ma'lumot + qo'lda kiritilgan qiymatlar. */
export type AdminUserRow = TelegramUser & {
  custom_name: string | null;
  custom_photo_url: string | null;
};
