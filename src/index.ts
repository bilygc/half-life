import fastify from 'fastify'
import 'dotenv/config'
import sql from './db.js'
import { createClient } from '@supabase/supabase-js';
import type { HLNews } from './types.js';

console.log(">>> Backend starting up...");
// Use environment variables; never commit service role key.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

let isTimeToFetchNews = false;
let cachedDbNews: HLNews = {
  status: "",
  totalResults: 0,
  articles: []
}

const insertNewsApiRow = async () => {
  // Build payload — only include provided fields
  const payload = {
    last_fetched: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('news_api')
    .insert(payload)
    .select(); // return the inserted row(s)

  if (error) throw error;
  return data;
}


const server = fastify()

await server.register(import('@fastify/cors'), {
  origin: '*'
})

server.get('/ping', async (request, reply) => {
  return 'pong\n'
})

// Authorization Middleware
server.addHook('onRequest', async (request, reply) => {
  if (request.routeOptions.url === '/news') {
    const authHeader = request.headers['authorization'];
    const validToken = process.env.AUTH_TOKEN;

    if (!validToken) {
      console.error("CRITICAL: AUTH_TOKEN is not defined in backend .env");
    }

    // Check for Bearer token format
    let token = authHeader;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token || token !== validToken) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  }
});



server.get<{ Reply: HLNews }>('/news', async (request, reply) => {
  console.log(">>> /news endpoint requested");

  const apiKey = process.env.NEWS_API_KEY;

  try {
    const dbNews = await sql`SELECT last_fetched FROM news_api ORDER BY last_fetched DESC NULLS LAST LIMIT 1`;
    
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
      throw new Error('NEWS_API_KEY is not defined');
    }

    const url = `https://newsapi.org/v2/everything?excludeDomains=Doeshalflife3cameout.fun&q="half-life 3"&from=2025-12-20&searchIn=title&sortBy=publishedAt&language=en&apiKey=${apiKey}`;

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

})

const port = Number(process.env.PORT) || 8080;

server.listen({ port, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
