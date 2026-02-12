export type Article = {
  title: string;
  url: string;
  publishedAt?: string;
};
export type Announcement = {
  id: string;
  source: string;
  source_id: string;
  title: string;
  url: string;
  publishedAt?: string;
  processed: boolean;
  processed_at?: string;
  created_at: string;
  approved: boolean;
  approval_token: string;
  is_official: boolean;
};
export type EmailType = "admin" | "subscriber" | "verification";

export type SubscriptionPreference = "all" | "official_only";
