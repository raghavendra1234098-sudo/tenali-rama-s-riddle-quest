import { defineTool } from "@lovable.dev/mcp-js";
import riddlesData, { getTotalRiddleCount, getPremiumRiddleCount } from "@/lib/riddlesDatabase";

export default defineTool({
  name: "get_riddle_stats",
  title: "Get riddle collection stats",
  description:
    "Return the total number of riddles, how many are premium, and the count of riddles per difficulty tier.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const byDifficulty = riddlesData.reduce<Record<string, number>>((acc, r) => {
      acc[r.difficulty] = (acc[r.difficulty] ?? 0) + 1;
      return acc;
    }, {});
    const payload = {
      totalRiddles: getTotalRiddleCount(),
      premiumRiddles: getPremiumRiddleCount(),
      byDifficulty,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
