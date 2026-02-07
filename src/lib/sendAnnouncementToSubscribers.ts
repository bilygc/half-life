import { sendEmail } from "./sendEmail.js";

export async function sendAnnouncementToSubscribers(
  announcement: any,
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

    try {
      await sendEmail(user.email, {
        title: announcement.title,
        url: announcement.url
      });

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
