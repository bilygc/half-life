console.log("Cron Job running...");
process.exit(0);

// import "dotenv/config";
// import fetch from "node-fetch";
// import { createClient } from "@supabase/supabase-js";
// import type { HLNews } from "../src/types.js";

// const supabase = createClient(
//   process.env.SUPABASE_URL || "",
//   process.env.SUPABASE_SERVICE_ROLE_KEY || ""
// );

// async function main() {
//   console.log("🔎 Checking HL3 news...");

//   const apiKey = process.env.NEWS_API_KEY;
//   const url = `https://newsapi.org/v2/everything?q=half-life 3&searchIn=title&sortBy=publishedAt&language=en&apiKey=${apiKey}`;
//   const res = await fetch(url);
//   const news = await res.json() as HLNews;

//   const hl3Announced = news.articles.some(n =>
//     n.title.toLowerCase().includes("half-life 3")
//   );

//   if (!hl3Announced) {
//     console.log("❌ No announcement yet");
//     return;
//   }

//   console.log("🚨 HL3 ANNOUNCED!");

//   const { data: users } = await supabase
//     .from("subscribers")
//     .select("email");

//   for (const user of users) {
//     await sendEmail(user.email);
//   }
// }

// main().catch(err => {
//   console.error("Cron failed:", err);
//   process.exit(1);
// });
