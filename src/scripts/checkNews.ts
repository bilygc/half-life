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

import { fetchSteamNews } from "../lib/steam.js";

const NEWS_SOURCES = {
  NEWSAPI: "newsapi",
  STEAM: "steam",
};

const GAME = "half-life-3";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

const generateApprovalToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

async function main() {
  console.log("[CRON] Checking HL3 news from all sources...");

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) throw new Error("Missing NEWS_API_KEY");

  // 1. Fetch from NewsAPI
  const newsApiUrl =
    "https://newsapi.org/v2/everything" +
    "?q=half-life 3" +
    "&searchIn=title" +
    "&sortBy=publishedAt" +
    "&language=en";

  let newsApiArticles: any[] = [];
  try {
    const res = await fetch(newsApiUrl, {
      headers: { "X-Api-Key": apiKey },
    });
    if (res.ok) {
      const data = (await res.json()) as HLNews;
      newsApiArticles = (data.articles || []).map((a) => ({
        source: NEWS_SOURCES.NEWSAPI,
        title: a.title,
        url: a.url,
        publishedAt: a.publishedAt,
      }));
    }
  } catch (err) {
    console.error("[CRON] NewsAPI fetch failed", err);
  }

  // 2. Fetch from Steam
  let steamArticles: any[] = [];
  try {
    const steamNews = await fetchSteamNews();
    steamArticles = steamNews.map((a) => ({
      source: NEWS_SOURCES.STEAM,
      title: a.title,
      url: a.url,
      publishedAt: a.publishedAt,
    }));
  } catch (err) {
    console.error("[CRON] Steam news fetch failed", err);
  }

  const allArticles = [...newsApiArticles, ...steamArticles];

  if (!allArticles.length) {
    console.log("[CRON] No articles found from any source");
    process.exit(0);
  }

  console.log(`[CRON] Total articles found: ${allArticles.length}`);

  for (const article of allArticles) {
    // Basic filter: must mention "half-life 3" in title
    if (!article.title.toLowerCase().includes("half-life 3")) {
      continue;
    }

    const sourceId = article.url; // URL is unique → ideal as source_id

    // 1️⃣ Insert announcement if it doesn't exist
    const { data: announcement, error: insertError } = await supabase
      .from("announcements")
      .upsert(
        {
          source: article.source,
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

    console.log(
      `[CRON] Admin notified of new announcement from ${article.source}: ${article.title}`,
    );
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[CRON] Fatal error:", err);
  process.exit(1);
});
