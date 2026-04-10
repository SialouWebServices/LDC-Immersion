import { action } from "./_generated/server";
import { v } from "convex/values";

export const generate = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      throw new Error("Clé OPENROUTER_API_KEY non configurée dans Convex.");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "X-OpenRouter-Title": "LDC Immersion Tracker",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
        messages: [{ role: "user", content: args.prompt }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "Erreur API OpenRouter");
    }

    return data.choices[0].message.content;
  },
});
