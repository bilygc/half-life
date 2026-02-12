import type { FastifyInstance } from "fastify";
import { createClient } from "@supabase/supabase-js";
import { sendAnnouncementToSubscribers } from "../lib/sendAnnouncementToSubscribers.js";

export async function adminRoutes(app: FastifyInstance) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  app.get("/admin/flag-announcement", async (req, reply) => {
    const { token, is_official } = req.query as {
      token?: string;
      is_official?: string;
    };

    if (!token) {
      return reply.code(400).send("Missing token");
    }

    const isOfficial = is_official === "true";

    const { data: announcement } = await supabase
      .from("announcements")
      .select("*")
      .eq("approval_token", token)
      .eq("approved", false)
      .single();

    if (!announcement) {
      return reply.code(404).send("Invalid or expired token");
    }

    // 1️⃣ Marcar como aprobado y establecer oficialidad
    const { data: updatedAnnouncement, error } = await supabase
      .from("announcements")
      .update({
        approved: true,
        is_official: isOfficial,
        approved_at: new Date().toISOString(),
        approval_token: null,
      })
      .eq("id", announcement.id)
      .select()
      .single();

    if (error || !updatedAnnouncement) {
      return reply.code(500).send("Failed to update announcement");
    }

    // 2️⃣ Enviar correos masivos
    await sendAnnouncementToSubscribers(updatedAnnouncement, supabase);

    return reply.send(
      `✅ Announcement flagged as ${isOfficial ? "Official" : "All"} and emails sent`,
    );
  });
}
