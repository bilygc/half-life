import fastify from "fastify";
import "dotenv/config";
import sql from "./db.js";
import { createClient } from "@supabase/supabase-js";
import type { HLNews } from "./types.js";
import { adminRoutes } from "./routes/admin.js";
import crypto from "crypto";
import { sendEmail } from "./lib/sendEmail.js";
import { createEmailTemplate } from "./lib/createEmailTemplate.js";

console.log(">>> Backend starting up...");
// Use environment variables; never commit service role key.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

let isTimeToFetchNews = false;
let cachedDbNews: HLNews = {
  status: "",
  totalResults: 0,
  articles: [],
};

const insertNewsApiRow = async () => {
  // Build payload — only include provided fields
  const payload = {
    last_fetched: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("news_api")
    .insert(payload)
    .select(); // return the inserted row(s)

  if (error) throw error;
  return data;
};

const server = fastify();

await server.register(import("@fastify/cors"), {
  origin: "*",
});

await server.register(adminRoutes);

server.get("/ping", async (request, reply) => {
  return "pong\n";
});

// Authorization Middleware
server.addHook("onRequest", async (request, reply) => {
  if (request.routeOptions.url === "/news") {
    const authHeader = request.headers["authorization"];
    const validToken = process.env.AUTH_TOKEN;

    if (!validToken) {
      console.error("CRITICAL: AUTH_TOKEN is not defined in backend .env");
    }

    // Check for Bearer token format
    let token = authHeader;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token || token !== validToken) {
      reply.code(401).send({ error: "Unauthorized" });
    }
  }
});

server.get<{ Reply: HLNews }>("/news", async (request, reply) => {
  console.log(">>> /news endpoint requested");

  const apiKey = process.env.NEWS_API_KEY;

  try {
    const dbNews =
      await sql`SELECT last_fetched FROM news_api ORDER BY last_fetched DESC NULLS LAST LIMIT 1`;

    const lastFetched = new Date(dbNews[0]?.last_fetched);
    const now = new Date();
    const diffMs = now.getTime() - lastFetched.getTime();
    const diffMins = diffMs / (1000 * 60);

    console.log(`>>> Last fetched: (${diffMins.toFixed(2)} minutes ago)`);

    if (diffMins > 30 || cachedDbNews.totalResults === 0) {
      isTimeToFetchNews = true;
    }
  } catch (err) {
    console.error(">>> Database query failed:", err);
  }

  if (isTimeToFetchNews) {
    console.log(">>> Fetching news from NewsAPI...");

    if (!apiKey) {
      throw new Error("NEWS_API_KEY is not defined");
    }

    const url = `https://newsapi.org/v2/everything?q=half-life 3&searchIn=title&sortBy=publishedAt&language=en&apiKey=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.statusText}`);
      }
      const data = (await response.json()) as HLNews;
      cachedDbNews = data;

      const row = await insertNewsApiRow();
      isTimeToFetchNews = false;

      return data;
    } catch (err) {
      console.error(">>> NewsAPI request failed:", err);
    }
  } else {
    return cachedDbNews;
  }
});

server.post<{
  Body: { email: string; subscription_preference: "all" | "official_only" };
}>("/subscribe", async (request, reply) => {
  const { email, subscription_preference } = request.body;

  if (!email || !subscription_preference) {
    return reply.code(400).send({ error: "Email and preference are required" });
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const baseUrl = process.env.BASE_URL || "http://localhost:8080";

  try {
    const { data, error } = await supabase
      .from("subscribers")
      .upsert(
        {
          email,
          subscription_preference,
          is_active: true,
          confirmed: false,
          verification_token: verificationToken,
        },
        { onConflict: "email" },
      )
      .select();

    if (error) throw error;

    // Send verification email
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
    const subject = "λ Confirm your Half-Life 3 Alert Subscription";

    // Re-using createEmailTemplate by passing a mock announcement object with the URL
    await sendEmail(
      email,
      subject,
      createEmailTemplate(
        { url: verificationUrl } as any,
        "verification" as any,
      ),
    );

    return {
      success: true,
      message: "Verification email sent. Please check your inbox.",
    };
  } catch (err) {
    console.error(">>> Subscription failed:", err);
    return reply.code(500).send({ error: "Internal Server Error" });
  }
});

server.get<{
  Querystring: { token: string };
}>("/verify-email", async (request, reply) => {
  const { token } = request.query;

  if (!token) {
    return reply.code(400).send({ error: "Verification token is required" });
  }

  try {
    const { data: subscriber, error: fetchError } = await supabase
      .from("subscribers")
      .select("*")
      .eq("verification_token", token)
      .single();

    if (fetchError || !subscriber) {
      return reply.code(404).send({ error: "Invalid or expired token" });
    }

    const { error: updateError } = await supabase
      .from("subscribers")
      .update({
        confirmed: true,
        confirmed_at: new Date().toISOString(),
        verification_token: null,
      })
      .eq("id", subscriber.id);

    if (updateError) throw updateError;

    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:4321";
    return reply.redirect(`${frontendBaseUrl}/confirmation-success`);
  } catch (err) {
    console.error(">>> Email verification failed:", err);
    return reply.code(500).send({ error: "Internal Server Error" });
  }
});

const port = Number(process.env.PORT) || 8080;

server.listen({ port, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
