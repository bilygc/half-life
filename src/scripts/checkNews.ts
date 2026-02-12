import "dotenv/config";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import type { HLNews } from "../types.js";
import { sendEmail } from "../lib/sendEmail.js";
import crypto from "crypto";
import { createEmailTemplate } from "../lib/createEmailTemplate.js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const NEWS_SOURCE = "newsapi";
const GAME = "half-life-3";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

const generateApprovalToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

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
    headers: { "X-Api-Key": apiKey },
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
          processed: true,
          approval_token: generateApprovalToken(),
          is_official: false,
        },
        { onConflict: "source,source_id" },
      )
      .select()
      .single();

    if (insertError) {
      console.error("[CRON] Failed inserting announcement", insertError);
      continue;
    }

    if (!announcement || announcement.approved) continue;

    const subject = "🚨 Half-Life 3 has been announced!";

    await sendEmail(
      ADMIN_EMAIL,
      subject,
      createEmailTemplate(announcement, "admin"),
    );

    console.log("[CRON] Admin notified of new announcement");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[CRON] Fatal error:", err);
  process.exit(1);
});
