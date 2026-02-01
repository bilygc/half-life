import "dotenv/config";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import type { HLNews } from "../types.js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NEWS_SOURCE = "newsapi";
const GAME = "half-life-3";

async function main() {
  console.log("[CRON] Checking HL3 news...");

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) throw new Error("Missing NEWS_API_KEY");

  const url =
    "https://newsapi.org/v2/everything" +
    "?q=half-life 3" +
    "&searchIn=title" +
    "&sortBy=publishedAt" +
    "&language=en";

  const res = await fetch(url, {
    headers: { "X-Api-Key": apiKey }
  });

  if (!res.ok) {
    throw new Error(`News API failed: ${res.status}`);
    process.exit(1);
  }

  const news = (await res.json()) as HLNews;

  if (!news.articles?.length) {
    console.log("[CRON] No articles found");
    process.exit(0);
  }

  for (const article of news.articles) {
    if (!article.title.toLowerCase().includes("half-life 3")) {
      continue;
    }

    const sourceId = article.url; // URL es único → ideal como source_id

    // 1️⃣ Insertar anuncio si no existe
    const { data: announcement, error: insertError } = await supabase
      .from("announcements")
      .upsert(
        {
          source: NEWS_SOURCE,
          source_id: sourceId,
          title: article.title,
          url: article.url,
          published_at: article.publishedAt,
          game: GAME
        },
        { onConflict: "source,source_id" }
      )
      .select()
      .single();

    if (insertError || !announcement) {
      console.error("[CRON] Failed inserting announcement", insertError);
      continue;
    }

    // 2️⃣ Si ya fue procesado, saltar
    if (announcement.processed) {
      console.log("[CRON] Announcement already processed");
      continue;
    }

    console.log("[CRON] New HL3 announcement detected");

    // 3️⃣ Obtener subscribers válidos
    // const { data: subscribers, error: subError } = await supabase
    //   .from("subscribers")
    //   .select("id,email")
    //   .eq("is_active", true)
    //   .eq("confirmed", true);

    // if (subError || !subscribers?.length) {
    //   console.log("[CRON] No active subscribers");
    //   continue;
    // }

    // 4️⃣ Enviar correos y registrar logs
    // for (const user of subscribers) {
    //   try {
    //     await sendEmail(user.email, article);

    //     await supabase.from("notification_logs").insert({
    //       announcement_id: announcement.id,
    //       subscriber_id: user.id,
    //       status: "sent"
    //     });
    //   } catch (err) {
    //     console.error("[CRON] Email failed:", user.email, err);

    //     await supabase.from("notification_logs").insert({
    //       announcement_id: announcement.id,
    //       subscriber_id: user.id,
    //       status: "failed"
    //     });
    //   }
    // }

    // try {
    //     await sendEmail('licbgomez@gmail.com', article);
    // } catch (err) {
    //     console.error("[CRON] Email failed:", 'licbgomez@gmail.com', err);
    // }

    // 5️⃣ Marcar anuncio como procesado
    // await supabase
    //   .from("announcements")
    //   .update({
    //     processed: true,
    //     processed_at: new Date().toISOString()
    //   })
    //   .eq("id", announcement.id);

    // console.log("[CRON] Announcement processed successfully");
  }

  process.exit(0);
}

main().catch(err => {
  console.error("[CRON] Fatal error:", err);
  process.exit(1);
});
