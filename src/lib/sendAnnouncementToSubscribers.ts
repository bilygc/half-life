import { sendEmail } from "./sendEmail.js";
import type { Announcement } from "./types.js";
import { createEmailTemplate } from "./createEmailTemplate.js";

export async function sendAnnouncementToSubscribers(
  announcement: Announcement,
  supabase: any
) {
  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("id,email")
    .eq("is_active", true)
    .eq("confirmed", true);

  if (!subscribers?.length) return;

  for (const user of subscribers) {
    const { data: sent } = await supabase
      .from("notification_logs")
      .select("id")
      .eq("announcement_id", announcement.id)
      .eq("subscriber_id", user.id)
      .maybeSingle();

    if (sent) continue;

    const subject = "🚨 Half-Life 3 has been announced!"

    try {
      await sendEmail(user.email, subject, createEmailTemplate(announcement, "subscriber"));

      await supabase.from("notification_logs").insert({
        announcement_id: announcement.id,
        subscriber_id: user.id,
        status: "sent"
      });
    } catch {
      await supabase.from("notification_logs").insert({
        announcement_id: announcement.id,
        subscriber_id: user.id,
        status: "failed"
      });
    }
  }
}
