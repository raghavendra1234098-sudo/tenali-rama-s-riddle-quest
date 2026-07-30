import { defineMcp } from "@lovable.dev/mcp-js";
import getRiddleTool from "./tools/get-riddle";
import searchRiddlesTool from "./tools/search-riddles";
import checkAnswerTool from "./tools/check-answer";
import getRiddleStatsTool from "./tools/get-riddle-stats";

export default defineMcp({
  name: "tenali-rama-s-riddle-quest",
  title: "Tenali Rama's Riddle Quest",
  version: "0.1.0",
  instructions:
    "Tools for Tenali Rama's Riddle Quest, a bilingual (Telugu + English) riddle game. Use `get_riddle` to fetch a level's riddle, `search_riddles` to find riddles by keyword or difficulty, `check_answer` to test a guess, and `get_riddle_stats` for collection totals. Answers are never revealed.",
  tools: [getRiddleTool, searchRiddlesTool, checkAnswerTool, getRiddleStatsTool],
});
