import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getRiddle, getTotalRiddleCount, isPremiumLevel } from "../../riddlesDatabase";

export default defineTool({
  name: "get_riddle",
  title: "Get riddle by level",
  description:
    "Fetch the bilingual (Telugu + English) riddle for a given game level, including its hint and difficulty. The answer is never included.",
  inputSchema: {
    level: z.number().int().min(1).describe("Game level number, starting at 1."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ level }) => {
    const total = getTotalRiddleCount();
    if (level > total) {
      return {
        content: [{ type: "text", text: `Level ${level} does not exist. Levels run from 1 to ${total}.` }],
        isError: true,
      };
    }
    const riddle = getRiddle(level);
    const payload = {
      level,
      telugu: riddle.telugu,
      english: riddle.english,
      hint: riddle.hint,
      difficulty: riddle.difficulty,
      premium: isPremiumLevel(riddle.id),
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
