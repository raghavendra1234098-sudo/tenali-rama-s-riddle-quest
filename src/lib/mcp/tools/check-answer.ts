import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getRiddle, getTotalRiddleCount } from "../../riddlesDatabase";

export default defineTool({
  name: "check_answer",
  title: "Check a riddle answer",
  description:
    "Check whether a guess solves the riddle at a given level. Returns whether it is correct plus the riddle's hint; it never reveals the answer.",
  inputSchema: {
    level: z.number().int().min(1).describe("Game level number of the riddle being answered."),
    guess: z.string().trim().min(1).describe("The proposed answer, in English or Telugu."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ level, guess }) => {
    const total = getTotalRiddleCount();
    if (level > total) {
      return {
        content: [{ type: "text", text: `Level ${level} does not exist. Levels run from 1 to ${total}.` }],
        isError: true,
      };
    }
    const riddle = getRiddle(level);
    const normalized = guess.toLowerCase().trim();
    const correct = riddle.answer.some((a) => normalized.includes(a.toLowerCase()));
    const payload = { level, guess, correct, hint: riddle.hint };
    return {
      content: [
        {
          type: "text",
          text: correct
            ? `Correct! "${guess}" solves level ${level}.`
            : `Not quite. Hint for level ${level}: ${riddle.hint}`,
        },
      ],
      structuredContent: payload,
    };
  },
});
