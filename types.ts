
export interface ClickHistory {
  timestamp: number;
  userAgent?: string;
}

export interface ShortenedUrl {
  id: string; // The shortcode
  longUrl: string;
  createdAt: number; // timestamp
  expiresAt: number | null; // timestamp or null for no expiry
  clicks: number;
  clickHistory: ClickHistory[];
}
