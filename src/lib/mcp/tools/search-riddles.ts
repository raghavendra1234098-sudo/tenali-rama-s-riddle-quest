import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import riddlesData, { getTotalRiddleCount, isPremiumLevel } from "@/lib/riddlesDatabase";

export default defineTool({
  name: "search_riddles",
  title: "Search riddles",
  description:
    "Search the riddle collection by keyword (matches the English or Telugu riddle text and the hint) and optionally by difficulty. Answers are never included.",
  inputSchema: {
    query: z.string().trim().min(1).describe("Keyword or phrase to search for."),
    difficulty: z
      .enum(["easy", "medium", "hard", "expert", "genius"])
      .nullable()
      .describe("Optional difficulty filter. Use null for all difficulties."),
    limit: z.number().int().min(1).max(50).describe("Maximum number of riddles to return (1-50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, difficulty, limit }) => {
    const needle = query.toLowerCase();
    const matches = riddlesData
      .filter((r) => (difficulty ? r.difficulty === difficulty : true))
      .filter(
        (r) =>
          r.english.toLowerCase().includes(needle) ||
          r.telugu.includes(query) ||
          r.hint.toLowerCase().includes(needle),
      )
      .slice(0, limit)
      .map((r) => ({
        level: r.id,
        telugu: r.telugu,
        english: r.english,
        hint: r.hint,
        difficulty: r.difficulty,
        premium: isPremiumLevel(r.id),
      }));

    const payload = { total: getTotalRiddleCount(), matchCount: matches.length, riddles: matches };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
