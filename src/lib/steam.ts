import type { Article, SteamResponse, Newsitem } from "../types.js";

export const APP_IDS = [546560, 220, 70]; // Alyx, HL2, HL

export async function scrapeOgImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Astro-App-Scraper" },
      signal: AbortSignal.timeout(5000), // 5s timeout
    });
    if (!response.ok) return null;
    const html = await response.text();
    const match =
      html.match(
        /<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i,
      ) ||
      html.match(/<meta\s+content=["'](.*?)["']\s+property=["']og:image["']/i);
    return match ? (match[1] ?? null) : null;
  } catch (err) {
    console.error(`>>> Scraping failed for ${url}:`, err);
    return null;
  }
}

export async function fetchSteamNews(): Promise<Article[]> {
  console.log(">>> Starting fetchSteamNews...");
  const fetchPromises = APP_IDS.map(async (appidIdx: number) => {
    try {
      const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${appidIdx}&count=5&maxlength=300&format=json`;
      const response = await fetch(url);
      if (!response.ok) return [];

      const data = (await response.json()) as SteamResponse;
      return (data.appnews.newsitems || []).map((item) => ({
        ...item,
        appid: appidIdx,
      }));
    } catch (err) {
      console.error(
        `>>> Failed to fetch Steam news for appid ${appidIdx}:`,
        err,
      );
      return [];
    }
  });

  const appResults = await Promise.all(fetchPromises);
  const flatItems = appResults.flat();

  console.log(
    `>>> Found ${flatItems.length} total Steam news items. Scraping images...`,
  );

  const mapped = await Promise.all(
    flatItems.map(async (item: Newsitem) => {
      const ogImage = await scrapeOgImage(item.url);
      const urlToImage =
        ogImage ||
        `https://cdn.akamai.steamstatic.com/steam/apps/${item.appid}/header.jpg`;

      return {
        source: { id: "steam", name: item.feedlabel },
        author: item.author,
        title: item.title,
        description:
          item.contents.replace(/<[^>]*>/g, "").substring(0, 200) + "...",
        url: item.url,
        urlToImage,
        publishedAt: new Date(item.date * 1000).toISOString() as any,
        content: item.contents,
      };
    }),
  );

  console.log(">>> Finished fetchSteamNews.");
  return mapped;
}
