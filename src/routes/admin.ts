import type { FastifyInstance } from "fastify";
import { createClient } from "@supabase/supabase-js";

export async function adminRoutes(app: FastifyInstance) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  app.get("/admin/approve-announcement", async (req, reply) => {
    const { token } = req.query as { token?: string };

    if (!token) {
      return reply.code(400).send("Missing token");
    }

    const { data: announcement } = await supabase
      .from("announcements")
      .select("*")
      .eq("approval_token", token)
      .eq("approved", false)
      .single();

    if (!announcement) {
      return reply.code(404).send("Invalid or expired token");
    }

    // 1️⃣ Aprobar anuncio
    await supabase
      .from("announcements")
      .update({
        approved: true,
        approved_at: new Date().toISOString(),
        approval_token: null
      })
      .eq("id", announcement.id);

    // 2️⃣ Enviar correos masivos
    await sendAnnouncementToSubscribers(announcement, supabase);

    return reply.send("✅ Announcement approved and emails sent");
  });
}
