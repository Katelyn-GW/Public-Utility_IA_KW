import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-e9727658/health", (c) => {
  return c.json({ status: "ok" });
});

// Are.na proxy endpoint
app.get("/make-server-e9727658/arena/:slug", async (c) => {
  const slug = c.req.param("slug");
  const page = c.req.query("page") || "1";
  const per = c.req.query("per") || "40";

  try {
    const url = `https://api.are.na/v2/channels/${slug}?per=${per}&page=${page}`;
    const headers: Record<string, string> = {};
    
    const token = Deno.env.get("ARENA_ACCESS_TOKEN");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, { headers });

    if (!res.ok) {
      const errorText = await res.text();
      console.log(`Are.na API error: ${res.status} - ${errorText}`);
      return c.json({ error: `Are.na API returned ${res.status}`, details: errorText }, 502);
    }

    const data = await res.json();
    return c.json(data);
  } catch (err) {
    console.log(`Are.na proxy error: ${err}`);
    return c.json({ error: `Failed to fetch from Are.na: ${err}` }, 500);
  }
});

// OpenAI Vision - batch analyze tattoos for tags and descriptions
app.post("/make-server-e9727658/analyze-tattoos", async (c) => {
  try {
    const { tattoos } = await c.req.json() as { tattoos: { id: string; imageUrl: string; title: string }[] };
    if (!tattoos || !Array.isArray(tattoos)) {
      return c.json({ error: "tattoos array is required" }, 400);
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return c.json({ error: "OPENAI_API_KEY not configured" }, 500);
    }

    // Check which tattoos already have cached results
    const results: Record<string, any> = {};
    const uncached: typeof tattoos = [];

    for (const t of tattoos) {
      const cached = await kv.get(`tattoo-tags-v2-${t.id}`);
      if (cached) {
        results[t.id] = typeof cached === "string" ? JSON.parse(cached) : cached;
      } else {
        uncached.push(t);
      }
    }

    // Process uncached tattoos in parallel (max 5 at a time)
    const batchSize = 5;
    for (let i = 0; i < uncached.length; i += batchSize) {
      const batch = uncached.slice(i, i + batchSize);
      const promises = batch.map(async (t) => {
        try {
          const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `Analyze this tattoo image. Return ONLY valid JSON with these fields:
{
  "title": "A short, descriptive title for this tattoo (e.g. 'Felix the Cat Blackwork', 'Traditional Eagle with Banner', 'Rose and Dagger'). Make it descriptive and useful for searching/filtering. Do NOT use the filename.",
  "description": "2-3 sentence description of the tattoo design, style, and suggested body placement",
  "keywords": ["pick from: Fine Line, Neo Traditional, American Traditional, Blackwork, Minimalist, Japanese, Realism, Watercolor, Geometric, Dotwork, Tribal, Illustrative, Surrealism, Lettering, Old School"],
  "labels": ["pick from: Skull, Heart, Snake, Eagle, Anchor, Rose, Dagger, Panther, Ship, Flower, Animal, Bird, Cross, Star, Moon, Sun, Dragon, Wolf, Lion, Butterfly, Scorpion, Spider, Fish, Cat, Dog, Eye, Hand, Portrait"],
  "colors": ["pick from: Black & Grey, Color, Full Color"],
  "sizes": ["pick from: Small, Medium, Large"]
}
Pick all that apply for each field. Return ONLY the JSON object.`,
                    },
                    {
                      type: "image_url",
                      image_url: { url: t.imageUrl, detail: "low" },
                    },
                  ],
                },
              ],
              max_tokens: 300,
            }),
          });

          if (!res.ok) {
            console.log(`OpenAI error for ${t.id}: ${res.status}`);
            return { id: t.id, result: null };
          }

          const data = await res.json();
          let content = data.choices?.[0]?.message?.content || "";
          // Strip markdown code fences if present
          content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          
          try {
            const parsed = JSON.parse(content);
            // Cache result
            await kv.set(`tattoo-tags-v2-${t.id}`, JSON.stringify(parsed));
            return { id: t.id, result: parsed };
          } catch {
            console.log(`Failed to parse JSON for ${t.id}: ${content}`);
            return { id: t.id, result: null };
          }
        } catch (err) {
          console.log(`Error analyzing tattoo ${t.id}: ${err}`);
          return { id: t.id, result: null };
        }
      });

      const batchResults = await Promise.all(promises);
      for (const { id, result } of batchResults) {
        if (result) results[id] = result;
      }
    }

    return c.json({ results });
  } catch (err) {
    console.log(`Analyze tattoos error: ${err}`);
    return c.json({ error: `Failed to analyze tattoos: ${err}` }, 500);
  }
});

Deno.serve(app.fetch);