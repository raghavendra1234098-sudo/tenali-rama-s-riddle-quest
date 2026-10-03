import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import riddlesData, { getTotalRiddleCount, isPremiumLevel } from "../../riddlesDatabase";

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
      .filter((r) => {
        const enQ = typeof r.english === 'string' ? r.english : r.english.question;
        const teQ = typeof r.telugu === 'string' ? r.telugu : r.telugu.question;
        const hiQ = typeof r.hindi === 'string' ? r.hindi : (r.hindi?.question || '');
        const hintText = typeof r.hint === 'string' ? r.hint : `${r.hint.en} ${r.hint.te} ${r.hint.hi || ''}`;
        return (
          enQ.toLowerCase().includes(needle) ||
          teQ.includes(query) ||
          hiQ.includes(query) ||
          hintText.toLowerCase().includes(needle)
        );
      })
      .slice(0, limit)
      .map((r) => ({
        level: r.id,
        telugu: typeof r.telugu === 'string' ? r.telugu : r.telugu.question,
        english: typeof r.english === 'string' ? r.english : r.english.question,
        hindi: typeof r.hindi === 'string' ? r.hindi : r.hindi?.question,
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
