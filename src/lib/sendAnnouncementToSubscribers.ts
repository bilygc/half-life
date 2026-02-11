import { sendEmail } from "./sendEmail.js";
import type { Announcement } from "./types.js";
import { createEmailTemplate } from "./createEmailTemplate.js";

export async function sendAnnouncementToSubscribers(
  announcement: Announcement,
  supabase: any,
) {
  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("id,email,preference")
    .eq("is_active", true)
    .eq("confirmed", true);

  if (!subscribers?.length) return;

  for (const user of subscribers) {
    // If user prefers official only, and this is NOT official, skip.
    // For now, I'll check if the title contains "Official" or something similar if I don't have a type.
    // Better: Allow the admin to decide or just send regardless if it's official.
    // According to requirements: "news, leak or rumour" vs "official announcement".

    const isOfficial = announcement.title.toLowerCase().includes("official");
    if (user.preference === "official_only" && !isOfficial) {
      continue;
    }

    const { data: sent } = await supabase
      .from("notification_logs")
      .select("id")
      .eq("announcement_id", announcement.id)
      .eq("subscriber_id", user.id)
      .maybeSingle();

    if (sent) continue;

    const subject = "🚨 Half-Life 3 has been announced!";

    try {
      await sendEmail(
        user.email,
        subject,
        createEmailTemplate(announcement, "subscriber"),
      );

      await supabase.from("notification_logs").insert({
        announcement_id: announcement.id,
        subscriber_id: user.id,
        status: "sent",
      });
    } catch {
      await supabase.from("notification_logs").insert({
        announcement_id: announcement.id,
        subscriber_id: user.id,
        status: "failed",
      });
    }
  }
}
